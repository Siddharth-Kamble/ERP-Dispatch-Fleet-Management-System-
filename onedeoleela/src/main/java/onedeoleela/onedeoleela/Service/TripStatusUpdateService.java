package onedeoleela.onedeoleela.Service;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.*;
import onedeoleela.onedeoleela.Repository.TripRepository;
import onedeoleela.onedeoleela.Repository.TripStatusUpdateRepository;
import onedeoleela.onedeoleela.Repository.VehicleActivityTrackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripStatusUpdateService {

    private final TripStatusUpdateRepository statusRepo;
    private final TripRepository tripRepo;
    private final VehicleActivityTrackRepository activityRepo;

    // ================= STATUS FLOW =================
    private final List<TripStatusEnum> STATUS_FLOW = Arrays.asList(
            TripStatusEnum.ACKNOWLEDGED,
            TripStatusEnum.LOADING_STARTED,
            TripStatusEnum.LOADING_COMPLETED,
            TripStatusEnum.IN_TRANSIT,
            TripStatusEnum.REACHED_DESTINATION,
            TripStatusEnum.UNLOADING_STARTED,
            TripStatusEnum.UNLOADING_COMPLETED,
            TripStatusEnum.RETURN_JOURNEY_STARTED,
            TripStatusEnum.RETURN_JOURNEY_COMPLETED
    );

    // =====================================================
    // CREATE INITIAL STATUS RECORD
    // =====================================================
    @Transactional
    public TripStatusUpdate createTripStatusForTrip(Long tripId) {

        Trip trip = tripRepo.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        return statusRepo.findByTrip_Id(tripId).orElseGet(() -> {

            TripStatusUpdate tsu = new TripStatusUpdate();
            tsu.setTrip(trip);
            tsu.setDriverName(trip.getDriverName());
            tsu.setDriverECode(trip.getDriverECode());
            tsu.setVehicleNumber(trip.getVehicleNumber());
            tsu.setAssignedAt(LocalDateTime.now());
            tsu.setStatus(null);

            return statusRepo.save(tsu);
        });
    }

    // =====================================================
    // ACKNOWLEDGE TRIP
    // =====================================================
    @Transactional
    public TripStatusUpdate acknowledgeTrip(Long tripId) {

        Trip trip = tripRepo.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        TripStatusUpdate status = statusRepo.findByTrip(trip)
                .orElseGet(() -> {
                    TripStatusUpdate newStatus = new TripStatusUpdate();
                    newStatus.setTrip(trip);
                    return newStatus;
                });

        status.setStatus(TripStatusEnum.ACKNOWLEDGED);
        status.setAcknowledgedAt(LocalDateTime.now());

        return statusRepo.save(status);
    }

    // =====================================================
    // UPDATE STATUS (FORWARD ONLY)
    // =====================================================
    @Transactional
    public TripStatusUpdate updateStatusByTripId(Long tripId, TripStatusEnum nextStatus) {

        TripStatusUpdate tsu = statusRepo.findByTrip_Id(tripId)
                .orElseGet(() -> createTripStatusForTrip(tripId));

        TripStatusEnum currentStatus = tsu.getStatus();

        int nextIndex = STATUS_FLOW.indexOf(nextStatus);

        if (nextIndex == -1) {
            throw new RuntimeException("Invalid status step: " + nextStatus);
        }

        // FIRST UPDATE
        if (currentStatus == null) {

            for (int i = 0; i <= nextIndex; i++) {
                applyStatus(tsu, tripId, STATUS_FLOW.get(i));
            }

            return tsu;
        }

        int currentIndex = STATUS_FLOW.indexOf(currentStatus);

        // Prevent duplicate
        if (currentStatus == nextStatus) {
            return tsu;
        }

        // Allow forward only
        if (nextIndex > currentIndex) {

            for (int i = currentIndex + 1; i <= nextIndex; i++) {
                applyStatus(tsu, tripId, STATUS_FLOW.get(i));
            }

            return tsu;
        }

        throw new RuntimeException(
                "Invalid status transition. Current: "
                        + currentStatus + ", Attempted: " + nextStatus
        );
    }

    // =====================================================
    // APPLY STATUS (UPDATE ALL TABLES)
    // =====================================================
    private void applyStatus(TripStatusUpdate tsu,
                             Long tripId,
                             TripStatusEnum status) {

        // Update TripStatusUpdate table
        tsu.setStatus(status);
        setTimestampForStatus(tsu, status);
        statusRepo.save(tsu);

        // Update Trip table
        Trip trip = tripRepo.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        trip.setStatus(status);
        tripRepo.save(trip);

        // Log activity
        VehicleActivityTrack activity = new VehicleActivityTrack();
        activity.setTripId(tripId);
        activity.setStatus(status);
        activity.setEventTime(LocalDateTime.now());

        activityRepo.save(activity);
    }

    // =====================================================
    // GET LATEST STATUS
    // =====================================================
    @Transactional(readOnly = true)
    public TripStatusUpdate getLatestStatusByTripId(Long tripId) {
        return statusRepo.findByTrip_Id(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip status not found for tripId: " + tripId)
                );
    }

    // =====================================================
    // GET DRIVER TRIPS
    // =====================================================
//    @Transactional(readOnly = true)
//    public List<TripStatusUpdate> getDriverTripsByECode(Integer driverECode) {
//        return statusRepo.findByDriverECode(driverECode);
//
//    }

    @Transactional(readOnly = true)
    public List<TripStatusUpdate> getDriverTripsByECode(Integer driverECode) {
        // 1. You must fetch the data from the repo FIRST and store it in 'trips'
        List<TripStatusUpdate> trips = statusRepo.findByDriverECode(driverECode);

        // 2. Now you can use 'trips.stream()'
        return trips.stream()
                .filter(tsu -> tsu.getTrip() != null &&
                        tsu.getTrip().getStatus() != TripStatusEnum.CANCELLED)
                .toList();
    }

    // =====================================================
    // SET TIMESTAMPS
    // =====================================================
    private void setTimestampForStatus(TripStatusUpdate tsu,
                                       TripStatusEnum status) {

        LocalDateTime now = LocalDateTime.now();

        switch (status) {

            case ACKNOWLEDGED -> tsu.setAcknowledgedAt(now);

            case LOADING_STARTED -> tsu.setLoadingStartedAt(now);

            case LOADING_COMPLETED -> tsu.setLoadingCompletedAt(now);

            case IN_TRANSIT -> tsu.setInTransitAt(now);

            case REACHED_DESTINATION -> tsu.setReachedDestinationAt(now);

            case UNLOADING_STARTED -> tsu.setUnloadingStartedAt(now);

            case UNLOADING_COMPLETED -> tsu.setUnloadingCompletedAt(now);

            case RETURN_JOURNEY_STARTED -> tsu.setReturnJourneyStartedAt(now);

            case RETURN_JOURNEY_COMPLETED -> tsu.setReturnJourneyCompletedAt(now);
        }
    }
}