package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.PlanningHistory;
import onedeoleela.onedeoleela.Entity.PlanningLineItem;
import onedeoleela.onedeoleela.Entity.PlanningWork;
import onedeoleela.onedeoleela.Service.PlanningHistoryService;
import onedeoleela.onedeoleela.Service.PlanningLineItemService;
import onedeoleela.onedeoleela.Service.PlanningWorkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/planning")
@CrossOrigin(origins = "*")
public class PlanningController {

    @Autowired private PlanningWorkService     workService;
    @Autowired private PlanningLineItemService lineItemService;
    @Autowired private PlanningHistoryService  historyService;

    // ══════════════════════════════════════════════════════════════════════════
    // WORKS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/planning/projects/{projectId}/works
     */
    @GetMapping("/projects/{projectId}/works")
    public ResponseEntity<List<PlanningWork>> getWorks(@PathVariable Long projectId) {
        return ResponseEntity.ok(workService.getWorksByProject(projectId));
    }

    /**
     * POST /api/planning/works
     * Body: { projectId, workName, workOrderNo, startDate, endDate, description }
     */
    @PostMapping("/works")
    public ResponseEntity<PlanningWork> createWork(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(workService.createWork(body));
    }

    /**
     * PUT /api/planning/works/{id}
     * Body: { workName, workOrderNo, startDate, endDate, description }
     */
    @PutMapping("/works/{id}")
    public ResponseEntity<PlanningWork> updateWork(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(workService.updateWork(id, body));
    }

    /**
     * DELETE /api/planning/works/{id}
     * Cascades to all line items via orphanRemoval = true.
     */
    @DeleteMapping("/works/{id}")
    public ResponseEntity<Map<String, String>> deleteWork(@PathVariable Long id) {
        workService.deleteWork(id);
        return ResponseEntity.ok(Map.of("message", "Work deleted successfully"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LINE ITEMS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/planning/works/{workId}/line-items
     */
    @GetMapping("/works/{workId}/line-items")
    public ResponseEntity<List<PlanningLineItem>> getLineItems(@PathVariable Long workId) {
        return ResponseEntity.ok(lineItemService.getLineItemsByWork(workId));
    }

    /**
     * POST /api/planning/line-items
     * Body: { workId, srNo, lineItemName, startDate, endDate,
     *         department, actionPerson, status, remark, linkedItemIds: [1,2,3] }
     */
    @PostMapping("/line-items")
    public ResponseEntity<PlanningLineItem> createLineItem(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(lineItemService.createLineItem(body));
    }

    /**
     * PUT /api/planning/line-items/{id}
     * Body: same shape as createLineItem (workId optional on update)
     */
    @PutMapping("/line-items/{id}")
    public ResponseEntity<PlanningLineItem> updateLineItem(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(lineItemService.updateLineItem(id, body));
    }

    /**
     * DELETE /api/planning/line-items/{id}
     */
    @DeleteMapping("/line-items/{id}")
    public ResponseEntity<Map<String, String>> deleteLineItem(@PathVariable Long id) {
        lineItemService.deleteLineItem(id);
        return ResponseEntity.ok(Map.of("message", "Line item deleted successfully"));
    }

    /**
     * PUT /api/planning/line-items/{id}/change-date
     *
     * Date change with mandatory reason + optional cascade.
     * Shift >= 2 days AND cascade=true → all linked items shift by the same days.
     *
     * Body: {
     *   field:     "startDate" | "endDate",
     *   oldValue:  "2025-06-01",
     *   newValue:  "2025-06-10",
     *   reason:    "Client requested delay",
     *   cascade:   true,
     *   changedBy: "Suraj"
     * }
     *
     * Response: {
     *   success:       true,
     *   shiftDays:     9,
     *   cascadedCount: 2,
     *   cascadedItems: ["SITE SURVEY", "DRAWING APPROVAL"]
     * }
     */
    @PutMapping("/line-items/{id}/change-date")
    public ResponseEntity<Map<String, Object>> changeDateWithHistory(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(lineItemService.changeDateWithHistory(id, body));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HISTORY
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/planning/works/{workId}/history
     * All change history for a specific work, newest first.
     */
    @GetMapping("/works/{workId}/history")
    public ResponseEntity<List<PlanningHistory>> getWorkHistory(@PathVariable Long workId) {
        return ResponseEntity.ok(historyService.getHistoryByWork(workId));
    }

    /**
     * GET /api/planning/projects/{projectId}/history
     * All change history across all works in a project, newest first.
     */
    @GetMapping("/projects/{projectId}/history")
    public ResponseEntity<List<PlanningHistory>> getProjectHistory(@PathVariable Long projectId) {
        return ResponseEntity.ok(historyService.getHistoryByProject(projectId));
    }

    /**
     * POST /api/planning/history
     *
     * Save a history entry for non-date edits (status change, name edit, etc.).
     * Called by the frontend whenever a line item is edited via the form.
     *
     * Body: {
     *   workId:       1,
     *   lineItemId:   5,
     *   lineItemName: "SITE SURVEY",
     *   field:        "status",          // or "lineItemName", "department", etc.
     *   oldValue:     "NOT STARTED",
     *   newValue:     "IN PROGRESS",
     *   reason:       "Work started on site",
     *   changedBy:    "Suraj"
     * }
     */
    @PostMapping("/history")
    public ResponseEntity<PlanningHistory> saveHistory(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(historyService.saveHistory(body));
    }
    @GetMapping("/line-items/{id}/history")
    public ResponseEntity<List<PlanningHistory>> getLineItemHistory(@PathVariable Long id) {
        return ResponseEntity.ok(historyService.getHistoryByLineItem(id));
    }
}