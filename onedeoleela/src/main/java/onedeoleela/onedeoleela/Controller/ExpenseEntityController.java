package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.ExpenseEntity;
import onedeoleela.onedeoleela.Entity.ExpenseType;
import onedeoleela.onedeoleela.Repository.UserRepository;
import onedeoleela.onedeoleela.Service.ExpenseEntityService;

import onedeoleela.onedeoleela.Util.ExpensePdfGenerator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseEntityController {

    private final ExpenseEntityService expenseService;
    private  final UserRepository userRepository;

    public ExpenseEntityController(ExpenseEntityService expenseService, UserRepository userRepository) {
        this.expenseService = expenseService;
        this.userRepository = userRepository;
    }

    // ✅ Add Expense with Bill Image
    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addExpense(
            @RequestParam String vehicleNumber,
            @RequestParam String driverECode,
            @RequestParam ExpenseType type,
            @RequestParam Double amount,
            @RequestParam(required = false) Double dieselLiter, // New Attribute
            @RequestParam(required = false) Double rate,        // New Attribute
            @RequestParam(required = false) String description,
            @RequestParam String date,
            @RequestParam(required = false) MultipartFile image
    ) {

        try {

            ExpenseEntity expense = expenseService.saveExpense(
                    vehicleNumber,
                    driverECode,
                    type,
                    amount,
                    dieselLiter, // Passed to service
                    rate,        // Passed to service
                    description,
                    LocalDate.parse(date),
                    image
            );

            return ResponseEntity.ok(expense);

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving expense: " + e.getMessage());
        }
    }

    // ✅ View expenses for vehicle + driver
    @GetMapping("/view/{vehicleNumber}")
    public ResponseEntity<List<ExpenseEntity>> viewExpenses(
            @PathVariable String vehicleNumber,
            @RequestParam String eCode) {

        List<ExpenseEntity> history =
                expenseService.getExpensesByDriverAndVehicle(eCode, vehicleNumber);

        return ResponseEntity.ok(history);
    }

    // ✅ Driver expense history
    @GetMapping("/driver/{eCode}")
    public ResponseEntity<List<ExpenseEntity>> getDriverHistory(@PathVariable String eCode) {

        return ResponseEntity.ok(
                expenseService.getAllExpensesByDriver(eCode)
        );
    }

    // ✅ Vehicle expense list
    @GetMapping("/vehicle-number/{vehicleNumber}")
    public ResponseEntity<?> getExpensesByVehicleNumber(@PathVariable String vehicleNumber) {

        try {

            List<ExpenseEntity> expenses =
                    expenseService.getExpensesByVehicleNumberWithDriverName(vehicleNumber);

            if (expenses.isEmpty()) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No expenses found for vehicle number: " + vehicleNumber);
            }

            return ResponseEntity.ok(expenses);

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching expenses: " + e.getMessage());
        }
    }

    @GetMapping("/vehicle/{vehicleNumber}")
    public ResponseEntity<List<ExpenseEntity>> getExpensesByVehicle(
            @PathVariable String vehicleNumber) {

        List<ExpenseEntity> expenses =
                expenseService.getExpensesByVehicleNumber(vehicleNumber);

        return ResponseEntity.ok(expenses);
    }
    @GetMapping("/bill/{id}")
    public ResponseEntity<byte[]> getBillImage(@PathVariable Long id) {

        ExpenseEntity expense = expenseService.getExpenseById(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(expense.getContentType()))
                .body(expense.getImageData());
    }






    @GetMapping("/download/{vehicleNumber}")
    public ResponseEntity<byte[]> downloadExpenseReport(
            @PathVariable String vehicleNumber,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        try {
            // Convert startDate and endDate to LocalDate
            LocalDate start = (startDate != null && !startDate.isEmpty())
                    ? LocalDate.parse(startDate)
                    : LocalDate.of(1900, 1, 1);
            LocalDate end = (endDate != null && !endDate.isEmpty())
                    ? LocalDate.parse(endDate)
                    : LocalDate.of(2100, 1, 1);

            List<ExpenseEntity> expenses = expenseService.findByVehicleNumber(vehicleNumber)
                    .stream()
                    .filter(e -> {
                        LocalDate expenseDate = e.getDate(); // assuming e.getDate() is java.util.Date or java.time.LocalDateTime
                        return !expenseDate.isBefore(start) && !expenseDate.isAfter(end);
                    })
                    .collect(Collectors.toList());

            // Map ECode -> Name
            Map<String, String> userNames = new HashMap<>();
            for (ExpenseEntity e : expenses) {
                if (!userNames.containsKey(e.getDriverECode())) {
                    userRepository.findByeCode(Long.valueOf(e.getDriverECode()))
                            .ifPresent(user -> userNames.put(e.getDriverECode(), user.getFullName()));
                }
            }

            byte[] pdf = ExpensePdfGenerator.generateExpenseReport(
                    vehicleNumber,
                    "Driver",
                    expenses,
                    userNames
            );

            String filename = "expense_report_" + vehicleNumber + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}