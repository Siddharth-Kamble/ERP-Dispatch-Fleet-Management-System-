//package onedeoleela.onedeoleela.Entity;
//
//
//
//import com.fasterxml.jackson.annotation.JsonFormat;
//import jakarta.persistence.*;
//import lombok.Data;
//import java.time.LocalDate;
//
//@Entity
//@Table(name = "driver_expenses")
//@Data
//public class ExpenseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    // These link the expense to the context (Sent from Frontend)
//    @Column(nullable = false)
//    private String vehicleNumber;
//
//    @Column(nullable = false)
//    private String driverECode;
//
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private ExpenseType type;
//
//    @Column(nullable = false)
//    private Double amount;
//
//    private String description;
//
//    @JsonFormat(pattern = "yyyy-MM-dd")
//    @Column(nullable = false)
//    private LocalDate date;
//
//    @Column(name = "file_name")
//    private String fileName;
//
//    @Column(name = "content_type")
//    private String contentType;
//
//    @Lob
//    @Column(name = "image_data")
//    private byte[] imageData;
//}


package onedeoleela.onedeoleela.Entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "driver_expenses")
@Data
public class ExpenseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String vehicleNumber;

    @Column(nullable = false)
    private String driverECode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseType type;

    @Column(nullable = false)
    private Double amount;

    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(nullable = false)
    private LocalDate date;

    // IMAGE DETAILS
    private String fileName;

    private String contentType;


    @Column(name = "image_data", columnDefinition = "BYTEA")
    @JsonIgnore
    private byte[] imageData;
}