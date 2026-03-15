package onedeoleela.onedeoleela.Controller;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.Vehicle;
import onedeoleela.onedeoleela.Service.VehicleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin("*")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService service;

    // GET
    @GetMapping
    public List<Vehicle> getAll() {
        return service.getAllVehicles();
    }

    // CREATE  ✅ (matches your React call)
    @PostMapping("/create/{eCode}/{driverId}")
    public Vehicle create(
            @PathVariable Integer eCode,
            @PathVariable Long driverId,
            @RequestBody Vehicle vehicle
    ) {
        return service.create(eCode, vehicle, driverId);
    }
    @GetMapping("/driver-assigned")
    public List<Vehicle> getDriverAssigned(@RequestParam Integer eCode) {
        return service.getAssignedVehiclesByECode(eCode);
    }
    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
    @GetMapping("/driver/{driverId}")
    public List<Vehicle> getDriverVehicles(@PathVariable Long driverId) {
        return service.getDriverVehicles(driverId);
    }
}
