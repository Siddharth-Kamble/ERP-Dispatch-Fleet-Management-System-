////package onedeoleela.onedeoleela.Entity;
////
////import jakarta.persistence.*;
////import lombok.*;
////
////@Entity
////@Table(name = "live_tracking")
////@Getter
////@Setter
////@NoArgsConstructor
////@AllArgsConstructor
////public class LiveTracking {
////
////    @Id
////    @GeneratedValue(strategy = GenerationType.IDENTITY)
////    private Long id;
////
////    private String vehicleNumber;
////
////    private String driverName;
////
////    private Double lat;
////
////    private Double lng;
////
////    private String status;
////}
//
//package onedeoleela.onedeoleela.Entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "live_tracking")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//public class LiveTracking {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private Long tripId;
//
//    private String vehicleNumber;
//
//    private String driverName;
//
//    private Double lat;
//
//    private Double lng;
//
//    @Enumerated(EnumType.STRING)
//    private TripStatusEnum status;  // status will be filled from activity table
//
//    private LocalDateTime recordedAt;
//}


package onedeoleela.onedeoleela.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "live_tracking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LiveTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;

    // ✅ Ignore frontend input, always filled from DB/service
    @JsonIgnore
    private String vehicleNumber;

    @JsonIgnore
    private String driverName;

    private Double lat;

    private Double lng;

    @Enumerated(EnumType.STRING)
    private TripStatusEnum status;  // status will be filled from activity table

    private LocalDateTime recordedAt;
}