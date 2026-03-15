//package onedeoleela.onedeoleela.Controller;
//
//import lombok.RequiredArgsConstructor;
//import onedeoleela.onedeoleela.Entity.LiveTracking;
//import onedeoleela.onedeoleela.Service.LiveTrackingService;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/live-tracking")
//@RequiredArgsConstructor
//@CrossOrigin("*")
//public class LiveTrackingController {
//
//    private final LiveTrackingService service;
//
//    /* DISPATCH MAP */
//    @GetMapping
//    public List<LiveTracking> getAll(){
//        return service.getAll();
//    }
//
//    /* DRIVER GPS UPDATE */
//    @PostMapping("/update")
//    public LiveTracking update(@RequestBody LiveTracking data){
//        return service.updateLocation(data);
//    }
//    @GetMapping("/vehicle/{vehicleNumber}")
//    public LiveTracking getVehicle(@PathVariable String vehicleNumber){
//        return service.getByVehicleNumber(vehicleNumber);
//    }
//}

//package onedeoleela.onedeoleela.Controller;
//
//import lombok.RequiredArgsConstructor;
//import onedeoleela.onedeoleela.Entity.LiveTracking;
//import onedeoleela.onedeoleela.Service.LiveTrackingService;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/live-tracking")
//@RequiredArgsConstructor
//@CrossOrigin("*")
//public class LiveTrackingController {
//
//    private final LiveTrackingService service;
//
//    // Driver sends only GPS
////    @PostMapping("/update")
////    public LiveTracking updateLocation(@RequestBody LiveTracking tracking) {
////        System.out.println("Incoming Trip ID: " + tracking.getTripId());
////
////        return service.saveLocation(
////
////                tracking.getTripId(),
////                tracking.getVehicleNumber(),
////                tracking.getDriverName(),
////                tracking.getLat(),
////                tracking.getLng()
////        );
////    }
//    @PostMapping("/update")
//    public LiveTracking updateLocation(@RequestBody LiveTracking tracking) {
//
//        System.out.println("TripId: " + tracking.getTripId());
//        System.out.println("Lat: " + tracking.getLat());
//        System.out.println("Lng: " + tracking.getLng());
//
//        return service.saveLocation(
//                tracking.getTripId(),
//                tracking.getVehicleNumber(),
//                tracking.getDriverName(),
//                tracking.getLat(),
//                tracking.getLng()
//        );
//    }
//
//    // Dispatch fetch latest
//    @GetMapping("/latest/{tripId}")
//    public LiveTracking getLatest(@PathVariable Long tripId) {
//        return service.getLatestLocation(tripId);
//    }
//
//    // Dispatch fetch full route
//    @GetMapping("/history/{tripId}")
//    public List<LiveTracking> getHistory(@PathVariable Long tripId) {
//        return service.getFullHistory(tripId);
//    }
//}


//package onedeoleela.onedeoleela.Controller;
//
//import lombok.RequiredArgsConstructor;
//import onedeoleela.onedeoleela.Entity.LiveTracking;
//import onedeoleela.onedeoleela.Service.LiveTrackingService;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/live-tracking")
//@RequiredArgsConstructor
//@CrossOrigin("*")
//public class LiveTrackingController {
//
//    private final LiveTrackingService service;
//
//    /* =========================================================
//       🔥 DRIVER GPS UPDATE
//       Frontend sends only tripId, lat, lng
//       Backend fills vehicleNumber & driverName automatically
//       ========================================================= */
//    @PostMapping("/update")
//    public LiveTracking updateLocation(@RequestBody LiveTracking tracking) {
//
//        System.out.println("TripId: " + tracking.getTripId());
//        System.out.println("Lat: " + tracking.getLat());
//        System.out.println("Lng: " + tracking.getLng());
//
//        return service.saveLocation(
//                tracking.getTripId(),
//                tracking.getLat(),
//                tracking.getLng()
//        );
//    }
//
//    /* =========================================================
//       🔥 DISPATCH - Fetch latest GPS location
//       ========================================================= */
//    @GetMapping("/latest/{tripId}")
//    public LiveTracking getLatest(@PathVariable Long tripId) {
//        return service.getLatestLocation(tripId);
//    }
//
//    /* =========================================================
//       🔥 DISPATCH - Fetch full GPS history
//       ========================================================= */
//    @GetMapping("/history/{tripId}")
//    public List<LiveTracking> getHistory(@PathVariable Long tripId) {
//        return service.getFullHistory(tripId);
//    }
//}


package onedeoleela.onedeoleela.Controller;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.LiveTracking;
import onedeoleela.onedeoleela.Service.LiveTrackingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/live-tracking")
@RequiredArgsConstructor
@CrossOrigin("*")
public class LiveTrackingController {

    private final LiveTrackingService liveTrackingService;

    /**
     * Driver sends GPS update every 10s.
     * Backend ensures all VehicleActivityTrack statuses are represented in LiveTracking.
     */
    @PostMapping("/update")
    public List<LiveTracking> updateLocation(@RequestBody LiveTracking tracking) {

        if (tracking.getTripId() == null || tracking.getLat() == null || tracking.getLng() == null) {
            throw new IllegalArgumentException("TripId and coordinates are required");
        }

        return liveTrackingService.saveOrUpdateLiveTracking(
                tracking.getTripId(),
                tracking.getLat(),
                tracking.getLng()
        );
    }

    /**
     * Fetch latest GPS location for a trip
     */
    @GetMapping("/latest/{tripId}")
    public LiveTracking getLatest(@PathVariable Long tripId) {
        return liveTrackingService.getLatestLocation(tripId);
    }

    /**
     * Fetch full GPS history for a trip
     */
    @GetMapping("/history/{tripId}")
    public List<LiveTracking> getFullHistory(@PathVariable Long tripId) {
        return liveTrackingService.getFullHistory(tripId);
    }
}