package onedeoleela.onedeoleela.Planning.Controller;

import onedeoleela.onedeoleela.Entity.PlanningWork;
import onedeoleela.onedeoleela.Planning.Entity.TemplateLineItem;
import onedeoleela.onedeoleela.Planning.Entity.WorkTemplate;
import onedeoleela.onedeoleela.Planning.Service.WorkTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "*")
public class WorkTemplateController {

    @Autowired
    private WorkTemplateService templateService;


    @GetMapping
    public ResponseEntity<List<WorkTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }


    @GetMapping("/search")
    public ResponseEntity<List<WorkTemplate>> searchTemplates(
            @RequestParam(defaultValue = "") String name) {
        return ResponseEntity.ok(templateService.searchTemplates(name));
    }

    /**
     * GET /api/templates/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkTemplate> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }

    /**
     * GET /api/templates/{id}/items
     * Returns the TemplateLineItem rows for a given template.
     */
    @GetMapping("/{id}/items")
    public ResponseEntity<List<TemplateLineItem>> getTemplateItems(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.getTemplateItems(id));
    }


    @PostMapping("/save-from-work")
    public ResponseEntity<WorkTemplate> saveAsTemplate(
            @RequestBody Map<String, Object> body) {

        Long   workId      = Long.valueOf(body.get("workId").toString());
        String name        = body.get("templateName")        != null
                ? body.get("templateName").toString()        : null;
        String description = body.get("templateDescription") != null
                ? body.get("templateDescription").toString() : null;
        String createdBy   = body.get("createdBy")           != null
                ? body.get("createdBy").toString()           : "System";

        WorkTemplate saved = templateService.saveAsTemplate(
                workId, name, description, createdBy);

        return ResponseEntity.ok(saved);
    }



    @PostMapping("/apply")
    public ResponseEntity<PlanningWork> applyTemplate(
            @RequestBody Map<String, Object> body) {
        PlanningWork newWork = templateService.applyTemplate(body);
        return ResponseEntity.ok(newWork);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────


    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok(Map.of("message", "Template deleted successfully"));
    }
}