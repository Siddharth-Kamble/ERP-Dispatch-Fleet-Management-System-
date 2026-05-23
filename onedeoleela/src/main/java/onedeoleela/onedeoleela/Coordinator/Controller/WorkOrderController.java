package onedeoleela.onedeoleela.Coordinator.Controller;

import onedeoleela.onedeoleela.Coordinator.DTO.WorkOrderDTO;
import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrder;
import onedeoleela.onedeoleela.Coordinator.Service.WorkOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/work-orders")
@CrossOrigin(origins = "*")
public class WorkOrderController {

    private final WorkOrderService service;

    public WorkOrderController(WorkOrderService service) {
        this.service = service;
    }

    // POST /api/work-orders → create new work order
    @PostMapping
    public ResponseEntity<?> create(@RequestBody WorkOrderDTO dto) {
        try {
            WorkOrder saved = service.create(dto);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id", saved.getId(),
                    "message", "Work Order saved successfully"
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    // PUT /api/work-orders/{id} → update existing work order
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody WorkOrderDTO dto) {
        try {
            WorkOrder updated = service.update(id, dto);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id", updated.getId(),
                    "message", "Work Order updated successfully"
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    // GET /api/work-orders → list all
    @GetMapping
    public ResponseEntity<List<WorkOrder>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // GET /api/work-orders/by-project/{projectName} → list by project
    @GetMapping("/by-project/{projectName}")
    public ResponseEntity<List<WorkOrder>> getByProject(@PathVariable String projectName) {
        return ResponseEntity.ok(service.getByProjectName(projectName));
    }

    // GET /api/work-orders/{id} → get one
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}