package onedeoleela.onedeoleela.Repository;


import onedeoleela.onedeoleela.Entity.ExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseEntityRepository extends JpaRepository<ExpenseEntity, Long> {


    List<ExpenseEntity> findByDriverECodeAndVehicleNumberOrderByDateDesc(String driverECode, String vehicleNumber);
    List<ExpenseEntity> findByVehicleNumber(String vehicleNumber);
    List<ExpenseEntity> findByDriverECodeOrderByDateDesc(String driverECode);
}