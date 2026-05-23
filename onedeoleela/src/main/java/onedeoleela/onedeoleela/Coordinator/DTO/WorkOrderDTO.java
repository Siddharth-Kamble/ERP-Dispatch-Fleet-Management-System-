package onedeoleela.onedeoleela.Coordinator.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class WorkOrderDTO {

    private String workOrderNo;
    private String projectName;
    private LocalDate date;
    private List<ItemDTO> items;

    public static class ItemDTO {
        private String srNo;

        // ── NEW FIELDS ──────────────────────────
        private String location;
        private String windowCode;
        private String typology;
        private String series;
        // ────────────────────────────────────────

        private BigDecimal length;
        private BigDecimal height;
        private BigDecimal sqft;
        private BigDecimal woQtySqft;
        private BigDecimal woQtyNos;
        private BigDecimal floorPlanQty;

        // Getters & Setters
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

    // Getters & Setters
    public String getWorkOrderNo() { return workOrderNo; }
    public void setWorkOrderNo(String workOrderNo) { this.workOrderNo = workOrderNo; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public List<ItemDTO> getItems() { return items; }
    public void setItems(List<ItemDTO> items) { this.items = items; }
}