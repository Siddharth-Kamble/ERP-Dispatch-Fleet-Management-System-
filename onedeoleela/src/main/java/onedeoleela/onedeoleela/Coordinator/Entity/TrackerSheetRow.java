package onedeoleela.onedeoleela.Coordinator.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tracker_sheet_rows")
public class TrackerSheetRow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tracker_sheet_id", nullable = false)
    @JsonIgnore
    private TrackerSheet trackerSheet;

    // ── Auto-filled from WO (read-only) ───────────────────────────────────────
    @Column(name = "sr_no")
    private String srNo;

    @Column(name = "flat")
    private String flat;

    @Column(name = "location")
    private String location;

    @Column(name = "wcode")
    private String wcode;

    @Column(name = "typology")
    private String typology;

    @Column(name = "series")
    private String series;

    @Column(name = "wo_lnt", precision = 10, scale = 4)
    private BigDecimal woLnt;

    @Column(name = "wo_hgt", precision = 10, scale = 4)
    private BigDecimal woHgt;

    @Column(name = "sqft", precision = 12, scale = 4)
    private BigDecimal sqft;

    // ── User filled ───────────────────────────────────────────────────────────
    @Column(name = "length", precision = 10, scale = 4)
    private BigDecimal length;

    @Column(name = "height", precision = 10, scale = 4)
    private BigDecimal height;

    @Column(name = "job_card", length = 100)
    private String jobCard;

    // ── SUPPLY sub-columns ────────────────────────────────────────────────────
    @Column(name = "supply_frame",          precision = 10, scale = 4) private BigDecimal supplyFrame;
    @Column(name = "supply_door_frame",     precision = 10, scale = 4) private BigDecimal supplyDoorFrame;
    @Column(name = "supply_shutter",        precision = 10, scale = 4) private BigDecimal supplyShutter;
    @Column(name = "supply_openable_door",  precision = 10, scale = 4) private BigDecimal supplyOpenableDoor;
    @Column(name = "supply_fix_glass",      precision = 10, scale = 4) private BigDecimal supplyFixGlass;
    @Column(name = "supply_top_bottom_fix", precision = 10, scale = 4) private BigDecimal supplyTopBottomFix;

    // ── INSTALLATION sub-columns ──────────────────────────────────────────────
    @Column(name = "install_frame",          precision = 10, scale = 4) private BigDecimal installFrame;
    @Column(name = "install_door_frame",     precision = 10, scale = 4) private BigDecimal installDoorFrame;
    @Column(name = "install_shutter",        precision = 10, scale = 4) private BigDecimal installShutter;
    @Column(name = "install_openable_door",  precision = 10, scale = 4) private BigDecimal installOpenableDoor;
    @Column(name = "install_fix_glass",      precision = 10, scale = 4) private BigDecimal installFixGlass;
    @Column(name = "install_top_bottom_fix", precision = 10, scale = 4) private BigDecimal installTopBottomFix;

    // ── HARDWARE sub-columns ──────────────────────────────────────────────────
    @Column(name = "hw_frame",          precision = 10, scale = 4) private BigDecimal hwFrame;
    @Column(name = "hw_door_frame",     precision = 10, scale = 4) private BigDecimal hwDoorFrame;
    @Column(name = "hw_shutter",        precision = 10, scale = 4) private BigDecimal hwShutter;
    @Column(name = "hw_openable_door",  precision = 10, scale = 4) private BigDecimal hwOpenableDoor;
    @Column(name = "hw_fix_glass",      precision = 10, scale = 4) private BigDecimal hwFixGlass;
    @Column(name = "hw_top_bottom_fix", precision = 10, scale = 4) private BigDecimal hwTopBottomFix;

    // ── Extra ─────────────────────────────────────────────────────────────────
    @Column(name = "handover_status", length = 100)
    private String handoverStatus;

    @Column(name = "dc_no", length = 50)
    private String dcNo;
}