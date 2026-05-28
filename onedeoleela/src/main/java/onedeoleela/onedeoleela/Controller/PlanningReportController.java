

package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.PlanningLineItem;
import onedeoleela.onedeoleela.Entity.PlanningWork;
import onedeoleela.onedeoleela.Service.PlanningLineItemService;
import onedeoleela.onedeoleela.Service.PlanningWorkService;
import onedeoleela.onedeoleela.Service.PlanningReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planning")
@CrossOrigin(origins = "*")
public class PlanningReportController {

    @Autowired private PlanningWorkService     workService;
    @Autowired private PlanningLineItemService lineItemService;
    @Autowired private PlanningReportService   reportService;

    @GetMapping("/works/{workId}/report")
    public ResponseEntity<byte[]> generateWorkReport(@PathVariable Long workId) {

        PlanningWork           work  = workService.getWorkById(workId);
        List<PlanningLineItem> items = lineItemService.getLineItemsByWork(workId);

        byte[] pdf = reportService.generateScheduleReport(work, items);

        String filename = "Project_Schedule_" + workId + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}