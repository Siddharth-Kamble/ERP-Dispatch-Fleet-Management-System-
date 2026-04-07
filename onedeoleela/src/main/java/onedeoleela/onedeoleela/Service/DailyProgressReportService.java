

package onedeoleela.onedeoleela.Service;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.DailyProgressReport;
import onedeoleela.onedeoleela.Repository.DailyProgressReportRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.stereotype.Service;


import java.io.ByteArrayOutputStream;
import java.io.IOException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DailyProgressReportService {

    private final DailyProgressReportRepository repository;

    /** Cloudinary URL for the company logo shown in the top-left corner. */
    private static final String LOGO_URL =
            "https://res.cloudinary.com/dhmcijhts/image/upload/v1774439813/updytp3rs57vhqtdbx1p.png";

    // ─────────────────────────────────────────────────────────────────────────
    // CRUD
    // ─────────────────────────────────────────────────────────────────────────

    public DailyProgressReport save(DailyProgressReport report) {

        validateTargetAchieve(report);   // ✅ ADD THIS

        return repository.save(report);
    }

    public List<DailyProgressReport> saveAll(List<DailyProgressReport> reports) {

        reports.forEach(this::validateTargetAchieve);   // ✅ ADD THIS

        return repository.saveAll(reports);
    }

    public List<DailyProgressReport> getByDate(LocalDate date) {
        return repository.findByReportDateOrderBySrNoAscTripNumberAsc(date);

    }

    public List<DailyProgressReport> getByDateRange(LocalDate from, LocalDate to) {
        return repository.findByReportDateBetweenOrderByReportDateAscSrNoAscTripNumberAsc(from, to);
    }

    public List<DailyProgressReport> getByDriver(LocalDate date, String driverName) {
        return repository.findByReportDateAndDriverNameIgnoreCaseOrderBySrNoAscTripNumberAsc(date, driverName);
    }

    public List<DailyProgressReport> getByVehicle(LocalDate date, String vehicleNumber) {
        return repository.findByReportDateAndVehicleNumberIgnoreCaseOrderBySrNoAscTripNumberAsc(date, vehicleNumber);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    public List<LocalDate> getAvailableDates() {
        return repository.findDistinctReportDates();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WORKING HOURS CALCULATION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Parses a timeSlot string like "9:00-10:00 AM", "10:45-5:30 PM", "3:30-5:00 PM"
     * and returns the duration in decimal hours (e.g. 1.0, 6.75, 1.5).
     *
     * Handles AM/PM on the END time and infers the start time period accordingly.
     * Returns 0.0 if the string cannot be parsed (e.g. "CANCEL", null, empty).
     *
     * Format expected:  H:mm-H:mm AM|PM   or   H:mm-H:mm
     */
    public static double parseHours(String timeSlot) {
        if (timeSlot == null || timeSlot.isBlank()) return 0.0;

        String ts = timeSlot.trim().toUpperCase();
        if (ts.equals("CANCEL") || ts.equals("CANCELLED")) return 0.0;

        // Strip AM/PM suffix from the whole string
        boolean endIsPM = ts.endsWith("PM");
        boolean endIsAM = ts.endsWith("AM");
        ts = ts.replace("PM", "").replace("AM", "").trim();

        // Split on dash to get start and end tokens
        String[] parts = ts.split("-");
        if (parts.length != 2) return 0.0;

        try {
            double startH = parseTimeToDecimal(parts[0].trim());
            double endH   = parseTimeToDecimal(parts[1].trim());

            // Apply PM to end time
            if (endIsPM && endH < 12.0) endH += 12.0;
            if (endIsAM && endH == 12.0) endH = 0.0;  // 12:xx AM → 0:xx

            // If end <= start after PM adjustment, start is likely AM (no adjustment needed)
            // If end is still less than start, it might be a cross-noon scenario with no AM/PM
            // We assume start < end always in a normal work day
            if (endH < startH) {
                // Treat end as next period (e.g. 10:45-5:30 where 5:30 means PM already applied)
                // This shouldn't happen after PM adjustment; guard against data entry errors
                endH += 12.0;
            }

            double duration = endH - startH;
            return Math.max(0.0, duration);

        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private static double parseTimeToDecimal(String token) {
        // token is like "9:00" or "10:45"
        String[] hm = token.split(":");
        if (hm.length != 2) throw new NumberFormatException("Invalid time token: " + token);
        double hours   = Double.parseDouble(hm[0].trim());
        double minutes = Double.parseDouble(hm[1].trim());
        return hours + minutes / 60.0;
    }

    /**
     * Format decimal hours to "Xh Ym" string, e.g. 8.75 → "8h 45m".
     */
    private static String formatHours(double totalHours) {
        int h = (int) totalHours;
        int m = (int) Math.round((totalHours - h) * 60);
        if (m == 60) { h++; m = 0; }
        if (h == 0 && m == 0) return "0h";
        if (h == 0) return m + "m";
        if (m == 0) return h + "h";
        return h + "h " + m + "m";
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGO DOWNLOAD
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Downloads the company logo from Cloudinary and returns the raw PNG bytes.
     * Returns null if the download fails (logo will be skipped gracefully).
     */
    private byte[] downloadLogo() {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .followRedirects(HttpClient.Redirect.ALWAYS)
                    .build();
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(LOGO_URL))
                    .GET()
                    .build();
            HttpResponse<byte[]> resp = client.send(req, HttpResponse.BodyHandlers.ofByteArray());
            if (resp.statusCode() == 200) return resp.body();
        } catch (Exception e) {
            // Log and continue — logo is non-critical
            System.err.println("Logo download failed: " + e.getMessage());
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXCEL EXPORT — Daily Progress Report (original format)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generates an .xlsx workbook titled "DAILY PROGRESS REPORT" that mirrors
     * the original printed report layout.
     */
    public byte[] generateExcel(LocalDate date) throws IOException {
        return buildWorkbook(date, "DAILY PROGRESS REPORT");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXCEL EXPORT — Daily Planning (new format, same layout)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generates an .xlsx workbook titled "DAILY PLANNING" — same layout as the
     * Daily Progress Report but with the header renamed.
     */
    public byte[] generateDailyPlanningExcel(LocalDate date) throws IOException {
        return buildWorkbook(date, "DAILY PLANNING");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SHARED WORKBOOK BUILDER
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Core workbook builder shared by both export types.
     *
     * @param date       the report date
     * @param reportTitle either "DAILY PROGRESS REPORT" or "DAILY PLANNING"
     */
    private byte[] buildWorkbook(LocalDate date, String reportTitle) throws IOException {

        List<DailyProgressReport> rows =
                repository.findByReportDateOrderBySrNoAscTripNumberAsc(date);
        rows = rows.stream()
                .sorted(Comparator.comparing(
                        r -> r.getVehicleNumber() != null ? r.getVehicleNumber().trim() : ""
                ))
                .toList();

        String employeeName = rows.isEmpty() ? "" : rows.get(0).getEmployeeName();
        String reportDateStr = date.format(DateTimeFormatter.ofPattern("dd.MM.yyyy"));

        // Special note — first non-blank value from any row for this date
        String specialNote = rows.stream()
                .map(DailyProgressReport::getSpecialNote)
                .filter(s -> s != null && !s.isBlank())
                .findFirst()
                .orElse("");

        // Download logo (may be null if unavailable)
        byte[] logoBytes = downloadLogo();

        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = wb.createSheet(reportTitle);

            // ── Column widths ──
            // A: SR.NO | B: VEHICLE NO. | C: TRIP | D: DRIVER | E: DESCRIPTION
            // F: FROM  | G: TO          | H: TIME | I: TARGET ACHIEVE | J: REMARK
            int[] colWidths = {8, 15, 8, 14, 40, 20, 28, 18, 20, 22};
            for (int i = 0; i < colWidths.length; i++) {
                sheet.setColumnWidth(i, colWidths[i] * 256);
            }

            // ── Shared styles ──
            CellStyle titleStyle      = makeTitleStyle(wb);
            CellStyle subTitleStyle   = makeSubTitleStyle(wb);
            CellStyle headerBlueStyle = makeHeaderBlueStyle(wb);
            CellStyle colHeaderStyle  = makeColHeaderStyle(wb);
            CellStyle normalStyle     = makeNormalStyle(wb);
            CellStyle normalBoldStyle = makeNormalBoldStyle(wb);
            CellStyle achieveStyle    = makeAchieveStyle(wb);
            CellStyle redFillStyle    = makeRedFillStyle(wb);
            CellStyle cancelTextStyle = makeCancelTextStyle(wb);
            CellStyle otherStyle      = makeOtherStyle(wb);
            CellStyle notAchievedStyle = makeNotAchievedStyle(wb);

            int rowIdx = 0;

            // ── Row 0: Company name (columns B–J; column A reserved for logo) ──
            Row r0 = sheet.createRow(rowIdx++);
            r0.setHeightInPoints(28);
            Cell c0 = r0.createCell(1);
            c0.setCellValue("ONE DEO LEELA FAÇADE SYSTEMS PVT LTD.");
            c0.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 1, 9));

            // ── Row 1: Report title ──
            Row r1 = sheet.createRow(rowIdx++);
            r1.setHeightInPoints(22);
            Cell c1 = r1.createCell(1);
            c1.setCellValue(reportTitle);
            c1.setCellStyle(subTitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 1, 9));

            // ── Row 2: Employee name + Date ──
            Row r2 = sheet.createRow(rowIdx++);
            r2.setHeightInPoints(20);
            Cell empCell = r2.createCell(1);
            empCell.setCellValue("Employ Name :- " + employeeName);
            empCell.setCellStyle(headerBlueStyle);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 1, 7));

            Cell dateCell = r2.createCell(8);
            dateCell.setCellValue("DATE : " + reportDateStr);
            dateCell.setCellStyle(normalBoldStyle);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 8, 9));

            // ── Row 3: Section headers ──
            Row r3 = sheet.createRow(rowIdx++);
            r3.setHeightInPoints(18);
            Cell deptCell = r3.createCell(0);
            deptCell.setCellValue("DISPATCH DEPARTMENT");
            deptCell.setCellStyle(colHeaderStyle);
            sheet.addMergedRegion(new CellRangeAddress(3, 3, 0, 3));

            Cell schedCell = r3.createCell(5);
            schedCell.setCellValue("SCHEDULE");
            schedCell.setCellStyle(colHeaderStyle);
            sheet.addMergedRegion(new CellRangeAddress(3, 3, 5, 7));

            // ── Row 4: Column headers ──
            Row r4 = sheet.createRow(rowIdx++);
            r4.setHeightInPoints(18);
            String[] headers = {"SR.NO", "VEHICLE NO.", "TRIP", "DRIVER",
                    "DESCRIPTION", "FROM", "TO", "TIME", "TARGET ACHIEVE", "REMARK"};
            for (int i = 0; i < headers.length; i++) {
                Cell hc = r4.createCell(i);
                hc.setCellValue(headers[i]);
                hc.setCellStyle(colHeaderStyle);
            }

            // ── Blank separator row ──
            sheet.createRow(rowIdx++).setHeightInPoints(8);

            // ── Group rows by SR.NO ──
            Map<String, List<DailyProgressReport>> grouped = rows.stream()
                    .collect(Collectors.groupingBy(
                            r -> r.getVehicleNumber() != null ? r.getVehicleNumber().trim() : "",
                            LinkedHashMap::new,
                            Collectors.toList()
                    ));
            double grandTotalHours = 0.0;
            int srNo = 1;

            for (Map.Entry<String, List<DailyProgressReport>> entrySet : grouped.entrySet()) {

                String vehicleNumber = entrySet.getKey();
                List<DailyProgressReport> group = entrySet.getValue();

                // Ensure at least 3 display rows per vehicle group
                int displayRows = Math.max(group.size(), 3);

                // Sum working hours for this vehicle group
                double groupHours = group.stream()
                        .mapToDouble(e -> parseHours(e.getTimeSlot()))
                        .sum();
                grandTotalHours += groupHours;

                for (int i = 0; i < displayRows; i++) {
                    Row dataRow = sheet.createRow(rowIdx++);
                    dataRow.setHeightInPoints(16);

                    DailyProgressReport entry = (i < group.size()) ? group.get(i) : null;

                    // SR.NO — only on first row of group
                    Cell srCell = dataRow.createCell(0);
                    if (i == 0) srCell.setCellValue(srNo);
                    srCell.setCellStyle(normalStyle);

                    // VEHICLE NO. — only on first row of group
                    Cell vnCell = dataRow.createCell(1);
                    if (i == 0 && entry != null && entry.getVehicleNumber() != null) {
                        vnCell.setCellValue(entry.getVehicleNumber());
                    }
                    vnCell.setCellStyle(normalStyle);

                    if (entry != null) {
                        // TRIP
                        Cell tripCell = dataRow.createCell(2);
                        tripCell.setCellValue(entry.getTripNumber());
                        tripCell.setCellStyle(normalStyle);

                        // DRIVER
                        Cell driverCell = dataRow.createCell(3);
                        driverCell.setCellValue(nvl(entry.getDriverName()));
                        driverCell.setCellStyle(normalStyle);

                        // DESCRIPTION — red fill for BREAKDOWN
                        Cell descCell = dataRow.createCell(4);
                        descCell.setCellValue(nvl(entry.getDescription()));
                        descCell.setCellStyle(
                                entry.getTargetAchieve() == DailyProgressReport.TargetStatus.BREAKDOWN
                                        ? redFillStyle : normalStyle);

                        // FROM
                        Cell fromCell = dataRow.createCell(5);
                        fromCell.setCellValue(nvl(entry.getFromLocation()));
                        fromCell.setCellStyle(normalStyle);

                        // TO
                        Cell toCell = dataRow.createCell(6);
                        toCell.setCellValue(nvl(entry.getToLocation()));
                        toCell.setCellStyle(normalStyle);

                        // TIME — red text for CANCELLED
                        Cell timeCell = dataRow.createCell(7);
                        timeCell.setCellValue(nvl(entry.getTimeSlot()));
                        timeCell.setCellStyle(
                                entry.getTargetAchieve() == DailyProgressReport.TargetStatus.CANCELLED
                                        ? cancelTextStyle : normalStyle);

                        // TARGET ACHIEVE — colour-coded cell
                        Cell targetCell = dataRow.createCell(8);
                        applyTargetCell(targetCell, entry, achieveStyle, redFillStyle,
                                notAchievedStyle, normalStyle, otherStyle);

                        // REMARK
                        Cell remarkCell = dataRow.createCell(9);
                        remarkCell.setCellValue(nvl(entry.getRemark()));
                        remarkCell.setCellStyle(normalStyle);

                    } else {
                        // Blank row — fill remaining cells with border
                        for (int col = 2; col <= 9; col++) {
                            dataRow.createCell(col).setCellStyle(normalStyle);
                        }
                    }

                }

                srNo++;
                sheet.createRow(rowIdx++).setHeightInPoints(8);
            }

            // ── Summary footer ──
            long totalTrips = repository.countTripsByDate(date);

            Row totalRow = sheet.createRow(rowIdx++);
            totalRow.setHeightInPoints(16);
            Cell totalLbl = totalRow.createCell(0);
            totalLbl.setCellValue("TOTAL TRIP");
            totalLbl.setCellStyle(normalBoldStyle);
            Cell totalVal = totalRow.createCell(2);
            totalVal.setCellValue(totalTrips);
            totalVal.setCellStyle(normalStyle);

            Row driverRow = sheet.createRow(rowIdx++);
            driverRow.setHeightInPoints(16);
            Cell driverLbl = driverRow.createCell(0);
            driverLbl.setCellValue("DRIVER");
            driverLbl.setCellStyle(normalBoldStyle);

            // ── Special Note row ──
            Row noteRow = sheet.createRow(rowIdx++);
            noteRow.setHeightInPoints(16);
            Cell noteLbl = noteRow.createCell(0);
            noteLbl.setCellValue("Special Note:-");
            noteLbl.setCellStyle(normalBoldStyle);

            // User-provided special note (not hardcoded)
            Cell noteVal = noteRow.createCell(1);
            noteVal.setCellValue(specialNote);
            noteVal.setCellStyle(headerBlueStyle);
            sheet.addMergedRegion(new CellRangeAddress(
                    noteRow.getRowNum(), noteRow.getRowNum(), 1, 6));

            Cell workHourLbl = noteRow.createCell(7);
            workHourLbl.setCellValue("Total Working Hour");
            workHourLbl.setCellStyle(normalBoldStyle);
            sheet.addMergedRegion(new CellRangeAddress(
                    noteRow.getRowNum(), noteRow.getRowNum(), 7, 8));

            // ── Total working hours value ──
            Cell workHourVal = noteRow.createCell(9);
            workHourVal.setCellValue(formatHours(grandTotalHours));
            workHourVal.setCellStyle(normalBoldStyle);

            // ── Embed logo in column A rows 0–2 ──
            if (logoBytes != null) {
                embedLogo(wb, sheet, logoBytes);
            }

            wb.write(out);
            return out.toByteArray();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGO EMBED HELPER
    // ─────────────────────────────────────────────────────────────────────────

    private void embedLogo(XSSFWorkbook wb, XSSFSheet sheet, byte[] logoBytes) {
        try {
            int pictureIdx = wb.addPicture(logoBytes, Workbook.PICTURE_TYPE_PNG);
            CreationHelper helper = wb.getCreationHelper();
            Drawing<?> drawing = sheet.createDrawingPatriarch();
            ClientAnchor anchor = helper.createClientAnchor();

            // Place logo in column A (col 0), spanning rows 0–2
            anchor.setCol1(0);
            anchor.setRow1(0);
            anchor.setCol2(1);   // ends before column B
            anchor.setRow2(3);   // spans rows 0, 1, 2
            anchor.setAnchorType(ClientAnchor.AnchorType.MOVE_AND_RESIZE);

            drawing.createPicture(anchor, pictureIdx);
        } catch (Exception e) {
            System.err.println("Logo embed failed: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TARGET ACHIEVE CELL RENDERER
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Applies the correct value and style to the TARGET ACHIEVE cell based on the
     * entry's targetAchieve status.
     *
     * Status → display text → cell style:
     *   ACHIEVE      → "ACHIEVE"                        → green fill, white bold text
     *   CANCELLED    → "GLASS MATERIAL NOT RECEIVED"    → red fill, white bold text
     *   BREAKDOWN    → "VEHICLE BREAK DOWN"             → red fill, white bold text
     *   NOT_ACHIEVED → "NOT ACHIEVED"                   → red fill, white bold text
     *   OTHER        → entry.targetAchieveOther (custom)→ orange/amber fill, white bold text
     *   PENDING/null → ""                               → normal style
     */
    private void applyTargetCell(
            Cell cell,
            DailyProgressReport entry,
            CellStyle achieveStyle,
            CellStyle redFillStyle,
            CellStyle notAchievedStyle,
            CellStyle normalStyle,
            CellStyle otherStyle) {

        DailyProgressReport.TargetStatus status = entry.getTargetAchieve();
        if (status == null) status = DailyProgressReport.TargetStatus.PENDING;

        switch (status) {
            case ACHIEVE -> {
                cell.setCellValue("ACHIEVE");
                cell.setCellStyle(achieveStyle);
            }
            case CANCELLED -> {
                cell.setCellValue("GLASS MATERIAL NOT RECEIVED");
                cell.setCellStyle(redFillStyle);
            }
            case BREAKDOWN -> {
                cell.setCellValue("VEHICLE BREAK DOWN");
                cell.setCellStyle(redFillStyle);
            }
            case NOT_ACHIEVED -> {
                cell.setCellValue("NOT ACHIEVED");
                cell.setCellStyle(notAchievedStyle);
            }
            case OTHER -> {
                // Custom text specified by user in targetAchieveOther field
                String customText = (entry.getTargetAchieveOther() != null
                        && !entry.getTargetAchieveOther().isBlank())
                        ? entry.getTargetAchieveOther().toUpperCase()
                        : "OTHER";
                cell.setCellValue(customText);
                cell.setCellStyle(otherStyle);
            }
            default -> {
                cell.setCellValue("");
                cell.setCellStyle(normalStyle);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NULL-SAFE STRING HELPER
    // ─────────────────────────────────────────────────────────────────────────

    private String nvl(String s) {
        return s != null ? s : "";
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STYLE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private CellStyle makeTitleStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setFontHeightInPoints((short) 16);
        f.setColor(new XSSFColor(new byte[]{(byte) 0x1F, (byte) 0x49, (byte) 0x7D}, null));
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorder(s);
        return s;
    }

    private CellStyle makeSubTitleStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setFontHeightInPoints((short) 13);
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        ((XSSFCellStyle) s).setFillForegroundColor(
                new XSSFColor(new byte[]{(byte) 0xFF, (byte) 0xC0, (byte) 0x00}, null)); // gold
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorder(s);
        return s;
    }

    private CellStyle makeHeaderBlueStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setFontHeightInPoints((short) 11);
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        ((XSSFCellStyle) s).setFillForegroundColor(
                new XSSFColor(new byte[]{(byte) 0x00, (byte) 0xB0, (byte) 0xF0}, null)); // cyan-blue
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorder(s);
        return s;
    }

    private CellStyle makeColHeaderStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setFontHeightInPoints((short) 10);
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        s.setWrapText(true);
        ((XSSFCellStyle) s).setFillForegroundColor(
                new XSSFColor(new byte[]{(byte) 0xD9, (byte) 0xE1, (byte) 0xF2}, null)); // light blue-grey
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorder(s);
        return s;
    }

    private CellStyle makeNormalStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        s.setWrapText(true);
        setBorder(s);
        return s;
    }

    private CellStyle makeNormalBoldStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setBold(true);
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.LEFT);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorder(s);
        return s;
    }

    private CellStyle makeAchieveStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        ((XSSFCellStyle) s).setFillForegroundColor(
                new XSSFColor(new byte[]{(byte) 0x70, (byte) 0xAD, (byte) 0x47}, null)); // green
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorder(s);
        return s;
    }

    private CellStyle makeRedFillStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        ((XSSFCellStyle) s).setFillForegroundColor(
                new XSSFColor(new byte[]{(byte) 0xFF, (byte) 0x00, (byte) 0x00}, null)); // red
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorder(s);
        return s;
    }

    /**
     * NOT_ACHIEVED — dark red fill with white bold text.
     * Slightly different shade from CANCELLED/BREAKDOWN to distinguish them visually.
     */
    private CellStyle makeNotAchievedStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        ((XSSFCellStyle) s).setFillForegroundColor(
                new XSSFColor(new byte[]{(byte) 0xC0, (byte) 0x00, (byte) 0x00}, null)); // dark red
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorder(s);
        return s;
    }

    /**
     * OTHER — amber/orange fill with white bold text.
     * Used for user-defined custom target statuses.
     */
    private CellStyle makeOtherStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        ((XSSFCellStyle) s).setFillForegroundColor(
                new XSSFColor(new byte[]{(byte) 0xFF, (byte) 0x80, (byte) 0x00}, null)); // orange/amber
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorder(s);
        return s;
    }

    private CellStyle makeCancelTextStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        XSSFFont f = wb.createFont();
        f.setColor(IndexedColors.RED.getIndex());
        f.setBold(true);
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorder(s);
        return s;
    }

    private void setBorder(CellStyle s) {
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
    }

    private void validateTargetAchieve(DailyProgressReport report) {

        if (report.getTargetAchieve() == DailyProgressReport.TargetStatus.OTHER) {

            if (report.getTargetAchieveOther() == null ||
                    report.getTargetAchieveOther().trim().isEmpty()) {

                throw new RuntimeException("Other reason must be provided when targetAchieve is OTHER");
            }

        } else {

            // साफ कर दो unnecessary data
            report.setTargetAchieveOther(null);
        }
    }
}