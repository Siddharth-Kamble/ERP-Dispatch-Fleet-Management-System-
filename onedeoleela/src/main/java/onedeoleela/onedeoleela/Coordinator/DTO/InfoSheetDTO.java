//package onedeoleela.onedeoleela.Coordinator.DTO;
//
//
//import lombok.*;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.List;
//
//@Data
//@Getter
//@Setter
//public class InfoSheetDTO {
//
//    private Long       workOrderId;   // which WO this sheet belongs to
//    private String     projectName;   // auto-filled from WO
//    private String     towerName;     // auto-filled from WO
//    private String     flatType;      // 1BHK / 2BHK / 3BHK / 4BHK
//    private String     flatNo;
//    private LocalDate  date;
//
//    private List<ItemDTO> items;
//
//    @Data
//    @Getter
//    @Setter
//    public static class ItemDTO {
//        private String     srNo;
//        private String     location;
//        private String     windowCode;
//        private String     typology;
//        private String     series;
//        private BigDecimal length;
//        private BigDecimal height;
//        private BigDecimal sqft;
//    }
//}

package onedeoleela.onedeoleela.Coordinator.DTO;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Getter
@Setter
public class InfoSheetDTO {

    private Long      workOrderId;
    private String    projectName;
    private String    towerName;
    private LocalDate date;

    // Multiple flats in one sheet
    private List<FlatDTO> flats;

    @Data
    @Getter
    @Setter
    public static class FlatDTO {
        private Long         id;       // present on update, null on create
        private String       flatType; // 1BHK / 2BHK / 3BHK / 4BHK
        private String       flatNo;
        private List<ItemDTO> items;
    }

    @Data
    @Getter
    @Setter
    public static class ItemDTO {
        private String     srNo;
        private String     location;
        private String     windowCode;
        private String     typology;
        private String     series;
        private BigDecimal length;
        private BigDecimal height;
        private BigDecimal sqft;
    }
}
