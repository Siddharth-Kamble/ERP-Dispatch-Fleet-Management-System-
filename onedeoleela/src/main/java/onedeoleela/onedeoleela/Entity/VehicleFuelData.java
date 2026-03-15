    package onedeoleela.onedeoleela.Entity;

    import jakarta.persistence.*;
    import lombok.Data;

    import java.time.LocalDate;


    @Data
    @Entity
    @Table(name = "vehicle_fuel")
    public class VehicleFuelData {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String vehicleNumber;

        private Double kmReading;          // Current KM reading
        private Double dieselRate;         // Rate per liter
        private Double fuelAmount;         // Amount of fuel injected
        private Double lastExpenseAmount;  // Last expense recorded

        private String updatedBy;

        @Column(nullable = false)
        private LocalDate updatedDate = LocalDate.now();


    }