
package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.ProjectRecords;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectRecordsRepository extends JpaRepository<ProjectRecords, Long> {

    // ── Fetch all records for a project (uses project.projectId correctly) ───
    List<ProjectRecords> findByProjectProjectId(Long projectId);

    // ── Fetch records for a project filtered by date range ───────────────────
    List<ProjectRecords> findByProjectProjectIdAndRecordDateBetween(
            Long projectId, LocalDate startDate, LocalDate endDate);

    // ── Fetch ALL records across ALL projects within a date range ────────────
    List<ProjectRecords> findByRecordDateBetween(LocalDate startDate, LocalDate endDate);

    // ── Same as above but ordered chronologically (used by PDF generator) ────
    List<ProjectRecords> findByRecordDateBetweenOrderByRecordDateAsc(
            LocalDate startDate, LocalDate endDate);
}