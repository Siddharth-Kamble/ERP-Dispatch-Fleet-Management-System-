package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.Project;
import onedeoleela.onedeoleela.Entity.ProjectLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectLogRepository extends JpaRepository<ProjectLog, Long> {

    List<ProjectLog> findByTripId(Long tripId);

    List<ProjectLog> findByProjectNameOrderByCreatedAtDesc(String projectName);

    Optional<ProjectLog> findFirstByTripId(Long tripId);
    ProjectLog findTopByTripIdOrderByIdDesc(Long tripId);
}