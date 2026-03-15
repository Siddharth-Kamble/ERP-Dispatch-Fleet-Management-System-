package onedeoleela.onedeoleela.Controller;

// ⚠️ CHANGE to your package name


import onedeoleela.onedeoleela.Entity.Expense;
import onedeoleela.onedeoleela.Entity.Vehicle;
import onedeoleela.onedeoleela.Repository.ExpenseRepository;
import onedeoleela.onedeoleela.Repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    // ✅ Get all expenses by vehicle
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<?> getByVehicle(@PathVariable Long vehicleId) {

        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(vehicleId);

        if (vehicleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Vehicle not found with id: " + vehicleId);
        }

        List<Expense> expenses = expenseRepository.findByVehicle(vehicleOpt.get());

        return ResponseEntity.ok(expenses);
    }

    // ✅ Add expense for vehicle
    @PostMapping("/add/{vehicleId}")
    public ResponseEntity<?> addExpense(@PathVariable Long vehicleId,
                                        @RequestBody Expense expense) {

        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(vehicleId);
        System.out.println("TYPE: " + expense.getType());
        System.out.println("DATE: " + expense.getDate());
        if (vehicleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Vehicle not found with id: " + vehicleId);
        }

        expense.setVehicle(vehicleOpt.get());

        Expense savedExpense = expenseRepository.save(expense);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedExpense);
    }
}
