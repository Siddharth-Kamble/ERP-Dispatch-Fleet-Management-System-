//package onedeoleela.onedeoleela.Entity;
//
//import jakarta.persistence.*;
//import lombok.Data;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "items")
//@Data
//public class Item {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(name = "sr_no")
//    private Integer srNo;
//
//    @Column(name = "win_sr_no")
//    private String winSrNo;
//
//    @Column(name = "flat_no")
//    private String flatNo;
//
//    @Column(name = "location")
//    private String location;
//
//    @Column(name = "job_card_no")
//    private String jobCardNo;
//
//    @Column(name = "description")
//    private String description;
//
//    @Column(name = "width")
//    private Double width;
//
//    @Column(name = "height")
//    private Double height;
//
//    @Column(name = "qty")
//    private Integer qty;
//
//    @Column(name = "unit")
//    private String unit;
//
//    @Column(name = "sqft")
//    private Double sqFt;
//
//    @Column(name = "remarks")
//    private String remarks;
//
//    // Many-to-One relationships
//    @ManyToOne
//    @JoinColumn(name = "flat_id")
//    private Flat flat;
//
//    @ManyToOne
//    @JoinColumn(name = "floor_id")
//    private Floor floor;
//
//    @ManyToOne
//    @JoinColumn(name = "trip_id")
//    private Trip trip;
//
//    @Column(name = "created_at")
//    private LocalDateTime createdAt;
//
//    // Auto-set createdAt before persisting
//    @PrePersist
//    protected void onCreate() {
//        this.createdAt = LocalDateTime.now();
//    }
//    @ManyToOne
//    @JoinColumn(name = "tower_id")
//    private Tower tower;   // ✅ NEW
//
//}





package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "items")
@Data
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sr_no")
    private Integer srNo;

    @Column(name = "win_sr_no")
    private String winSrNo;

    // ✅ Flat No — MANDATORY (validated during Excel upload)
    @Column(name = "flat_no")
    private String flatNo;

    @Column(name = "location")
    private String location;

    @Column(name = "job_card_no")
    private String jobCardNo;

    @Column(name = "description")
    private String description;

    @Column(name = "width")
    private Double width;

    @Column(name = "height")
    private Double height;

    @Column(name = "qty")
    private Integer qty;

    @Column(name = "unit")
    private String unit;

    @Column(name = "sqft")
    private Double sqFt;

    @Column(name = "remarks")
    private String remarks;

    // Many-to-One relationships
    @ManyToOne
    @JoinColumn(name = "flat_id")
    private Flat flat;

    // ✅ Floor No — MANDATORY (validated during Excel upload)
    @ManyToOne
    @JoinColumn(name = "floor_id")
    private Floor floor;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @ManyToOne
    @JoinColumn(name = "tower_id")
    private Tower tower;
}