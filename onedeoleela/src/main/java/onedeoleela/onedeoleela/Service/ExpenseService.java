package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.Expense;
import onedeoleela.onedeoleela.Entity.Vehicle;
import onedeoleela.onedeoleela.Repository.ExpenseRepository;
import onedeoleela.onedeoleela.Repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final VehicleRepository vehicleRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,  // ✅ changed here
            VehicleRepository vehicleRepository
    ) {
        this.expenseRepository = expenseRepository; // ✅ changed here
        this.vehicleRepository = vehicleRepository;
    }

    /* ============================
       ADD EXPENSE
    ============================ */
    public Expense addExpense(Long vehicleId, Expense expense) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() ->
                        new RuntimeException("Vehicle not found"));

        expense.setVehicle(vehicle);

        // ✅ Use correct field name 'date'
        if (expense.getDate() == null) {
            expense.setDate(LocalDate.now());
        }

        // ✅ Type comes from frontend, no changes needed
        return expenseRepository.save(expense);
    }

    /* ============================
       GET ALL EXPENSES OF VEHICLE
    ============================ */
    public List<Expense> getExpensesByVehicle(Long vehicleId) {
        return expenseRepository.findByVehicleId(vehicleId);
    }

    /* ============================
       DELETE EXPENSE
    ============================ */
    public void deleteExpense(Long expenseId) {
        expenseRepository.deleteById(expenseId);
    }

    /* ============================
       MONTHLY TOTAL CALCULATION
    ============================ */
    public Double getTotalExpenseBetweenDates(
            Long vehicleId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        List<Expense> expenses =
                expenseRepository.findByVehicleIdAndDateBetween(
                        vehicleId, startDate, endDate); // ✅ Use 'date' here

        return expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();
    }
}
