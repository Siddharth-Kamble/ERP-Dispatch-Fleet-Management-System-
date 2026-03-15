package onedeoleela.onedeoleela.Service;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.Driver;
import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Entity.Vehicle;
import onedeoleela.onedeoleela.Repository.DriverRepository;
import onedeoleela.onedeoleela.Repository.UserRepository;
import onedeoleela.onedeoleela.Repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepo;
    private final DriverRepository driverRepo;

    // GET ALL VEHICLES
    public List<Vehicle> getAllVehicles() {
        return vehicleRepo.findAll();
    }
    public List<Vehicle> getDriverVehicles(Long driverId) {
        return vehicleRepo.findByDriverId(driverId);
    }
    // CREATE VEHICLE
//    public Vehicle create(Integer eCode, Vehicle vehicle, Long driverId) {
//
//        Driver driver = null;
//
//        if (driverId != null) {
//            driver = driverRepo.findById(driverId)
//                    .orElseThrow(() -> new RuntimeException("Driver not found"));
//        }
//
//        vehicle.setDriver(driver);
//        vehicle.setECode(eCode);
//
//        return vehicleRepo.save(vehicle);
//    }

    public Vehicle create(Integer ignoredECode, Vehicle vehicle, Long driverId) {

        // 🔍 Find driver
        Driver driver = driverRepo.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // 🔍 Find user by driver name
        User user = userRepository.findByFullName(driver.getName())
                .orElseThrow(() -> new RuntimeException("Driver user not found"));

        // 🔥 Set relation
        vehicle.setDriver(driver);

        // 🔥 Take eCode from driver user
        vehicle.setECode(user.getECode().intValue());

        return vehicleRepo.save(vehicle);
    }

    public List<Vehicle> getAssignedVehiclesByECode(Integer eCode) {
        return vehicleRepo.findByECode(eCode);
    }

    // DELETE
    public void delete(Long id) {
        vehicleRepo.deleteById(id);
    }
}
