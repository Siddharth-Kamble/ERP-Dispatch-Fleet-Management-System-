//package onedeoleela.onedeoleela.Coordinator.Entity;
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import jakarta.persistence.*;
//import lombok.*;
//
//import java.math.BigDecimal;
//
//@Data
//@Getter
//@Setter
//@AllArgsConstructor
//@NoArgsConstructor
//@Entity
//@Table(name = "work_order_items")
//public class WorkOrderItem {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "work_order_id", nullable = false)
//    @JsonIgnore
//    private WorkOrder workOrder;
//
//    @Column(name = "sr_no")
//    private String srNo;
//
//    // ── NEW FIELDS ──────────────────────────────────────
//    @Column(name = "location")
//    private String location;
//
//    @Column(name = "window_code")
//    private String windowCode;
//
//    @Column(name = "typology")
//    private String typology;
//
//    @Column(name = "series")
//    private String series;
//    // ────────────────────────────────────────────────────
//
//    @Column(precision = 10, scale = 2)
//    private BigDecimal length;
//
//    @Column(precision = 10, scale = 2)
//    private BigDecimal height;
//
//    @Column(precision = 12, scale = 2)
//    private BigDecimal sqft;
//
//    @Column(name = "wo_qty_sqft", precision = 12, scale = 2)
//    private BigDecimal woQtySqft;
//
//    @Column(name = "wo_qty_nos", precision = 10, scale = 2)
//    private BigDecimal woQtyNos;
//
//    @Column(name = "floor_plan_qty", precision = 10, scale = 2)
//    private BigDecimal floorPlanQty;
//
//
//}


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
@Table(name = "work_order_items")
public class WorkOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    @JsonIgnore
    private WorkOrder workOrder;

    @Column(name = "sr_no")
    private String srNo;

    @Column(name = "location")
    private String location;

    @Column(name = "window_code")
    private String windowCode;

    @Column(name = "typology")
    private String typology;

    @Column(name = "series")
    private String series;

    /** Length in millimetres as entered by the user */
    @Column(precision = 10, scale = 4)
    private BigDecimal length;

    /** Height in millimetres as entered by the user */
    @Column(precision = 10, scale = 4)
    private BigDecimal height;

    /**
     * Sqft auto-calculated from: L(mm) × H(mm) ÷ 1,000,000 × 10.764
     * Computed on the frontend; stored here for reference and server-side audit.
     */
    @Column(precision = 12, scale = 4)
    private BigDecimal sqft;

    /**
     * Unit used for the W/O Qty (Sqft) column.
     * "sqft" = values entered directly in sqft (no conversion).
     * "sqm"  = values entered in sqm; converted to sqft by × 10.764.
     */
    @Column(name = "wo_qty_unit", length = 10)
    private String woQtyUnit;

    /**
     * The raw W/O Qty value as entered by the user (before unit conversion).
     * Stored as a string to preserve exactly what was typed.
     */
    @Column(name = "wo_qty_sqft_raw", length = 50)
    private String woQtySqftRaw;

    /**
     * W/O Qty converted to sqft.
     * If woQtyUnit = "sqm" → raw × 10.764; if "sqft" → raw as-is.
     */
    @Column(name = "wo_qty_sqft", precision = 12, scale = 4)
    private BigDecimal woQtySqft;

    /**
     * W/O QTY in Nos — integer count.
     * Calculated as: floor(woQtySqft / sqft).
     * Stored as BigDecimal for JPA compatibility; always a whole number.
     */
    @Column(name = "wo_qty_nos", precision = 10, scale = 0)
    private BigDecimal woQtyNos;

    @Column(name = "floor_plan_qty", precision = 10, scale = 4)
    private BigDecimal floorPlanQty;
}