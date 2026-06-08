////package onedeoleela.onedeoleela.Coordinator.DTO;
////
////import lombok.*;
////
////import java.math.BigDecimal;
////import java.time.LocalDate;
////import java.util.List;
////
////@Data
////@Getter
////@Setter
////public class TrackerSheetDTO {
////
////    private Long      workOrderId;
////    private String    projectName;
////    private String    towerName;
////    private LocalDate date;
////    private List<RowDTO> rows;
////
////    @Data
////    @Getter
////    @Setter
////    public static class RowDTO {
////
////        // Auto-filled from WO
////        private String     srNo;
////        private String     flat;
////        private String     location;
////        private String     wcode;
////        private String     typology;
////        private String     series;
////        private BigDecimal woLnt;
////        private BigDecimal woHgt;
////        private BigDecimal sqft;
////
////        // User filled
////        private BigDecimal length;
////        private BigDecimal height;
////        private String     jobCard;
////
////        // SUPPLY
////        private BigDecimal supplyFrame;
////        private BigDecimal supplyDoorFrame;
////        private BigDecimal supplyShutter;
////        private BigDecimal supplyOpenableDoor;
////        private BigDecimal supplyFixGlass;
////        private BigDecimal supplyTopBottomFix;
////
////        // INSTALLATION
////        private BigDecimal installFrame;
////        private BigDecimal installDoorFrame;
////        private BigDecimal installShutter;
////        private BigDecimal installOpenableDoor;
////        private BigDecimal installFixGlass;
////        private BigDecimal installTopBottomFix;
////
////        // HARDWARE
////        private BigDecimal hwFrame;
////        private BigDecimal hwDoorFrame;
////        private BigDecimal hwShutter;
////        private BigDecimal hwOpenableDoor;
////        private BigDecimal hwFixGlass;
////        private BigDecimal hwTopBottomFix;
////
////        // Extra
////        private String handoverStatus;
////        private String dcNo;
////    }
////}
//
//package onedeoleela.onedeoleela.Coordinator.DTO;
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
//public class TrackerSheetDTO {
//
//    private Long      workOrderId;
//    private String    projectName;
//    private String    towerName;
//    private LocalDate date;
//    private List<RowDTO> rows;
//
//    @Data
//    @Getter
//    @Setter
//    public static class RowDTO {
//
//        // Auto-filled from WO
//        private String     srNo;
//        private String     flat;
//        private String     location;
//        private String     wcode;
//        private String     typology;
//        private String     series;
//        private BigDecimal woLnt;
//        private BigDecimal woHgt;
//        private BigDecimal sqft;
//
//        // User filled
//        private BigDecimal length;
//        private BigDecimal height;
//        private String     jobCard;
//
//        // DC.NO (6 cols)
//        private BigDecimal dcnoFrame;
//        private BigDecimal dcnoDoorFrame;
//        private BigDecimal dcnoShutter;
//        private BigDecimal dcnoOpenableDoor;
//        private BigDecimal dcnoFixGlass;
//        private BigDecimal dcnoTopBottomFix;
//
//        // STATUS (7 cols)
//        private BigDecimal statusFrame;
//        private BigDecimal statusDoorFrame;
//        private BigDecimal statusShutter;
//        private BigDecimal statusOpenableDoor;
//        private BigDecimal statusFixGlass;
//        private BigDecimal statusTopBottomFix;
//        private BigDecimal statusHardware;
//
//        // SUPPLY (6 cols)
//        private BigDecimal supplyFrame;
//        private BigDecimal supplyDoorFrame;
//        private BigDecimal supplyShutter;
//        private BigDecimal supplyOpenableDoor;
//        private BigDecimal supplyFixGlass;
//        private BigDecimal supplyTopBottomFix;
//
//        // INSTALLATION (6 cols)
//        private BigDecimal installFrame;
//        private BigDecimal installDoorFrame;
//        private BigDecimal installShutter;
//        private BigDecimal installOpenableDoor;
//        private BigDecimal installFixGlass;
//        private BigDecimal installTopBottomFix;
//
//        // HARDWARE (6 cols)
//        private BigDecimal hwFrame;
//        private BigDecimal hwDoorFrame;
//        private BigDecimal hwShutter;
//        private BigDecimal hwOpenableDoor;
//        private BigDecimal hwFixGlass;
//        private BigDecimal hwTopBottomFix;
//
//        // Extra
//        private String handoverStatus;
//        private String dcNo;
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
public class TrackerSheetDTO {

    private Long      workOrderId;
    private String    projectName;
    private String    towerName;
    private LocalDate date;
    private List<RowDTO> rows;

    @Data
    @Getter
    @Setter
    public static class RowDTO {

        // Auto-filled from WO
        private String     srNo;
        private String     flat;
        private String     location;
        private String     wcode;
        private String     typology;
        private String     series;
        private BigDecimal woLnt;
        private BigDecimal woHgt;
        private BigDecimal sqft;

        // User filled
        private BigDecimal length;
        private BigDecimal height;
        private String     jobCard;

        // DC.NO (6 cols) — numeric
        private BigDecimal dcnoFrame;
        private BigDecimal dcnoDoorFrame;
        private BigDecimal dcnoShutter;
        private BigDecimal dcnoOpenableDoor;
        private BigDecimal dcnoFixGlass;
        private BigDecimal dcnoTopBottomFix;

        // STATUS (6 cols) — String: user enters "R" or "I"
        // HARDWARE dropped from STATUS
        private String statusFrame;
        private String statusDoorFrame;
        private String statusShutter;
        private String statusOpenableDoor;
        private String statusFixGlass;
        private String statusTopBottomFix;

        // SUPPLY (6 cols) — auto-filled when STATUS = R
        private BigDecimal supplyFrame;
        private BigDecimal supplyDoorFrame;
        private BigDecimal supplyShutter;
        private BigDecimal supplyOpenableDoor;
        private BigDecimal supplyFixGlass;
        private BigDecimal supplyTopBottomFix;

        // INSTALLATION (6 cols) — auto-filled when STATUS = I
        private BigDecimal installFrame;
        private BigDecimal installDoorFrame;
        private BigDecimal installShutter;
        private BigDecimal installOpenableDoor;
        private BigDecimal installFixGlass;
        private BigDecimal installTopBottomFix;

        // Extra
        private String handoverStatus;
        private String dcNo;
    }
}