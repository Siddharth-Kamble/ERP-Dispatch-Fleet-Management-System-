package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.ExpenseEntity;
import onedeoleela.onedeoleela.Entity.ExpenseType;
import onedeoleela.onedeoleela.Repository.ExpenseEntityRepository;
import onedeoleela.onedeoleela.Repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseEntityService {

    private final ExpenseEntityRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseEntityService(ExpenseEntityRepository expenseRepository,
                                UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    // ✅ Save expense with bill image
//    public ExpenseEntity saveExpense(String vehicleNumber,
//                                     String driverECode,
//                                     ExpenseType type,
//                                     Double amount,
//                                     String description,
//                                     LocalDate date,
//                                     MultipartFile image) throws IOException {
//
//        ExpenseEntity expense = new ExpenseEntity();
//
//        expense.setVehicleNumber(vehicleNumber);
//        expense.setDriverECode(driverECode);
//        expense.setType(type);
//        expense.setAmount(amount);
//        expense.setDescription(description);
//        expense.setDate(date);
//
//        // Save image if provided
//        if (image != null && !image.isEmpty()) {
//            expense.setFileName(image.getOriginalFilename());
//            expense.setContentType(image.getContentType());
//            expense.setImageData(image.getBytes());
//        }
//
//        return expenseRepository.save(expense);
//    }

    public ExpenseEntity saveExpense(String vehicleNumber,
                                     String driverECode,
                                     ExpenseType type,
                                     Double amount,
                                     Double dieselLiter, // Added attribute
                                     Double rate,        // Added attribute
                                     String description,
                                     LocalDate date,
                                     MultipartFile image) throws IOException {

        ExpenseEntity expense = new ExpenseEntity();

        expense.setVehicleNumber(vehicleNumber);
        expense.setDriverECode(driverECode);
        expense.setType(type);
        expense.setAmount(amount);

        // Mapping the two new attributes
        expense.setDieselLiter(dieselLiter);
        expense.setRate(rate);

        expense.setDescription(description);
        expense.setDate(date);

        // Save image if provided
        if (image != null && !image.isEmpty()) {
            expense.setFileName(image.getOriginalFilename());
            expense.setContentType(image.getContentType());
            expense.setImageData(image.getBytes());
        }

        return expenseRepository.save(expense);
    }

    // Driver + Vehicle expense history
    public List<ExpenseEntity> getExpensesByDriverAndVehicle(String eCode, String vehicleNumber) {
        return expenseRepository
                .findByDriverECodeAndVehicleNumberOrderByDateDesc(eCode, vehicleNumber);
    }

    // All driver expenses
    public List<ExpenseEntity> getAllExpensesByDriver(String eCode) {
        return expenseRepository.findByDriverECodeOrderByDateDesc(eCode);
    }

    // Find by vehicle number
    public List<ExpenseEntity> findByVehicleNumber(String vehicleNumber) {
        return expenseRepository.findByVehicleNumber(vehicleNumber);
    }

    // Vehicle expense list with driver name
    public List<ExpenseEntity> getExpensesByVehicleNumberWithDriverName(String vehicleNumber) {

        List<ExpenseEntity> expenses = expenseRepository.findByVehicleNumber(vehicleNumber);

        for (ExpenseEntity expense : expenses) {

            try {

                userRepository.findByeCode(Long.parseLong(expense.getDriverECode()))
                        .ifPresent(user -> {
                            // Replace driverECode with full name
                            expense.setDriverECode(user.getFullName());
                        });

            } catch (NumberFormatException e) {

                expense.setDriverECode("Unknown Driver");

            }
        }

        return expenses;
    }
    public List<ExpenseEntity> getExpensesByVehicleNumber(String vehicleNumber) {
        return expenseRepository.findByVehicleNumber(vehicleNumber);
    }

    public ExpenseEntity getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }
}