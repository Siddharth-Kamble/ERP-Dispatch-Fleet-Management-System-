package onedeoleela.onedeoleela.Service;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.*;
import onedeoleela.onedeoleela.Repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepo;
    private final UserRepository userRepo;
    private final VehicleRepository vehicleRepo;
    private final VehicleActivityTrackRepository vehicleActivityTrackRepo;
    private final VehicleReplacementLogRepository vehicleReplacementLogRepository;
    private final VehicleRequisitionRepository requisitionRepo;

    // CREATE TRIP MANUAL
    public Trip createTrip(Trip trip) {

        User user = userRepo.findByFullName(trip.getDriverName())
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Vehicle vehicle = vehicleRepo.findByVehicleNumber(trip.getVehicleNumber())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        trip.setDriverECode(user.getECode().intValue());
        trip.setDriverId(user.getId());
        trip.setVehicleId(vehicle.getId());

        trip.setStatus(TripStatusEnum.ASSIGNED);

        return tripRepo.save(trip);
    }

    // AUTO GROUP TRIP
    public Trip createTripWithGroupedRequisitions(
            String driverName,
            String vehicleNumber,
            String locationFrom
    ) {

        User user = userRepo.findByFullName(driverName)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Vehicle vehicle = vehicleRepo.findByVehicleNumber(vehicleNumber)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        List<VehicleRequisition> pendingRequisitions =
                requisitionRepo.findByStatus(RequisitionStatus.PENDING);

        List<VehicleRequisition> grouped =
                pendingRequisitions.stream()
                        .filter(r ->
                                r.getLocationFrom().equalsIgnoreCase(locationFrom)
                                        && r.getRequisitionDate().equals(LocalDate.now())
                        )
                        .collect(Collectors.toList());

        if (grouped.isEmpty()) {
            throw new RuntimeException("No requisitions found for this route");
        }

        Trip trip = new Trip();

        trip.setDriverName(driverName);
        trip.setVehicleNumber(vehicleNumber);
        trip.setDriverId(user.getId());
        trip.setDriverECode(user.getECode().intValue());
        trip.setVehicleId(vehicle.getId());
        trip.setTripDate(LocalDateTime.now());
        trip.setStatus(TripStatusEnum.ASSIGNED);

        Trip savedTrip = tripRepo.save(trip);

        for (VehicleRequisition req : grouped) {

            req.setTrip(savedTrip);
            req.setStatus(RequisitionStatus.ASSIGNED);

            requisitionRepo.save(req);
        }

        return savedTrip;
    }

    // GET ALL TRIPS
    public List<Trip> getAllTrips() {
        return tripRepo.findAllByOrderByTripDateDesc();
    }

    // DRIVER TRIPS
    public List<Trip> getTripsByDriver(Long driverId) {
        return tripRepo.findByDriverId(driverId);
    }

    // VEHICLE TRIPS
    public List<Trip> getTripsByVehicle(Long vehicleId) {
        return tripRepo.findByVehicleId(vehicleId);
    }

    // STATUS TRIPS
    public List<Trip> getTripsByStatus(TripStatusEnum status) {
        return tripRepo.findByStatus(status);
    }

    // ================= ACTIVE VEHICLES =================

    public List<String> getActiveVehicles() {

        return tripRepo.findByStatus(TripStatusEnum.ASSIGNED)
                .stream()
                .map(Trip::getVehicleNumber)
                .distinct()
                .collect(Collectors.toList());
    }

    // ================= INACTIVE VEHICLES =================

    public List<String> getInactiveVehicles() {

        List<String> activeVehicles = getActiveVehicles();

        return vehicleRepo.findAll()
                .stream()
                .map(Vehicle::getVehicleNumber)
                .filter(v -> !activeVehicles.contains(v))
                .collect(Collectors.toList());
    }

    // VEHICLE REPLACEMENT
    public void replaceVehicle(Long tripId, String newVehicle, String reason, String user) {

        Trip trip = tripRepo.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        VehicleReplacementLog log = new VehicleReplacementLog();

        log.setTripId(tripId);
        log.setOldVehicleNumber(trip.getVehicleNumber());
        log.setNewVehicleNumber(newVehicle);
        log.setReason(reason);
        log.setChangedBy(user);

        vehicleReplacementLogRepository.save(log);

        trip.setVehicleNumber(newVehicle);

        tripRepo.save(trip);
    }
//    public List<Trip> getTripsForDriverToday(Integer driverECode) {
//        LocalDate today = LocalDate.now();
//        LocalDateTime startOfDay = today.atStartOfDay();
//        LocalDateTime startOfTomorrow = today.plusDays(1).atStartOfDay();
//
//        // Fetch all trips for today
//        List<Trip> tripsToday = tripRepo.findByDriverECodeAndTripDateBetween(driverECode, startOfDay, startOfTomorrow);
//
//        // Get trip IDs
//        List<Long> tripIds = tripsToday.stream().map(Trip::getId).toList();
//
//        // Fetch VehicleActivityTrack entries for these trips
//
//
//        List<VehicleActivityTrack> activities = vehicleActivityTrackRepo.findByTripIdIn(tripIds);
//
//        // Remove trips that already have activity entries
//        List<Long> tripsWithActivity = activities.stream().map(VehicleActivityTrack::getTripId).toList();
//        tripsToday.removeIf(trip -> tripsWithActivity.contains(trip.getId()));
//
//        return tripsToday;
//    }

    public List<Trip> getTripsForDriverToday(Integer driverECode) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime startOfTomorrow = today.plusDays(1).atStartOfDay();

        // 1. Fetch all trips for today
        List<Trip> tripsToday = tripRepo.findByDriverECodeAndTripDateBetween(driverECode, startOfDay, startOfTomorrow);

        // --- NEW LOGIC START ---
        // 2. Remove trips that are marked as CANCELLED so they don't appear as new requests
        tripsToday.removeIf(trip -> trip.getStatus() == TripStatusEnum.CANCELLED);
        // --- NEW LOGIC END ---

        // 3. Get remaining trip IDs
        List<Long> tripIds = tripsToday.stream().map(Trip::getId).toList();

        // 4. Fetch VehicleActivityTrack entries for these trips
        List<VehicleActivityTrack> activities = vehicleActivityTrackRepo.findByTripIdIn(tripIds);

        // 5. Remove trips that already have activity entries
        List<Long> tripsWithActivity = activities.stream().map(VehicleActivityTrack::getTripId).toList();
        tripsToday.removeIf(trip -> tripsWithActivity.contains(trip.getId()));

        return tripsToday;
    }
    public List<Trip> getFilteredLatestTrips(String vNum, TripStatusEnum status, LocalDate sDate, LocalDate eDate, int limitSize) {
        // Convert empty string search to null for the query
        String searchNum = (vNum != null && vNum.trim().isEmpty()) ? null : vNum;

        // Create a page request for the first 'n' results
        Pageable topFifty = PageRequest.of(0, limitSize);

        return tripRepo.findWithFilters(searchNum, status, sDate, eDate, topFifty);
    }
    public Trip getTripById(Long tripId) {
        return tripRepo.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }


}