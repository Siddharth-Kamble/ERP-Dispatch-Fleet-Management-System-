package onedeoleela.onedeoleela.Coordinator.Controller;

import onedeoleela.onedeoleela.Coordinator.Service.TrackerSummaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracker-sheets")
@CrossOrigin(origins = "*")
public class TrackerSummaryController {

    private final TrackerSummaryService service;

    public TrackerSummaryController(TrackerSummaryService service) {
        this.service = service;
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getSummary(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.buildSummary(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}