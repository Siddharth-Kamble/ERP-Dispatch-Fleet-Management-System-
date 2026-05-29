
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

    @Column(precision = 10, scale = 4)
    private BigDecimal length;

    @Column(precision = 10, scale = 4)
    private BigDecimal height;

    @Column(precision = 12, scale = 4)
    private BigDecimal sqft;

    @Column(name = "wo_qty_unit", length = 10)
    private String woQtyUnit;

    @Column(name = "wo_qty_sqft_raw", length = 50)
    private String woQtySqftRaw;

    @Column(name = "wo_qty_sqft", precision = 12, scale = 4)
    private BigDecimal woQtySqft;

    @Column(name = "wo_qty_nos", precision = 10, scale = 0)
    private BigDecimal woQtyNos;

    @Column(name = "floor_plan_qty", precision = 10, scale = 4)
    private BigDecimal floorPlanQty;

    // ── NEW FIELD ─────────────────────────────────────────────────────────────
    @Column(name = "qty_as_per_floor_plan", precision = 10, scale = 4)
    private BigDecimal qtyAsPerFloorPlan;
}