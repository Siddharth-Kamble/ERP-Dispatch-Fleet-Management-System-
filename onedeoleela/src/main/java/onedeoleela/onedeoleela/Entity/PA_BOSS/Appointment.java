////package onedeoleela.onedeoleela.Entity.PA_BOSS;
////
////import jakarta.persistence.*;
////
////import java.time.LocalDateTime;
////
////import lombok.Data;
////import onedeoleela.onedeoleela.Entity.*;
////
////@Entity
////@Table(name = "appointments")
////@Data
////public class Appointment {
////    @Id
////    @GeneratedValue(strategy = GenerationType.IDENTITY)
////    private Long id;
////
////    private String title;
////    private LocalDateTime startTime;
////    private LocalDateTime endTime;
////
////    // Statuses: AVAILABLE, PENDING, APPROVED, REJECTED
////    private String status;
////
////    @ManyToOne
////    @JoinColumn(name = "boss_id")
////    private User boss;
////
////    @ManyToOne
////    @JoinColumn(name = "pa_id")
////    private User pa;
////    private String bossComment;
////    private boolean bossRead;
////    private boolean paRead;
////
////}
//
//
//package onedeoleela.onedeoleela.Entity.PA_BOSS;
//
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//import lombok.Data;
//import onedeoleela.onedeoleela.Entity.*;
//
//@Entity
//@Table(name = "appointments")
//@Data
//public class Appointment {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private String title;
//
//    // Reason for the appointment (required from PA)
//    private String reason;
//
//    private LocalDateTime startTime;
//    private LocalDateTime endTime;
//
//    // Statuses: AVAILABLE, PENDING, APPROVED, REJECTED, RESCHEDULED
//    private String status;
//
//    @ManyToOne
//    @JoinColumn(name = "boss_id")
//    private User boss;
//
//    @ManyToOne
//    @JoinColumn(name = "pa_id")
//    private User pa;
//
//    private String bossComment;
//    private boolean bossRead;
//    private boolean paRead;
//}

package onedeoleela.onedeoleela.Entity.PA_BOSS;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import onedeoleela.onedeoleela.Entity.*;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Core fields
    private String title;
    private String reason;

    // NEW: Person this appointment is with
    private String personName;

    // NEW: Priority level — HIGH / MEDIUM / LOW
    private String priority;

    // NEW: Expected duration in minutes (15, 30, 45, 60, 90, 120)
    private Integer duration;

    // NEW: Where the meeting takes place (Office / Virtual / Site etc.)
    private String location;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Statuses: AVAILABLE, PENDING, APPROVED, REJECTED, RESCHEDULED
    private String status;

    @ManyToOne
    @JoinColumn(name = "boss_id")
    private User boss;

    @ManyToOne
    @JoinColumn(name = "pa_id")
    private User pa;

    private String bossComment;
    private boolean bossRead;
    private boolean paRead;
}