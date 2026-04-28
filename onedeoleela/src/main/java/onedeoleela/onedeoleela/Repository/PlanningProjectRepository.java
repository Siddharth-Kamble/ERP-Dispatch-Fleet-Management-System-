package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.PlanningProject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlanningProjectRepository extends JpaRepository<PlanningProject, Long> {
    List<PlanningProject> findAllByOrderByCreatedAtDesc();
}
