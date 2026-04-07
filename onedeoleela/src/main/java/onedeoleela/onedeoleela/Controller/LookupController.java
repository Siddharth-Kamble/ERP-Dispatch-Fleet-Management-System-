package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Entity.Vehicle;
import onedeoleela.onedeoleela.Repository.UserRepository;
import onedeoleela.onedeoleela.Repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/lookup")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LookupController {

    private final UserRepository    userRepository;
    private final VehicleRepository vehicleRepository;

    /**
     * Returns all users with role DISPATCH for the Employee Name multi-select.
     * GET /api/lookup/users/dispatch
     */
    @GetMapping("/users/dispatch")
    public ResponseEntity<List<User>> getDispatchUsers() {
        return ResponseEntity.ok(
                userRepository.findByRoleOrderByFullNameAsc(onedeoleela.onedeoleela.Entity.Role.DISPATCH)
        );
    }

    /**
     * Returns all users with role DRIVER for the Driver dropdown.
     * GET /api/lookup/users/driver
     */
    @GetMapping("/users/driver")
    public ResponseEntity<List<User>> getDriverUsers() {
        return ResponseEntity.ok(
                userRepository.findByRoleOrderByFullNameAsc(onedeoleela.onedeoleela.Entity.Role.DRIVER)
        );
    }

    /**
     * Returns all vehicles for the Vehicle Number dropdown.
     * GET /api/lookup/vehicles
     */
    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> getVehicles() {
        return ResponseEntity.ok(
                vehicleRepository.findAllByOrderByVehicleNumberAsc()
        );
    }
}