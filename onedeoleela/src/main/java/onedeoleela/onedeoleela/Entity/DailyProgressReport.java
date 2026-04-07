//package onedeoleela.onedeoleela.Entity;
//
//
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Builder;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//
///**
// * Entity representing one trip row in the Daily Progress Report.
// *
// * One "vehicle block" (SR.NO) can have multiple trips (TRIP 1, 2, 3, 4…),
// * so each row is stored as its own record. The srNo + tripNumber together
// * identify the row in the printed report.
// *
// * Report columns:
// *  SR.NO | VEHICLE NO. | TRIP | DRIVER | DESCRIPTION | FROM | TO | TIME | TARGET ACHIEVE | REMARK
// */
//@Entity
//@Table(name = "daily_progress_report")
//@Data
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//public class DailyProgressReport {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    // ── Report meta ─────────────────────────────────────────────────────────
//
//    /** Calendar date this report row belongs to (e.g. 2026-04-03). */
//    @Column(nullable = false)
//    private LocalDate reportDate;
//
//    /**
//     * Employee names shown in the report header.
//     * e.g. "Akhilesh K. Goutam & Rajan Verma"
//     */
//    @Column(length = 255)
//    private String employeeName;
//
//    // ── Dispatch Department columns ──────────────────────────────────────────
//
//    /**
//     * SR.NO — the vehicle group number (1, 2, 3 …).
//     * Multiple rows share the same srNo when a vehicle makes multiple trips.
//     */
//    @Column(nullable = false)
//    private Integer srNo;
//
//    /**
//     * VEHICLE NO. — e.g. "MH12RN3395".
//     * Only populated on the first trip row of each vehicle group;
//     * subsequent rows within the same srNo leave this blank (matches report).
//     * Store it on every row for query convenience; the export logic handles blanking.
//     */
//    @Column(length = 20)
//    private String vehicleNumber;
//
//    /**
//     * TRIP — sequential trip number within the vehicle block (1, 2, 3 …).
//     */
//    @Column(nullable = false)
//    private Integer tripNumber;
//
//    /**
//     * DRIVER — driver name for this trip.
//     * e.g. "YASIR", "NIKHIL", "MARUTI", "TRANSPORT"
//     */
//    @Column(length = 100)
//    private String driverName;
//
//    // ── Schedule columns ────────────────────────────────────────────────────
//
//    /**
//     * DESCRIPTION — material/cargo description.
//     * e.g. "ALU. BOX PIPE & HARDWARE MATERIAL", "VEHICLE BREAK DOWN"
//     */
//    @Column(length = 500)
//    private String description;
//
//    /**
//     * FROM — origin location of the trip.
//     * e.g. "ONE DEO", "SAG. KHANDALA PUNE"
//     */
//    @Column(length = 255)
//    private String fromLocation;
//
//    /**
//     * TO — destination location.
//     * e.g. "GODREJ AVAMARK LLP. MANJARI", "YOO ONE NIBM. PUNE"
//     */
//    @Column(length = 255)
//    private String toLocation;
//
//    /**
//     * TIME — time window string as shown in the report.
//     * e.g. "9:00-10:00 AM", "10:45-5:30 PM", "CANCEL"
//     * Stored as a plain string to preserve the display format exactly.
//     */
//    @Column(length = 50)
//    private String timeSlot;
//
//    // ── Result columns ──────────────────────────────────────────────────────
//
//    /**
//     * TARGET ACHIEVE status.
//     * Values: ACHIEVE | NOT_ACHIEVED | CANCELLED | BREAKDOWN | PENDING
//     * Drives cell background colour in the exported report.
//     */
//    @Enumerated(EnumType.STRING)
//    @Column(length = 20)
//    private TargetStatus targetAchieve;
//
//    /**
//     * REMARK — operational remark.
//     * e.g. "LOADING", "SITE DISPATCH", "ONLY LOADING", "ONLY UNLOADING",
//     *       "GLASS MATERIAL NOT RECEIVED"
//     */
//    @Column(length = 500)
//    private String remark;
//
//    // ── Audit ───────────────────────────────────────────────────────────────
//
//    @Column(updatable = false)
//    private LocalDateTime createdAt;
//
//    private LocalDateTime updatedAt;
//
//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//        updatedAt  = LocalDateTime.now();
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        updatedAt = LocalDateTime.now();
//    }
//    public enum TargetStatus {
//        /** Green cell — "ACHIEVE" */
//        ACHIEVE,
//        /** Red cell — trip/target not achieved */
//        NOT_ACHIEVED,
//        /** Red text "CANCEL" in TIME column, red cell in TARGET column */
//        CANCELLED,
//        /** Red cell — e.g. "VEHICLE BREAK DOWN" */
//        BREAKDOWN,
//        /** No colour — row not yet completed */
//        PENDING
//    }
//}





package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "daily_progress_report")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyProgressReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Report meta ─────────────────────────────────────────────────────────

    @Column(nullable = false)
    private LocalDate reportDate;

    /**
     * Employee names shown in the report header.
     * e.g. "Akhilesh K. Goutam & Rajan Verma"
     */
    @Column(length = 255)
    private String employeeName;

    /**
     * Special Note — user-provided note for the footer of the report.
     * If null/blank, the footer note cell is left empty.
     * Stored on every row but only the first non-blank value per date is used.
     */
    @Column(length = 1000)
    private String specialNote;

    // ── Dispatch Department columns ──────────────────────────────────────────

    /**
     * SR.NO — the vehicle group number (1, 2, 3 …).
     * Multiple rows share the same srNo when a vehicle makes multiple trips.
     */
    @Column(nullable = false)
    private Integer srNo;

    /**
     * VEHICLE NO. — e.g. "MH12RN3395".
     * Only populated on the first trip row of each vehicle group;
     * subsequent rows within the same srNo leave this blank (matches report).
     * Store it on every row for query convenience; the export logic handles blanking.
     */
    @Column(length = 20)
    private String vehicleNumber;

    /**
     * TRIP — sequential trip number within the vehicle block (1, 2, 3 …).
     */
    @Column(nullable = false)
    private Integer tripNumber;

    /**
     * DRIVER — driver name for this trip.
     * e.g. "YASIR", "NIKHIL", "MARUTI", "TRANSPORT"
     */
    @Column(length = 100)
    private String driverName;

    // ── Schedule columns ────────────────────────────────────────────────────

    /**
     * DESCRIPTION — material/cargo description.
     * e.g. "ALU. BOX PIPE & HARDWARE MATERIAL", "VEHICLE BREAK DOWN"
     */
    @Column(length = 500)
    private String description;

    /**
     * FROM — origin location of the trip.
     * e.g. "ONE DEO", "SAG. KHANDALA PUNE"
     */
    @Column(length = 255)
    private String fromLocation;

    /**
     * TO — destination location.
     * e.g. "GODREJ AVAMARK LLP. MANJARI", "YOO ONE NIBM. PUNE"
     */
    @Column(length = 255)
    private String toLocation;

    /**
     * TIME — time window string as shown in the report.
     * e.g. "9:00-10:00 AM", "10:45-5:30 PM", "CANCEL"
     * Stored as a plain string to preserve the display format exactly.
     * Used to calculate total working hours per vehicle/driver.
     */
    @Column(length = 50)
    private String timeSlot;

    // ── Result columns ──────────────────────────────────────────────────────

    /**
     * TARGET ACHIEVE status.
     * Values: ACHIEVE | NOT_ACHIEVED | CANCELLED | BREAKDOWN | PENDING | OTHER
     * Drives cell background colour in the exported report.
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20,nullable = false)
    private TargetStatus targetAchieve;

    /**
     * Custom target achieve text — used only when targetAchieve = OTHER.
     * The user can specify any custom status text, e.g. "PARTIALLY DONE".
     */
    @Column(length = 255, nullable = true)
    private String targetAchieveOther;


    @Column(length = 500)
    private String remark;

    // ── Audit ───────────────────────────────────────────────────────────────

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt  = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TargetStatus {
        /** Green cell — "ACHIEVE" */
        ACHIEVE,
        /** Red cell — trip/target not achieved */
        NOT_ACHIEVED,
        /** Red text "CANCEL" in TIME column, red cell in TARGET column */
        CANCELLED,
        /** Red cell — e.g. "VEHICLE BREAK DOWN" */
        BREAKDOWN,
        /** No colour — row not yet completed */
        PENDING,
        /**
         * Orange/amber cell — user specifies custom text via targetAchieveOther field.
         * e.g. "PARTIALLY DONE", "RESCHEDULED", etc.
         */
        OTHER
    }
}