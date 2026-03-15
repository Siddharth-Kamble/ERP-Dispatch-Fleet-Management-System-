package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByDriverId(Long driverId);
    // ✅ MUST match entity field → eCode
    List<Vehicle> findByeCode(Integer eCode);
    @Query("SELECT v FROM Vehicle v WHERE v.eCode = :eCode")
    List<Vehicle> findByECode(@Param("eCode") Integer eCode);
    // ✅ fetch driver
    @Query("""
        SELECT v FROM Vehicle v
        LEFT JOIN FETCH v.driver
        WHERE v.eCode = :eCode
    """)
    List<Vehicle> findByeCodeWithDriver(@Param("eCode") Integer eCode);

    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);
}
