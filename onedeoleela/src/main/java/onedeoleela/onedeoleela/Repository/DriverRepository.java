package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    // 🔥 MUST match Java field name EXACTLY → eCode
    List<Driver> findByeCode(Integer eCode);
    @Query("SELECT d.name FROM Driver d")
    List<String> findAllDriverNames();
    Optional<Driver> findByName(String name);

}
