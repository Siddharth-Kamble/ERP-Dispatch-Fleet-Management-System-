package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.ProjectRecords;
import onedeoleela.onedeoleela.Service.ProjectRecordsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/project-records")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectRecordsController {

    private final ProjectRecordsService recordsService;

    public ProjectRecordsController(ProjectRecordsService recordsService) {
        this.recordsService = recordsService;
    }

    // Add new record
    @PostMapping("/{projectId}")
    public ProjectRecords addRecord(
            @PathVariable Long projectId,
            @RequestBody ProjectRecords record
    ) {
        return recordsService.addRecord(projectId, record);
    }

    // Get all records for a project
    @GetMapping("/{projectId}")
    public ResponseEntity<List<ProjectRecords>> getRecords(@PathVariable Long projectId) {
        return ResponseEntity.ok(recordsService.getRecordsByProject(projectId));
    }

    // Get records filtered by date range (for report)
    @GetMapping("/{projectId}/filter")
    public ResponseEntity<List<ProjectRecords>> getRecordsByDate(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(recordsService.getRecordsByProjectAndDate(projectId, startDate, endDate));
    }

    @GetMapping("/download-pdf")
    public ResponseEntity<byte[]> downloadPDF(
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate
    ) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            byte[] pdfBytes = recordsService.generateProjectHistoryPDF(start, end);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Dispatch_Report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
