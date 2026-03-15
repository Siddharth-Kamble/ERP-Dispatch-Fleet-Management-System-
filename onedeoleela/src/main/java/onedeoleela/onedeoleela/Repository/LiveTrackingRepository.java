//package onedeoleela.onedeoleela.Repository;
//
//import onedeoleela.onedeoleela.Entity.LiveTracking;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.Optional;
//
//public interface LiveTrackingRepository
//        extends JpaRepository<LiveTracking, Long> {
//
//    /* 🔥 FIND EXISTING VEHICLE LOCATION */
//    Optional<LiveTracking> findByVehicleNumber(String vehicleNumber);
//}
package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.LiveTracking;
import onedeoleela.onedeoleela.Entity.TripStatusEnum;
import onedeoleela.onedeoleela.Entity.VehicleActivityTrack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LiveTrackingRepository extends JpaRepository<LiveTracking, Long> {

    // Full GPS history
    List<LiveTracking> findByTripIdOrderByRecordedAtAsc(Long tripId);

    // Latest GPS location
    Optional<LiveTracking> findTopByTripIdOrderByRecordedAtDesc(Long tripId);

    // Existing row for a particular status
    Optional<LiveTracking> findTopByTripIdAndStatus(Long tripId, TripStatusEnum status);
}