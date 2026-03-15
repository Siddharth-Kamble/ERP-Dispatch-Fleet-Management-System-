package onedeoleela.onedeoleela.Controller;



import onedeoleela.onedeoleela.Entity.VehicleFuelData;
import onedeoleela.onedeoleela.Service.VehicleFuelDataService;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vehicle-fuel")
public class VehicleFuelDataController {

    private final VehicleFuelDataService vehicleFuelDataService;

    public VehicleFuelDataController(VehicleFuelDataService vehicleFuelDataService) {
        this.vehicleFuelDataService = vehicleFuelDataService;
    }

    @PostMapping("/update")
    public VehicleFuelData updateFuel(@RequestBody VehicleFuelData vehicleFuelData) {
        return vehicleFuelDataService.updateFuel(vehicleFuelData);
    }


    @GetMapping("/average-mileage/{vehicleNumber}")
    public Double getAverageMileage(@PathVariable String vehicleNumber) {
        return vehicleFuelDataService.calculateAverageMileage(vehicleNumber);
    }
    @GetMapping("/monthly-mileage/{vehicleNumber}")
    public Map<String, Double> getMonthlyMileage(@PathVariable String vehicleNumber) {
        return vehicleFuelDataService.calculateMonthlyMileage(vehicleNumber);
    }
    @GetMapping("/all-vehicles-monthly-mileage")
    public Map<String, Map<String, Double>> getAllVehiclesMonthlyMileage() {
        // Get all unique vehicle numbers
        List<String> vehicleNumbers = vehicleFuelDataService.getAllVehicleNumbers();

        // Map each vehicle to its month-wise mileage
        return vehicleNumbers.stream()
                .collect(Collectors.toMap(
                        v -> v,
                        vehicleFuelDataService::calculateMonthlyMileage,
                        (a, b) -> a, // in case of duplicate keys
                        LinkedHashMap::new
                ));
    }

    @GetMapping("/vehicle-history/{vehicleNumber}")
    public List<Map<String, Object>> getVehicleHistory(@PathVariable String vehicleNumber) {
        return vehicleFuelDataService.getVehicleHistoryWithMileage(vehicleNumber);
    }
}