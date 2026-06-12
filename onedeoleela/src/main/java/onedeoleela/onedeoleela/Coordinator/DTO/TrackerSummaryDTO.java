package onedeoleela.onedeoleela.Coordinator.DTO;

import lombok.Data;
import java.util.List;

@Data
public class TrackerSummaryDTO {

    // Totals
    private int    totalWindowQty;
    private int    totalSizesReceived;
    private int    totalTrackReceived;
    private int    totalShutterReceived;
    private int    totalTrackInstallation;
    private int    totalShutterInstallation;
    private int    pendingSizes;

    // Sqft totals
    private double totalMeasurementSqft;
    private double totalFrameSuppliedSqft;
    private double totalFrameInstalledSqft;
    private double totalShutterSuppliedSqft;
    private double totalShutterInstalledSqft;
    private double totalHandoverSqft;

    // Per-location rows (matches bar chart in image 2)
    private List<LocationRow> locationRows;

    @Data
    public static class LocationRow {
        private String location;
        private String wcode;
        private int    totalWindowQty;
        private int    totalSizesReceived;
        private int    totalTrackReceived;
        private int    totalShutterReceived;
        private int    totalTrackInstallation;
        private int    totalShutterInstallation;
        private int    pendingSizes;
        private double sqftTotal;
        private double woLnt;   // for pie chart (LENGTH)
    }
}