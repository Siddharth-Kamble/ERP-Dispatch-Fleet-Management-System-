package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.PlanningHistory;
import onedeoleela.onedeoleela.Entity.PlanningWork;
import onedeoleela.onedeoleela.Repository.PlanningHistoryRepository;
import onedeoleela.onedeoleela.Repository.PlanningWorkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class PlanningHistoryService {

    @Autowired private PlanningHistoryRepository historyRepository;
    @Autowired private PlanningWorkRepository    workRepository;

    // ── READ ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PlanningHistory> getHistoryByWork(Long workId) {
        return historyRepository.findByWorkIdOrderByChangedAtDesc(workId);
    }

    @Transactional(readOnly = true)
    public List<PlanningHistory> getHistoryByProject(Long projectId) {
        return historyRepository.findByWorkProjectProjectIdOrderByChangedAtDesc(projectId);
    }

    // ── WRITE ─────────────────────────────────────────────────────────────────

    /**
     * Save a general history entry from a Map payload.
     *
     * Used by POST /api/planning/history for non-date edits
     * (e.g. status change, name edit, department reassignment).
     *
     * Expected keys:
     *   workId        (Long, required)
     *   lineItemId    (Long, optional)
     *   lineItemName  (String, optional)
     *   field         (String) — e.g. "status", "lineItemName", "department",
     *                            "actionPerson", "remark", "srNo", "general"
     *   oldValue      (String, optional)
     *   newValue      (String, optional)
     *   reason        (String, required)
     *   changedBy     (String, optional — defaults to "System")
     */
    public PlanningHistory saveHistory(Map<String, Object> body) {
        Long workId = Long.valueOf(body.get("workId").toString());

        PlanningWork work = workRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Work not found with id: " + workId));

        PlanningHistory history = new PlanningHistory();
        history.setWork(work);

        // Denormalize work + project info so the record is self-contained
        history.setWorkName(work.getWorkName());
        if (work.getProject() != null) {
            history.setProjectName(work.getProject().getProjectName());
            history.setProjectCode(work.getProject().getProjectCode());
        }

        if (body.get("lineItemId") != null)
            history.setLineItemId(Long.valueOf(body.get("lineItemId").toString()));

        history.setLineItemName(body.get("lineItemName") != null
                ? body.get("lineItemName").toString() : null);

        history.setField(body.get("field") != null
                ? body.get("field").toString() : "general");

        history.setOldValue(body.get("oldValue") != null
                ? body.get("oldValue").toString() : "");

        history.setNewValue(body.get("newValue") != null
                ? body.get("newValue").toString() : "");

        history.setReason(body.get("reason") != null
                ? body.get("reason").toString() : "");

        history.setChangedBy(body.get("changedBy") != null
                ? body.get("changedBy").toString() : "System");

        history.setChangedAt(LocalDateTime.now());

        // cascadedItemNames not expected for general edits, but accept it if present
        if (body.get("cascadedItemNames") != null)
            history.setCascadedItemNames(body.get("cascadedItemNames").toString());

        return historyRepository.save(history);
    }
    @Transactional(readOnly = true)
    public List<PlanningHistory> getHistoryByLineItem(Long lineItemId) {
        return historyRepository.findByLineItemIdOrderByChangedAtAsc(lineItemId);
    }
}