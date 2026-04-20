package onedeoleela.onedeoleela.Service;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.Driver;
import onedeoleela.onedeoleela.Entity.Trip;
import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Repository.DriverRepository;
import onedeoleela.onedeoleela.Repository.TripRepository;
import onedeoleela.onedeoleela.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Driver create(Driver d) {

        User user = userRepository.findByFullName(d.getName())
                .orElseThrow(() -> new RuntimeException("Driver user not found"));

        d.setECode(user.getECode().intValue());

        return driverRepository.save(d);
    }

    public Driver update(Long id, Driver d) {

        Driver old = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        User user = userRepository.findByFullName(d.getName())
                .orElseThrow(() -> new RuntimeException("Driver user not found"));

        old.setName(d.getName());
        old.setMobile(d.getMobile());
        old.setLicenseNo(d.getLicenseNo());
        old.setJoiningDate(d.getJoiningDate());
        old.setECode(user.getECode().intValue());

        return driverRepository.save(old);
    }

    public void delete(Long id) {
        driverRepository.deleteById(id);
    }

    public List<String> getAllDriverNames() {
        return driverRepository.findAllDriverNames();
    }

    public String getDriverMobileByTripId(Long tripId) {
        // Step 1: Fetch trip
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));

        // Step 2: Get driverName from trip
        String driverName = trip.getDriverName();
        if (driverName == null || driverName.isBlank()) {
            throw new RuntimeException("No driver name found in Trip ID: " + tripId);
        }

        // Step 3: Find driver by name → get mobile
        Driver driver = driverRepository.findByName(driverName)
                .orElseThrow(() -> new RuntimeException("Driver not found with name: " + driverName));

        return driver.getMobile();
    }
}
