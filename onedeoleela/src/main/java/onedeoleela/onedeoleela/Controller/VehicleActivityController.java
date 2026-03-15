package onedeoleela.onedeoleela.Controller;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.VehicleActivity;
import onedeoleela.onedeoleela.Service.VehicleActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle-activities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VehicleActivityController {

    private final VehicleActivityService vehicleActivityService;

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<VehicleActivity>> getActivitiesByVehicle(
            @PathVariable Long vehicleId
    ) {
        return ResponseEntity.ok(
                vehicleActivityService.getActivitiesByVehicle(vehicleId)
        );
    }

    @GetMapping("/driver/{driverECode}/today")
    public ResponseEntity<List<VehicleActivity>> getTodayActivityByDriver(
            @PathVariable Integer driverECode
    ) {
        return ResponseEntity.ok(
                vehicleActivityService.getTodayActivityByDriver(driverECode)
        );
    }

    @GetMapping("/tracking/live")
    public ResponseEntity<List<VehicleActivity>> getLiveFleet() {
        return ResponseEntity.ok(
                vehicleActivityService.getLiveFleetLocations()
        );
    }
}