package onedeoleela.onedeoleela.Coordinator.Service;

import onedeoleela.onedeoleela.Coordinator.DTO.TrackerSummaryDTO;
import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheet;
import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheetRow;
import onedeoleela.onedeoleela.Coordinator.Repository.TrackerSheetRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TrackerSummaryService {

    private final TrackerSheetRepository trackerSheetRepository;

    public TrackerSummaryService(TrackerSheetRepository trackerSheetRepository) {
        this.trackerSheetRepository = trackerSheetRepository;
    }

    public TrackerSummaryDTO buildSummary(Long sheetId) {
        TrackerSheet sheet = trackerSheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("Sheet not found: " + sheetId));

        List<TrackerSheetRow> rows = sheet.getRows();

        TrackerSummaryDTO dto = new TrackerSummaryDTO();

        // ── Overall totals ────────────────────────────────────────────────────
        int    totalWindowQty           = rows.size();
        int    totalSizesReceived       = 0;
        int    totalTrackReceived       = 0;
        int    totalShutterReceived     = 0;
        int    totalTrackInstallation   = 0;
        int    totalShutterInstallation = 0;
        double totalMeasurementSqft     = 0;
        double totalFrameSuppliedSqft   = 0;
        double totalFrameInstalledSqft  = 0;
        double totalShutterSuppliedSqft = 0;
        double totalShutterInstalledSqft= 0;
        double totalHandoverSqft        = 0;

        for (TrackerSheetRow r : rows) {
            // A row is "size received" if length and height are filled
            if (r.getLength() != null && r.getHeight() != null) {
                totalSizesReceived++;
            }
            // Track received = SUPPLY FRAME has a value > 0
            if (r.getSupplyFrame() != null && r.getSupplyFrame().doubleValue() > 0) {
                totalTrackReceived++;
            }
            // Shutter received = SUPPLY SHUTTER has a value > 0
            if (r.getSupplyShutter() != null && r.getSupplyShutter().doubleValue() > 0) {
                totalShutterReceived++;
            }
            // Track installation = INSTALL FRAME has a value > 0
            if (r.getInstallFrame() != null && r.getInstallFrame().doubleValue() > 0) {
                totalTrackInstallation++;
            }
            // Shutter installation = INSTALL SHUTTER has a value > 0
            if (r.getInstallShutter() != null && r.getInstallShutter().doubleValue() > 0) {
                totalShutterInstallation++;
            }

            // Sqft totals
            if (r.getSqft() != null) {
                totalMeasurementSqft += r.getSqft().doubleValue();
            }
            if (r.getSupplyFrame() != null) {
                totalFrameSuppliedSqft += r.getSupplyFrame().doubleValue();
            }
            if (r.getInstallFrame() != null) {
                totalFrameInstalledSqft += r.getInstallFrame().doubleValue();
            }
            if (r.getSupplyShutter() != null) {
                totalShutterSuppliedSqft += r.getSupplyShutter().doubleValue();
            }
            if (r.getInstallShutter() != null) {
                totalShutterInstalledSqft += r.getInstallShutter().doubleValue();
            }
            if (r.getHandoverFrame() != null) {
                totalHandoverSqft += r.getHandoverFrame().doubleValue();
            }
        }

        dto.setTotalWindowQty(totalWindowQty);
        dto.setTotalSizesReceived(totalSizesReceived);
        dto.setTotalTrackReceived(totalTrackReceived);
        dto.setTotalShutterReceived(totalShutterReceived);
        dto.setTotalTrackInstallation(totalTrackInstallation);
        dto.setTotalShutterInstallation(totalShutterInstallation);
        dto.setPendingSizes(totalWindowQty - totalSizesReceived);
        dto.setTotalMeasurementSqft(totalMeasurementSqft);
        dto.setTotalFrameSuppliedSqft(totalFrameSuppliedSqft);
        dto.setTotalFrameInstalledSqft(totalFrameInstalledSqft);
        dto.setTotalShutterSuppliedSqft(totalShutterSuppliedSqft);
        dto.setTotalShutterInstalledSqft(totalShutterInstalledSqft);
        dto.setTotalHandoverSqft(totalHandoverSqft);

        // ── Per location+wcode rows (for bar chart and table) ─────────────────
        // Group rows by location + wcode
        Map<String, List<TrackerSheetRow>> grouped = rows.stream()
                .collect(Collectors.groupingBy(
                        r -> (r.getLocation() != null ? r.getLocation() : "") + "||" +
                                (r.getWcode()    != null ? r.getWcode()    : "")
                ));

        List<TrackerSummaryDTO.LocationRow> locationRows = new ArrayList<>();

        grouped.forEach((key, groupRows) -> {
            String[] parts    = key.split("\\|\\|");
            String   location = parts.length > 0 ? parts[0] : "";
            String   wcode    = parts.length > 1 ? parts[1] : "";

            TrackerSummaryDTO.LocationRow lr = new TrackerSummaryDTO.LocationRow();
            lr.setLocation(location);
            lr.setWcode(wcode);
            lr.setTotalWindowQty(groupRows.size());

            int    szRec   = 0;
            int    trRec   = 0;
            int    shRec   = 0;
            int    trInst  = 0;
            int    shInst  = 0;
            double sqftSum = 0;
            double lntSum  = 0;

            for (TrackerSheetRow r : groupRows) {
                if (r.getLength()  != null && r.getHeight()   != null) szRec++;
                if (r.getSupplyFrame()  != null && r.getSupplyFrame().doubleValue()  > 0) trRec++;
                if (r.getSupplyShutter()!= null && r.getSupplyShutter().doubleValue()> 0) shRec++;
                if (r.getInstallFrame() != null && r.getInstallFrame().doubleValue() > 0) trInst++;
                if (r.getInstallShutter()!=null && r.getInstallShutter().doubleValue()>0) shInst++;
                if (r.getSqft()  != null) sqftSum += r.getSqft().doubleValue();
                if (r.getWoLnt() != null) lntSum  += r.getWoLnt().doubleValue();
            }

            lr.setTotalSizesReceived(szRec);
            lr.setTotalTrackReceived(trRec);
            lr.setTotalShutterReceived(shRec);
            lr.setTotalTrackInstallation(trInst);
            lr.setTotalShutterInstallation(shInst);
            lr.setPendingSizes(groupRows.size() - szRec);
            lr.setSqftTotal(sqftSum);
            lr.setWoLnt(lntSum / groupRows.size()); // avg length for pie chart
            locationRows.add(lr);
        });

        // Sort by location name
        locationRows.sort(Comparator.comparing(TrackerSummaryDTO.LocationRow::getLocation));
        dto.setLocationRows(locationRows);

        return dto;
    }
}