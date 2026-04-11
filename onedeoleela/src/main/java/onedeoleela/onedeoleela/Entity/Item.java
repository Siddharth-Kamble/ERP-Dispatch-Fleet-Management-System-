



package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Item entity — stores one row from the dispatch Excel upload.
 *
 * All 16 columns from the Excel template are mapped here:
 *
 *  Col A  (0)  Sr No.
 *  Col B  (1)  Win Sr No
 *  Col C  (2)  Floor NO      ← MANDATORY
 *  Col D  (3)  Flat No       ← MANDATORY
 *  Col E  (4)  Location
 *  Col F  (5)  Window Code
 *  Col G  (6)  Job Card No
 *  Col H  (7)  Priority
 *  Col I  (8)  Description
 *  Col J  (9)  Width
 *  Col K  (10) Height
 *  Col L  (11) Qty
 *  Col M  (12) Unit
 *  Col N  (13) SqFt
 *  Col O  (14) Weight
 *  Col P  (15) R Mtr
 *  Col Q  (16) Remarks
 *
 * NOTE: The PDF download function on the frontend checks each column for
 *       any non-null value across all rows. Columns that are entirely
 *       null/blank are dropped from the generated PDF automatically.
 */
@Entity
@Table(name = "items")
@Data
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Col A (0) ──
    @Column(name = "sr_no")
    private Integer srNo;

    // ── Col B (1) ──
    @Column(name = "win_sr_no")
    private String winSrNo;

    // ── Col C (2) — MANDATORY, resolved to Floor entity ──
    // The raw floor number string from Excel is NOT stored separately;
    // the Floor entity (floor_id FK) is the authoritative reference.

    // ── Col D (3) — MANDATORY ──
    @Column(name = "flat_no")
    private String flatNo;

    // ── Col E (4) ──
    @Column(name = "location")
    private String location;

    // ── Col F (5) — Window Code (was missing before) ──
    @Column(name = "window_code")
    private String windowCode;

    // ── Col G (6) ──
    @Column(name = "job_card_no")
    private String jobCardNo;

    // ── Col H (7) — Priority (was missing before) ──
    @Column(name = "priority")
    private String priority;

    // ── Col I (8) ──
    @Column(name = "description")
    private String description;

    // ── Col J (9) ──
    @Column(name = "width")
    private Double width;

    // ── Col K (10) ──
    @Column(name = "height")
    private Double height;

    // ── Col L (11) ──
    @Column(name = "qty")
    private Integer qty;

    // ── Col M (12) ──
    @Column(name = "unit")
    private String unit;

    // ── Col N (13) ──
    @Column(name = "sqft")
    private Double sqFt;

    // ── Col O (14) — Weight (was missing before) ──
    @Column(name = "weight")
    private Double weight;

    // ── Col P (15) — R Mtr (was missing before) ──
    @Column(name = "r_mtr")
    private Double rMtr;

    // ── Col Q (16) ──
    @Column(name = "remarks")
    private String remarks;

    // ── Relationships ──────────────────────────────────────────────────────

    @ManyToOne
    @JoinColumn(name = "flat_id")
    private Flat flat;

    /** Floor No from Excel — MANDATORY. Resolved to the Floor entity. */
    @ManyToOne
    @JoinColumn(name = "floor_id")
    private Floor floor;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @ManyToOne
    @JoinColumn(name = "tower_id")
    private Tower tower;

    // ── Audit ──────────────────────────────────────────────────────────────

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}