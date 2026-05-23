package onedeoleela.onedeoleela.Coordinator.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

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

    // ── NEW FIELDS ──────────────────────────────────────
    @Column(name = "location")
    private String location;

    @Column(name = "window_code")
    private String windowCode;

    @Column(name = "typology")
    private String typology;

    @Column(name = "series")
    private String series;
    // ────────────────────────────────────────────────────

    @Column(precision = 10, scale = 2)
    private BigDecimal length;

    @Column(precision = 10, scale = 2)
    private BigDecimal height;

    @Column(precision = 12, scale = 2)
    private BigDecimal sqft;

    @Column(name = "wo_qty_sqft", precision = 12, scale = 2)
    private BigDecimal woQtySqft;

    @Column(name = "wo_qty_nos", precision = 10, scale = 2)
    private BigDecimal woQtyNos;

    @Column(name = "floor_plan_qty", precision = 10, scale = 2)
    private BigDecimal floorPlanQty;

    // ── Getters & Setters ────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public WorkOrder getWorkOrder() { return workOrder; }
    public void setWorkOrder(WorkOrder workOrder) { this.workOrder = workOrder; }

    public String getSrNo() { return srNo; }
    public void setSrNo(String srNo) { this.srNo = srNo; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWindowCode() { return windowCode; }
    public void setWindowCode(String windowCode) { this.windowCode = windowCode; }

    public String getTypology() { return typology; }
    public void setTypology(String typology) { this.typology = typology; }

    public String getSeries() { return series; }
    public void setSeries(String series) { this.series = series; }

    public BigDecimal getLength() { return length; }
    public void setLength(BigDecimal length) { this.length = length; }

    public BigDecimal getHeight() { return height; }
    public void setHeight(BigDecimal height) { this.height = height; }

    public BigDecimal getSqft() { return sqft; }
    public void setSqft(BigDecimal sqft) { this.sqft = sqft; }

    public BigDecimal getWoQtySqft() { return woQtySqft; }
    public void setWoQtySqft(BigDecimal woQtySqft) { this.woQtySqft = woQtySqft; }

    public BigDecimal getWoQtyNos() { return woQtyNos; }
    public void setWoQtyNos(BigDecimal woQtyNos) { this.woQtyNos = woQtyNos; }

    public BigDecimal getFloorPlanQty() { return floorPlanQty; }
    public void setFloorPlanQty(BigDecimal floorPlanQty) { this.floorPlanQty = floorPlanQty; }
}