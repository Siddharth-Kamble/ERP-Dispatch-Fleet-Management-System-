package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.VehicleActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface VehicleActivityRepository
        extends JpaRepository<VehicleActivity, Long> {

    // -------- GET ALL ACTIVITIES BY VEHICLE --------
    List<VehicleActivity> findByVehicle_IdOrderByTimestampDesc(Long vehicleId);

    // -------- GET LATEST GPS LOCATION FOR ALL VEHICLES --------
    @Query("""
        SELECT va FROM VehicleActivity va
        WHERE va.timestamp = (
            SELECT MAX(v.timestamp)
            FROM VehicleActivity v
            WHERE v.vehicle.id = va.vehicle.id
        )
        AND va.latitude IS NOT NULL
    """)
    List<VehicleActivity> findLatestLocationForAllVehicles();

    // -------- GET TODAY ACTIVITY BY DRIVER --------
    @Query("""
        SELECT v FROM VehicleActivity v
        WHERE v.vehicle.driver.eCode = :driverECode
        AND v.timestamp >= :startOfDay
        AND v.timestamp < :endOfDay
    """)
    List<VehicleActivity> findTodayByDriverECode(
            @Param("driverECode") Integer driverECode,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );
}