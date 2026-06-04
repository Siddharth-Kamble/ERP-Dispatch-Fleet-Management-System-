package onedeoleela.onedeoleela.Coordinator.Controller;

import onedeoleela.onedeoleela.Coordinator.DTO.TrackerSheetDTO;
import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheet;
import onedeoleela.onedeoleela.Coordinator.Service.TrackerSheetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tracker-sheets")
@CrossOrigin(origins = "*")
public class TrackerSheetController {

    private final TrackerSheetService service;

    public TrackerSheetController(TrackerSheetService service) {
        this.service = service;
    }

    // POST /api/tracker-sheets → create new tracker sheet
    @PostMapping
    public ResponseEntity<?> create(@RequestBody TrackerSheetDTO dto) {
        try {
            TrackerSheet saved = service.create(dto);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id",      saved.getId(),
                    "message", "Tracker sheet saved successfully"
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    // PUT /api/tracker-sheets/{id} → update existing tracker sheet
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody TrackerSheetDTO dto
    ) {
        try {
            TrackerSheet updated = service.update(id, dto);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id",      updated.getId(),
                    "message", "Tracker sheet updated successfully"
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    // GET /api/tracker-sheets/by-work-order/{workOrderId}
    // Returns the tracker sheet for a WO if it exists, or 404
    @GetMapping("/by-work-order/{workOrderId}")
    public ResponseEntity<?> getByWorkOrder(@PathVariable Long workOrderId) {
        Optional<TrackerSheet> sheet = service.getByWorkOrder(workOrderId);
        return sheet
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/tracker-sheets/{id} → get single sheet
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/tracker-sheets/by-project/{projectName}
    @GetMapping("/by-project/{projectName}")
    public ResponseEntity<List<TrackerSheet>> getByProject(
            @PathVariable String projectName
    ) {
        return ResponseEntity.ok(service.getByProject(projectName));
    }
}