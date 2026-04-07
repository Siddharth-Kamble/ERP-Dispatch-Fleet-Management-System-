//package onedeoleela.onedeoleela.Controller;
//
//import lombok.RequiredArgsConstructor;
//import onedeoleela.onedeoleela.Entity.DailyProgressReport;
//import onedeoleela.onedeoleela.Service.DailyProgressReportService;
//import org.springframework.format.annotation.DateTimeFormat;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.io.IOException;
//import java.time.LocalDate;
//import java.time.format.DateTimeFormatter;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/daily-progress-report")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class DailyProgressReportController {
//
//    private final DailyProgressReportService service;
//
//    // ─────────────────────────────────────────────────────────────────────────
//    // CREATE / SAVE
//    // ─────────────────────────────────────────────────────────────────────────
//
//    /**
//     * Save a single trip row.
//     * POST /api/daily-progress-report
//     */
//    @PostMapping
//    public ResponseEntity<DailyProgressReport> create(
//            @RequestBody DailyProgressReport report) {
//        return ResponseEntity.ok(service.save(report));
//    }
//
//    /**
//     * Save multiple trip rows in one call (bulk insert for an entire day).
//     * POST /api/daily-progress-report/bulk
//     */
//    @PostMapping("/bulk")
//    public ResponseEntity<List<DailyProgressReport>> createBulk(
//            @RequestBody List<DailyProgressReport> reports) {
//        return ResponseEntity.ok(service.saveAll(reports));
//    }
//
//    // ─────────────────────────────────────────────────────────────────────────
//    // READ
//    // ─────────────────────────────────────────────────────────────────────────
//
//    /**
//     * Get all rows for a specific date.
//     * GET /api/daily-progress-report/by-date?date=2026-04-03
//     */
//    @GetMapping("/by-date")
//    public ResponseEntity<List<DailyProgressReport>> getByDate(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
//        return ResponseEntity.ok(service.getByDate(date));
//    }
//
//    /**
//     * Get rows for a date range.
//     * GET /api/daily-progress-report/by-range?from=2026-04-01&to=2026-04-30
//     */
//    @GetMapping("/by-range")
//    public ResponseEntity<List<DailyProgressReport>> getByRange(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
//        return ResponseEntity.ok(service.getByDateRange(from, to));
//    }
//
//    /**
//     * Get all trips for a specific driver on a date.
//     * GET /api/daily-progress-report/by-driver?date=2026-04-03&driver=NIKHIL
//     */
//    @GetMapping("/by-driver")
//    public ResponseEntity<List<DailyProgressReport>> getByDriver(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
//            @RequestParam String driver) {
//        return ResponseEntity.ok(service.getByDriver(date, driver));
//    }
//
//    /**
//     * Get all trips for a specific vehicle on a date.
//     * GET /api/daily-progress-report/by-vehicle?date=2026-04-03&vehicle=MH12LT5350
//     */
//    @GetMapping("/by-vehicle")
//    public ResponseEntity<List<DailyProgressReport>> getByVehicle(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
//            @RequestParam String vehicle) {
//        return ResponseEntity.ok(service.getByVehicle(date, vehicle));
//    }
//
//    /**
//     * Get list of all dates that have report data.
//     * GET /api/daily-progress-report/available-dates
//     */
//    @GetMapping("/available-dates")
//    public ResponseEntity<List<LocalDate>> getAvailableDates() {
//        return ResponseEntity.ok(service.getAvailableDates());
//    }
//
//    // ─────────────────────────────────────────────────────────────────────────
//    // DELETE
//    // ─────────────────────────────────────────────────────────────────────────
//
//    /**
//     * Delete a single row by its DB id.
//     * DELETE /api/daily-progress-report/{id}
//     */
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> delete(@PathVariable Long id) {
//        service.deleteById(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    // ─────────────────────────────────────────────────────────────────────────
//    // EXCEL EXPORT
//    // ─────────────────────────────────────────────────────────────────────────
//
//    /**
//     * Download the Daily Progress Report as an .xlsx file for a given date.
//     * The exported file exactly matches the printed report format:
//     *   - Company header, gold title bar, cyan employee row
//     *   - Green "ACHIEVE" cells, red fill for breakdowns/cancellations
//     *   - Grouped vehicle rows with blank trip slots
//     *   - Special Note + Total Working Hour footer
//     *
//     * GET /api/daily-progress-report/export?date=2026-04-03
//     */
//    @GetMapping("/export")
//    public ResponseEntity<byte[]> exportExcel(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date)
//            throws IOException {
//
//        byte[] excelBytes = service.generateExcel(date);
//
//        String filename = "Daily_Progress_Report_"
//                + date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"))
//                + ".xlsx";
//
//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_DISPOSITION,
//                        "attachment; filename=\"" + filename + "\"")
//                .contentType(MediaType.parseMediaType(
//                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
//                .contentLength(excelBytes.length)
//                .body(excelBytes);
//    }
//}

package onedeoleela.onedeoleela.Controller;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.DailyProgressReport;
import onedeoleela.onedeoleela.Service.DailyProgressReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/daily-progress-report")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DailyProgressReportController {

    private final DailyProgressReportService service;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE / SAVE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Save a single trip row.
     * POST /api/daily-progress-report
     *
     * New fields in request body (optional):
     *   specialNote         — user-provided footer note for the report
     *   targetAchieveOther  — custom status text when targetAchieve = OTHER
     */
    @PostMapping
    public ResponseEntity<DailyProgressReport> create(
            @RequestBody DailyProgressReport report) {
        return ResponseEntity.ok(service.save(report));
    }

    /**
     * Save multiple trip rows in one call (bulk insert for an entire day).
     * POST /api/daily-progress-report/bulk
     */
    @PostMapping("/bulk")
    public ResponseEntity<List<DailyProgressReport>> createBulk(
            @RequestBody List<DailyProgressReport> reports) {
        return ResponseEntity.ok(service.saveAll(reports));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    /** GET /api/daily-progress-report/by-date?date=2026-04-03 */
    @GetMapping("/by-date")
    public ResponseEntity<List<DailyProgressReport>> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getByDate(date));
    }

    /** GET /api/daily-progress-report/by-range?from=2026-04-01&to=2026-04-30 */
    @GetMapping("/by-range")
    public ResponseEntity<List<DailyProgressReport>> getByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(service.getByDateRange(from, to));
    }

    /** GET /api/daily-progress-report/by-driver?date=2026-04-03&driver=NIKHIL */
    @GetMapping("/by-driver")
    public ResponseEntity<List<DailyProgressReport>> getByDriver(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String driver) {
        return ResponseEntity.ok(service.getByDriver(date, driver));
    }

    /** GET /api/daily-progress-report/by-vehicle?date=2026-04-03&vehicle=MH12LT5350 */
    @GetMapping("/by-vehicle")
    public ResponseEntity<List<DailyProgressReport>> getByVehicle(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String vehicle) {
        return ResponseEntity.ok(service.getByVehicle(date, vehicle));
    }

    /** GET /api/daily-progress-report/available-dates */
    @GetMapping("/available-dates")
    public ResponseEntity<List<LocalDate>> getAvailableDates() {
        return ResponseEntity.ok(service.getAvailableDates());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    /** DELETE /api/daily-progress-report/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXCEL EXPORT — Daily Progress Report
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Download the <b>Daily Progress Report</b> as an .xlsx file.
     *
     * Header title: "DAILY PROGRESS REPORT"
     * Includes: company logo (top-left), colour-coded TARGET ACHIEVE column,
     *           user special note in footer, calculated Total Working Hour.
     *
     * GET /api/daily-progress-report/export?date=2026-04-03
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportDailyProgressReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date)
            throws IOException {

        byte[] excelBytes = service.generateExcel(date);
        String filename = "Daily_Progress_Report_"
                + date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"))
                + ".xlsx";

        return buildExcelResponse(excelBytes, filename);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXCEL EXPORT — Daily Planning
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Download the <b>Daily Planning</b> as an .xlsx file.
     *
     * Same layout as the Daily Progress Report, but the header title reads
     * "DAILY PLANNING" instead of "DAILY PROGRESS REPORT".
     * Includes: company logo (top-left), colour-coded TARGET ACHIEVE column,
     *           user special note in footer, calculated Total Working Hour.
     *
     * GET /api/daily-progress-report/export-planning?date=2026-04-03
     */
    @GetMapping("/export-planning")
    public ResponseEntity<byte[]> exportDailyPlanning(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date)
            throws IOException {

        byte[] excelBytes = service.generateDailyPlanningExcel(date);
        String filename = "Daily_Planning_"
                + date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"))
                + ".xlsx";

        return buildExcelResponse(excelBytes, filename);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private ResponseEntity<byte[]> buildExcelResponse(byte[] bytes, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(bytes.length)
                .body(bytes);
    }
}