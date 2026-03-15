package onedeoleela.onedeoleela.Controller;


import onedeoleela.onedeoleela.Entity.VehicleActivityTrack;
import onedeoleela.onedeoleela.Entity.Trip;
import onedeoleela.onedeoleela.Service.VehicleActivityTrackService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle-activity")
@CrossOrigin(origins = "*")
public class VehicleActivityTrackController {

    private final VehicleActivityTrackService service;

    public VehicleActivityTrackController(VehicleActivityTrackService service) {
        this.service = service;
    }

    // Get all trips for live tracking
    @GetMapping("/latest-trips")
    public List<Trip> getAllTrips() {
        return service.getAllActiveTrips();
    }

    // Get history for a specific trip
    @GetMapping("/history/{tripId}")
    public List<VehicleActivityTrack> getTripHistory(@PathVariable Long tripId) {
        return service.getTripHistory(tripId);
    }
}