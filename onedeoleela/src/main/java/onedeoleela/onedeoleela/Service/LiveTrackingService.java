//package onedeoleela.onedeoleela.Service;
//
//import lombok.RequiredArgsConstructor;
//import onedeoleela.onedeoleela.Entity.LiveTracking;
//import onedeoleela.onedeoleela.Repository.LiveTrackingRepository;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class LiveTrackingService {
//
//    private final LiveTrackingRepository repo;
//
//    /* SAVE OR UPDATE LOCATION */
//    public LiveTracking updateLocation(LiveTracking data){
//
//        LiveTracking tracking =
//                repo.findByVehicleNumber(data.getVehicleNumber())
//                        .orElse(new LiveTracking());
//
//        tracking.setVehicleNumber(data.getVehicleNumber());
//        tracking.setDriverName(data.getDriverName());
//        tracking.setLat(data.getLat());
//        tracking.setLng(data.getLng());
//        tracking.setStatus(data.getStatus());
//
//        return repo.save(tracking);
//    }
//
//    public List<LiveTracking> getAll(){
//        return repo.findAll();
//    }public LiveTracking getByVehicleNumber(String vehicleNumber) {
//        return repo.findByVehicleNumber(vehicleNumber)
//                .orElse(null); // returns null if not found
//    }
//}


//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import onedeoleela.onedeoleela.Entity.LiveTracking;
//import onedeoleela.onedeoleela.Entity.TripStatusEnum;
//import onedeoleela.onedeoleela.Entity.VehicleActivityTrack;
//import onedeoleela.onedeoleela.Repository.LiveTrackingRepository;
//import onedeoleela.onedeoleela.Repository.VehicleActivityTrackRepository;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class LiveTrackingService {
//
//    private final LiveTrackingRepository liveRepo;
//    private final VehicleActivityTrackRepository activityRepo;
//
//    /* =========================================================
//       🔥 SAVE GPS LOCATION (PRODUCTION SMART HANDLING)
//       ========================================================= */
//    public LiveTracking saveLocation(Long tripId,
//                                     String vehicleNumber,
//                                     String driverName,
//                                     Double lat,
//                                     Double lng) {
//
//        // 1️⃣ Smart Ignore — Trip ID missing
//        if (tripId == null) {
//            log.warn("⚠ GPS ignored - tripId is null");
//            return null;
//        }
//
//        // 2️⃣ Smart Ignore — Invalid coordinates
//        if (lat == null || lng == null) {
//            log.warn("⚠ GPS ignored - Invalid coordinates for trip {}", tripId);
//            return null;
//        }
//
//        // 3️⃣ Fetch latest trip activity
//        VehicleActivityTrack latestActivity =
//                activityRepo
//                        .findTopByTripIdOrderByEventTimeDesc(tripId)
//                        .orElse(null);
//
//        // Smart Ignore — Trip not initialized yet
//        if (latestActivity == null) {
//            log.warn("⚠ GPS ignored - No activity found for trip {}", tripId);
//            return null;
//        }
//
//        TripStatusEnum currentStatus = latestActivity.getStatus();
//
//        // 4️⃣ Auto-stop if journey completed
//        if (currentStatus == TripStatusEnum.RETURN_JOURNEY_COMPLETED) {
//            log.info("🛑 GPS ignored - Journey completed for trip {}", tripId);
//            return null;
//        }
//
//        // 5️⃣ Allow tracking only in valid range
//        if (!isTrackableStatus(currentStatus)) {
//            log.warn("⚠ GPS ignored - Status {} not trackable for trip {}",
//                    currentStatus, tripId);
//            return null;
//        }
//
//        // 6️⃣ Save GPS (Full History Architecture)
//        LiveTracking tracking = new LiveTracking();
//        tracking.setTripId(tripId);
//        tracking.setVehicleNumber(vehicleNumber);
//        tracking.setDriverName(driverName);
//        tracking.setLat(lat);
//        tracking.setLng(lng);
//        tracking.setStatus(currentStatus);
//        tracking.setRecordedAt(LocalDateTime.now());
//
//        log.info("📍 GPS saved for trip {} at {}, {}",
//                tripId, lat, lng);
//
//        return liveRepo.save(tracking);
//    }
//
//    /* =========================================================
//       🔥 FULL GPS HISTORY PER TRIP
//       ========================================================= */
//    public List<LiveTracking> getFullHistory(Long tripId) {
//
//        if (tripId == null) {
//            throw new IllegalArgumentException("Trip ID required");
//        }
//
//        return liveRepo.findByTripIdOrderByRecordedAtAsc(tripId);
//    }
//
//    /* =========================================================
//       🔥 LATEST GPS LOCATION
//       ========================================================= */
//    public LiveTracking getLatestLocation(Long tripId) {
//
//        if (tripId == null) {
//            throw new IllegalArgumentException("Trip ID required");
//        }
//
//        return liveRepo.findTopByTripIdOrderByRecordedAtDesc(tripId)
//                .orElseThrow(() ->
//                        new IllegalArgumentException(
//                                "No GPS data found for trip ID: " + tripId));
//    }
//
//    /* =========================================================
//       🔥 TRACKABLE STATUS CHECK
//       ========================================================= */
//    private boolean isTrackableStatus(TripStatusEnum status) {
//
//        if (status == null) return false;
//
//        return status.compareTo(TripStatusEnum.ACKNOWLEDGED) >= 0 &&
//                status.compareTo(TripStatusEnum.RETURN_JOURNEY_COMPLETED) < 0;
//    }
//}





//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import onedeoleela.onedeoleela.Entity.LiveTracking;
//import onedeoleela.onedeoleela.Entity.TripStatusEnum;
//import onedeoleela.onedeoleela.Entity.VehicleActivityTrack;
//import onedeoleela.onedeoleela.Entity.Trip;
//import onedeoleela.onedeoleela.Repository.LiveTrackingRepository;
//import onedeoleela.onedeoleela.Repository.VehicleActivityTrackRepository;
//import onedeoleela.onedeoleela.Repository.TripRepository;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class LiveTrackingService {
//
//    private final LiveTrackingRepository liveRepo;
//    private final VehicleActivityTrackRepository activityRepo;
//    private final TripRepository tripRepo; // new repository to fetch trip details
//
//    /* =========================================================
//       🔥 SAVE GPS LOCATION (PRODUCTION SMART HANDLING)
//       ========================================================= */
//    public LiveTracking saveLocation(Long tripId,
//                                     Double lat,
//                                     Double lng) {
//
//        // 1️⃣ Smart Ignore — Trip ID missing
//        if (tripId == null) {
//            log.warn("⚠ GPS ignored - tripId is null");
//            return null;
//        }
//
//        // 2️⃣ Smart Ignore — Invalid coordinates
//        if (lat == null || lng == null) {
//            log.warn("⚠ GPS ignored - Invalid coordinates for trip {}", tripId);
//            return null;
//        }
//
//        // 3️⃣ Fetch latest trip activity
//        VehicleActivityTrack latestActivity =
//                activityRepo
//                        .findTopByTripIdOrderByEventTimeDesc(tripId)
//                        .orElse(null);
//
//        if (latestActivity == null) {
//            log.warn("⚠ GPS ignored - No activity found for trip {}", tripId);
//            return null;
//        }
//
//        TripStatusEnum currentStatus = latestActivity.getStatus();
//
//        // 4️⃣ Auto-stop if journey completed
//        if (currentStatus == TripStatusEnum.RETURN_JOURNEY_COMPLETED) {
//            log.info("🛑 GPS ignored - Journey completed for trip {}", tripId);
//            return null;
//        }
//
//        // 5️⃣ Allow tracking only in valid range
//        if (!isTrackableStatus(currentStatus)) {
//            log.warn("⚠ GPS ignored - Status {} not trackable for trip {}",
//                    currentStatus, tripId);
//            return null;
//        }
//
//        // 6️⃣ Fetch trip details for vehicleNumber and driverName
//        Trip trip = tripRepo.findById(tripId)
//                .orElseThrow(() -> new RuntimeException("Trip not found for tripId: " + tripId));
//
//        // 7️⃣ Save GPS (Full History Architecture)
//        LiveTracking tracking = new LiveTracking();
//        tracking.setTripId(tripId);
//        tracking.setVehicleNumber(trip.getVehicleNumber()); // auto-populated
//        tracking.setDriverName(trip.getDriverName());       // auto-populated
//        tracking.setLat(lat);
//        tracking.setLng(lng);
//        tracking.setStatus(currentStatus);
//        tracking.setRecordedAt(LocalDateTime.now());
//
//        log.info("📍 GPS saved for trip {} ({}) at {}, {}",
//                tripId, currentStatus, lat, lng);
//
//        return liveRepo.save(tracking);
//    }
//
//    /* =========================================================
//       🔥 FULL GPS HISTORY PER TRIP
//       ========================================================= */
//    public List<LiveTracking> getFullHistory(Long tripId) {
//
//        if (tripId == null) {
//            throw new IllegalArgumentException("Trip ID required");
//        }
//
//        return liveRepo.findByTripIdOrderByRecordedAtAsc(tripId);
//    }
//
//    /* =========================================================
//       🔥 LATEST GPS LOCATION
//       ========================================================= */
//    public LiveTracking getLatestLocation(Long tripId) {
//
//        if (tripId == null) {
//            throw new IllegalArgumentException("Trip ID required");
//        }
//
//        return liveRepo.findTopByTripIdOrderByRecordedAtDesc(tripId)
//                .orElseThrow(() ->
//                        new IllegalArgumentException(
//                                "No GPS data found for trip ID: " + tripId));
//    }
//
//    /* =========================================================
//       🔥 TRACKABLE STATUS CHECK
//       ========================================================= */
//    private boolean isTrackableStatus(TripStatusEnum status) {
//
//        if (status == null) return false;
//
//        return status.compareTo(TripStatusEnum.ACKNOWLEDGED) >= 0 &&
//                status.compareTo(TripStatusEnum.RETURN_JOURNEY_COMPLETED) < 0;
//    }
//}







package onedeoleela.onedeoleela.Service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import onedeoleela.onedeoleela.Entity.LiveTracking;
import onedeoleela.onedeoleela.Entity.VehicleActivityTrack;
import onedeoleela.onedeoleela.Repository.LiveTrackingRepository;
import onedeoleela.onedeoleela.Repository.VehicleActivityTrackRepository;
import onedeoleela.onedeoleela.Repository.TripRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiveTrackingService {

    private final LiveTrackingRepository liveRepo;
    private final VehicleActivityTrackRepository activityRepo;
    private final TripRepository tripRepo;

    /**
     * Save or update LiveTracking for a trip.
     * Ensures all VehicleActivityTrack statuses are represented.
     */
    public List<LiveTracking> saveOrUpdateLiveTracking(Long tripId, Double lat, Double lng) {

        var tripOpt = tripRepo.findById(tripId);
        if (tripOpt.isEmpty()) {
            log.warn("⚠ Trip not found for id {}", tripId);
            return new ArrayList<>();
        }

        var trip = tripOpt.get();
        String vehicleNumber = trip.getVehicleNumber();
        String driverName = trip.getDriverName();

        // Get all statuses for this trip from VehicleActivityTrack
        List<VehicleActivityTrack> activities = activityRepo.findByTripIdOrderByEventTimeAsc(tripId);
        List<LiveTracking> updatedTracks = new ArrayList<>();

        for (VehicleActivityTrack activity : activities) {
            // Check if this status already exists in LiveTracking
            var existingOpt = liveRepo.findTopByTripIdAndStatus(tripId, activity.getStatus());

            LiveTracking tracking;
            if (existingOpt.isPresent()) {
                // Update coordinates for the existing status
                tracking = existingOpt.get();
                tracking.setLat(lat);
                tracking.setLng(lng);
                tracking.setRecordedAt(LocalDateTime.now());
                log.info("🔄 Updated GPS for trip {} status {}", tripId, activity.getStatus());
            } else {
                // Insert new LiveTracking row
                tracking = new LiveTracking();
                tracking.setTripId(tripId);
                tracking.setVehicleNumber(vehicleNumber);
                tracking.setDriverName(driverName);
                tracking.setStatus(activity.getStatus());
                tracking.setLat(lat);
                tracking.setLng(lng);
                tracking.setRecordedAt(LocalDateTime.now());
                log.info("📍 New GPS row for trip {} status {}", tripId, activity.getStatus());
            }

            updatedTracks.add(liveRepo.save(tracking));
        }

        return updatedTracks;
    }

    /**
     * Get latest LiveTracking location
     */
    public LiveTracking getLatestLocation(Long tripId) {
        return liveRepo.findTopByTripIdOrderByRecordedAtDesc(tripId).orElse(null);
    }

    /**
     * Get full LiveTracking history
     */
    public List<LiveTracking> getFullHistory(Long tripId) {
        return liveRepo.findByTripIdOrderByRecordedAtAsc(tripId);
    }
}