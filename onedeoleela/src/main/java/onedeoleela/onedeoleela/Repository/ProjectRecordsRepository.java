
package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.ProjectRecords;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectRecordsRepository extends JpaRepository<ProjectRecords, Long> {

     List<ProjectRecords> findByProjectProjectId(Long projectId);
     List<ProjectRecords> findByProjectProjectIdAndRecordDateBetween(
            Long projectId, LocalDate startDate, LocalDate endDate);
     List<ProjectRecords> findByRecordDateBetweenOrderByRecordDateAsc(
            LocalDate startDate, LocalDate endDate);
}