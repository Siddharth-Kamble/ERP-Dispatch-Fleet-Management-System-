package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    // 🔥 MUST match Java field name EXACTLY → eCode
    List<Driver> findByeCode(Integer eCode);
}
