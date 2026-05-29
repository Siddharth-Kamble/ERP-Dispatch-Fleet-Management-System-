
package onedeoleela.onedeoleela.Coordinator.DTO;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Getter
@Setter
public class WorkOrderDTO {

    private String    workOrderNo;
    private String    projectName;
    private String    towerName;        // ── NEW ──
    private LocalDate date;
    private List<ItemDTO> items;

    @Data
    @Getter
    @Setter
    public static class ItemDTO {

        private String srNo;
        private String location;
        private String windowCode;
        private String typology;
        private String series;

        private BigDecimal length;
        private BigDecimal height;
        private BigDecimal sqft;

        private String     woQtyUnit;
        private String     woQtySqftRaw;
        private BigDecimal woQtySqft;
        private BigDecimal woQtyNos;
        private BigDecimal floorPlanQty;

        // ── NEW FIELD ─────────────────────────────────────────────────────────
        private BigDecimal qtyAsPerFloorPlan;
    }
}