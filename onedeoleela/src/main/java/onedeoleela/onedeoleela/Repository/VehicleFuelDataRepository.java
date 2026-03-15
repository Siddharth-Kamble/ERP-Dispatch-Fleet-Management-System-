package onedeoleela.onedeoleela.Repository;


import onedeoleela.onedeoleela.Entity.VehicleFuelData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface VehicleFuelDataRepository extends JpaRepository<VehicleFuelData, Long> {
    Optional<VehicleFuelData> findByVehicleNumber(String vehicleNumber);
    List<VehicleFuelData> findAllByVehicleNumberOrderByUpdatedDateAsc(String vehicleNumber);


    // 🔹 Fetch all records of a vehicle ordered by date
    @Query("SELECT v FROM VehicleFuelData v WHERE v.vehicleNumber = :vehicleNumber ORDER BY v.updatedDate ASC, v.id ASC")
    List<VehicleFuelData> findAllByVehicleNumberOrderByDate(String vehicleNumber);
}