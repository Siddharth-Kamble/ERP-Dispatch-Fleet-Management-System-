package onedeoleela.onedeoleela.Service;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.Trip;
import onedeoleela.onedeoleela.Entity.TripCancellation;
import onedeoleela.onedeoleela.Entity.TripStatusEnum;
import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Repository.TripCancellationRepository;
import onedeoleela.onedeoleela.Repository.TripRepository;
import onedeoleela.onedeoleela.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TripCancellationService {

    private final TripCancellationRepository cancellationRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    /**
     * Processes a trip rejection by a driver.
     * Records the cancellation reason and updates the trip status.
     */
    @Transactional
    public void processCancellation(Long tripId, String eCode, String reason, String remarks) {
        // 1. Find the Trip from the database
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));

        // 2. Create and populate the Cancellation Audit Log
        TripCancellation log = new TripCancellation();
        log.setTripId(tripId);

        // Capture the vehicle number so the log remains valid even if the trip is modified
        log.setVehicleNumber(trip.getVehicleNumber());

        // Convert the String eCode from the request to Long to match your Entity
        log.setECode(Long.parseLong(eCode));

        log.setReason(reason);
        log.setRemarks(remarks);
        log.setCancelledAt(LocalDateTime.now());

        // 3. Save the log entry
        cancellationRepository.save(log);


        // This removes it from the driver's current list
        trip.setStatus(TripStatusEnum.CANCELLED);
        tripRepository.save(trip);
    }

    /**
     * Fetches all cancellation logs for Admin view.
     */
    public List<TripCancellation> getAllLogs() {
        return cancellationRepository.findAll();
    }
    public List<TripCancellation> getLogsByDriver(String eCode) {
        return cancellationRepository. findByDriverECode(eCode);
    }
    public Map<String, Object> getCancellationDetailsWithDriver(Long tripId) {
        // 1. Find the cancellation record
        TripCancellation cancellation = cancellationRepository.findByTripId(tripId)
                .orElseThrow(() -> new RuntimeException("No cancellation found for Trip ID: " + tripId));

        // 2. Find the Driver (User) by eCode
        String driverName = userRepository.findByeCode(cancellation.getECode())
                .map(User::getFullName) // Assuming your User entity has getFullName()
                .orElse("Unknown Driver (" + cancellation.getECode() + ")");

        // 3. Combine data into a Map to send to React
        Map<String, Object> response = new HashMap<>();
        response.put("tripId", cancellation.getTripId());
        response.put("reason", cancellation.getReason());
        response.put("remarks", cancellation.getRemarks());
        response.put("cancelledAt", cancellation.getCancelledAt()); // Assuming this field exists
        response.put("driverName", driverName);
        response.put("eCode", cancellation.getECode());

        return response;
    }
}