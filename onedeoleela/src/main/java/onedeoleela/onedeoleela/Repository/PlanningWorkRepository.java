package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.PlanningWork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanningWorkRepository extends JpaRepository<PlanningWork, Long> {

    /** All works for a project, ordered by creation (id ascending) */
    List<PlanningWork> findByProjectProjectIdOrderByIdAsc(Long projectId);
}