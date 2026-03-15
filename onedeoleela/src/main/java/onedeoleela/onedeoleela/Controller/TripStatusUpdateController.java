package onedeoleela.onedeoleela.Controller;


import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.TripStatusEnum;
import onedeoleela.onedeoleela.Entity.TripStatusUpdate;
import onedeoleela.onedeoleela.Service.TripStatusUpdateService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-status-update")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TripStatusUpdateController {

    private final TripStatusUpdateService service;

    // ✅ Update the status of a trip step by step
    @PatchMapping("/trip/{tripId}/status")
    public TripStatusUpdate updateStatus(@PathVariable Long tripId,
                                         @RequestParam TripStatusEnum status) {
        return service.updateStatusByTripId(tripId, status);
    }

    // ✅ Quickly acknowledge a trip (only once)
    @PatchMapping("/trip/{tripId}/acknowledge")
    public TripStatusUpdate acknowledge(@PathVariable Long tripId) {
        return service.acknowledgeTrip(tripId);
    }

    // ✅ Create a new TripStatus entry for a trip
    @PostMapping("/trip/{tripId}/create")
    public TripStatusUpdate createTripStatus(@PathVariable Long tripId) {
        return service.createTripStatusForTrip(tripId);
    }

    // ✅ Get all trips assigned to a driver
    @GetMapping("/driver/{driverECode}")
    public List<TripStatusUpdate> getDriverTrips(@PathVariable Integer driverECode) {
        return service.getDriverTripsByECode(driverECode);
    }

    // ✅ Get latest status of a trip
    @GetMapping("/trip/{tripId}/latest")
    public TripStatusUpdate getLatestStatus(@PathVariable Long tripId) {
        return service.getLatestStatusByTripId(tripId);
    }
}