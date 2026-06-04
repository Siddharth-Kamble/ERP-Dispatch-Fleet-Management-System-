package onedeoleela.onedeoleela.Coordinator.DTO;


import lombok.Data;
import java.util.List;

@Data
public class InfoSheetExportDTO {

    // Sheet meta
    private Long   sheetId;
    private String workOrderNo;
    private String projectName;
    private String towerName;
    private String date;

    // Project summary
    private Integer totalFloors;
    private Integer flatsPerFloor;
    private Integer totalFlats;         // totalFloors × flatsPerFloor
    private Integer refuseFlats;        // reserved for future — always 0 for now
    private Integer actualWorkableFlats;// totalFlats - refuseFlats

    // Window schedule rows (one per WO item)
    private List<ExportRow> rows;

    // Totals
    private double grandTotalSqft;
    private double totalWindowsPerFloor;      // sum of woQtyNos
    private double totalWindowsPerFloorSqft;  // sum of perFloorSqft
    private double totalWindowsInTower;       // sum of total sqft column
    private double totalWindowsInTowerSqft;   // same as grandTotalSqft

    @Data
    public static class ExportRow {
        private String location;
        private String windowCode;
        private String typology;
        private String series;
        private double length;
        private double height;
        private double sqft;
        private double perFloorCount;   // woQtyNos
        private double perFloorSqft;    // sqft × woQtyNos
        private double total;           // perFloorSqft × totalFloors
        private int    refuseCount;     // 0 for now
        private double netWindow;       // total - refuseCount
        private double netWindowSqft;   // netWindow × sqft
    }
}