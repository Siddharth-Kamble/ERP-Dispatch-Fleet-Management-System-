package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.PlanningWork;
import onedeoleela.onedeoleela.Entity.Project;
import onedeoleela.onedeoleela.Repository.PlanningWorkRepository;
import onedeoleela.onedeoleela.Repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class PlanningWorkService {

    @Autowired
    private PlanningWorkRepository workRepository;

    @Autowired
    private ProjectRepository projectRepository;

    // ── READ ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PlanningWork> getWorksByProject(Long projectId) {
        return workRepository.findByProjectProjectIdOrderByIdAsc(projectId);
    }

    @Transactional(readOnly = true)
    public PlanningWork getWorkById(Long workId) {
        return workRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Work not found with id: " + workId));
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    public PlanningWork createWork(Map<String, Object> body) {
        Long projectId = parseLong(body.get("projectId"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        PlanningWork work = new PlanningWork();
        work.setProject(project);
        mapBodyToWork(body, work);
        return workRepository.save(work);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    public PlanningWork updateWork(Long workId, Map<String, Object> body) {
        PlanningWork work = getWorkById(workId);
        mapBodyToWork(body, work);
        return workRepository.save(work);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    public void deleteWork(Long workId) {
        if (!workRepository.existsById(workId)) {
            throw new RuntimeException("Work not found with id: " + workId);
        }
        workRepository.deleteById(workId);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private void mapBodyToWork(Map<String, Object> body, PlanningWork work) {
        if (body.containsKey("workName"))    work.setWorkName((String) body.get("workName"));
        if (body.containsKey("workOrderNo")) work.setWorkOrderNo((String) body.get("workOrderNo"));
        if (body.containsKey("description")) work.setDescription((String) body.get("description"));
        if (body.get("startDate") != null && !body.get("startDate").toString().isBlank())
            work.setStartDate(LocalDate.parse(body.get("startDate").toString()));
        if (body.get("endDate") != null && !body.get("endDate").toString().isBlank())
            work.setEndDate(LocalDate.parse(body.get("endDate").toString()));
    }

    private Long parseLong(Object value) {
        if (value == null) throw new RuntimeException("Required field is missing");
        return Long.valueOf(value.toString());
    }
}