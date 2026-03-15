package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.Expense;
import onedeoleela.onedeoleela.Entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // ✅ Get all expenses for a vehicle
    List<Expense> findByVehicle(Vehicle vehicle);

    // ✅ Get all expenses by vehicle ID
    List<Expense> findByVehicleId(Long vehicleId);

    // ✅ Get expenses by vehicle ID between two dates
    List<Expense> findByVehicleIdAndDateBetween(Long vehicleId, LocalDate startDate, LocalDate endDate);

}
