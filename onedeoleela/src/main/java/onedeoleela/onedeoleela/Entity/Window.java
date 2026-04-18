//package onedeoleela.onedeoleela.Entity;
//
//import com.fasterxml.jackson.annotation.JsonFormat;
//import com.fasterxml.jackson.annotation.JsonProperty;
//import jakarta.persistence.*;
//import lombok.Getter;
//import lombok.Setter;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//
//@Entity
//@Getter
//@Setter
//@Table(name = "windows")
//public class Window {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long windowId;
//
//    private String windowSeriesNumber;
//
//    private String location;
//
//    @JsonProperty("wCodeNo")
//    private String wCodeNo;
//
//    private String jobCardNo;
//
//    private String series;
//
//    private String description;
//
//    private Double width;
//
//    private Double height;
//
//    private Integer trackOuter;
//
//    private Integer bottomFix;
//
//    private Integer glassShutter;
//
//    private Integer meshShutter;
//
//    private Integer units;
//
//    private Double sqft;
//
//    private String remark;
//
//
//
////    private Integer flatNumber;   // added flat number column in windows table
//
//    @ManyToOne
//    @JoinColumn(name = "flat_id")
//    private Flat flat;
//    @ManyToOne
//    @JoinColumn(name = "floor_id")
//    private Floor floor;
//    @ManyToOne
//    @JoinColumn(name = "trip_id")
//    private Trip trip;
//
//
//    @Transient
//    @JsonFormat(pattern = "yyyy-MM-dd")
//    private LocalDate userDate;
//    @Column(name = "created_at")
//    private LocalDateTime createdAt;
//    @PrePersist
//    protected void onCreate() {
//        this.createdAt = LocalDateTime.now();
//    }
//}


package onedeoleela.onedeoleela.Entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "windows")
public class Window {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long windowId;

    private String windowSeriesNumber;
    private String location;

    @JsonProperty("wCodeNo")
    private String wCodeNo;

    private String jobCardNo;
    private String series;
    private String description;
    private Double width;
    private Double height;
    private Integer trackOuter;
    private Integer bottomFix;
    private Integer glassShutter;
    private Integer meshShutter;
    private Integer units;
    private Double sqft;
    private String remark;

    // ✅ FIX: Added @JsonIgnoreProperties to prevent Hibernate lazy proxy
    //         from causing flatNumber to serialize as null
    @ManyToOne(fetch = FetchType.EAGER)   // ✅ EAGER ensures flat is always loaded with window
    @JoinColumn(name = "flat_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "floor"})
    private Flat flat;

    @ManyToOne(fetch = FetchType.EAGER)   // ✅ EAGER ensures floor is always loaded
    @JoinColumn(name = "floor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "tower", "flats"})
    private Floor floor;

    @ManyToOne(fetch = FetchType.EAGER)   // ✅ EAGER ensures trip is always loaded
    @JoinColumn(name = "trip_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "windows"})
    private Trip trip;

    @Transient
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate userDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}