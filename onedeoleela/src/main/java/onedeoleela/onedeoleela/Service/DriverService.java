package onedeoleela.onedeoleela.Service;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.Driver;
import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Repository.DriverRepository;
import onedeoleela.onedeoleela.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository repo;
    private final UserRepository userRepository;

    public List<Driver> getAllDrivers() {
        return repo.findAll();
    }

    public Driver create(Driver d) {

        User user = userRepository.findByFullName(d.getName())
                .orElseThrow(() -> new RuntimeException("Driver user not found"));

        d.setECode(user.getECode().intValue());

        return repo.save(d);
    }

    public Driver update(Long id, Driver d) {

        Driver old = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        User user = userRepository.findByFullName(d.getName())
                .orElseThrow(() -> new RuntimeException("Driver user not found"));

        old.setName(d.getName());
        old.setMobile(d.getMobile());
        old.setLicenseNo(d.getLicenseNo());
        old.setJoiningDate(d.getJoiningDate());
        old.setECode(user.getECode().intValue());

        return repo.save(old);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<String> getAllDriverNames() {
        return repo.findAllDriverNames();
    }
}
