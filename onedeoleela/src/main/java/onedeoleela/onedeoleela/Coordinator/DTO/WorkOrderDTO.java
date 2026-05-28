//package onedeoleela.onedeoleela.Coordinator.DTO;
//
//import jakarta.persistence.Entity;
//import lombok.*;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.List;
//
//
//@Data
//@Getter
//@Setter
//public class WorkOrderDTO {
//
//    private String workOrderNo;
//    private String projectName;
//    private LocalDate date;
//    private List<ItemDTO> items;
//
//    public static class ItemDTO {
//        private String srNo;
//
//        // ── NEW FIELDS ──────────────────────────
//        private String location;
//        private String windowCode;
//        private String typology;
//        private String series;
//        // ────────────────────────────────────────
//
//        private BigDecimal length;
//        private BigDecimal height;
//        private BigDecimal sqft;
//        private BigDecimal woQtySqft;
//        private BigDecimal woQtyNos;
//        private BigDecimal floorPlanQty;
//
//    }
//
//}

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

        /** Auto-calculated on frontend: L(mm) × H(mm) ÷ 1,000,000 × 10.764 */
        private BigDecimal sqft;

        /**
         * The unit the user selected for W/O Qty input.
         * Values: "sqft" (use as-is) | "sqm" (multiply by 10.764 to convert)
         */
        private String woQtyUnit;

        /**
         * The raw value entered by the user, before unit conversion.
         * Stored so we can restore it correctly on the edit screen.
         */
        private String woQtySqftRaw;

        /**
         * W/O Qty converted to sqft.
         * If woQtyUnit = "sqm" → woQtySqftRaw × 10.764
         * If woQtyUnit = "sqft" → woQtySqftRaw as-is
         */
        private BigDecimal woQtySqft;

        /**
         * W/O QTY in units (Nos) — integer.
         * Calculated on frontend: floor(woQtySqft / sqft)
         */
        private BigDecimal woQtyNos;

        private BigDecimal floorPlanQty;
    }
}