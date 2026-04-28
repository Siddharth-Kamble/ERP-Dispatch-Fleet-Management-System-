package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.PlanningHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanningHistoryRepository extends JpaRepository<PlanningHistory, Long> {

    /** All history for a specific work, newest first */
    List<PlanningHistory> findByWorkIdOrderByChangedAtDesc(Long workId);

    /** All history across all works in a project, newest first */
    List<PlanningHistory> findByWorkProjectProjectIdOrderByChangedAtDesc(Long projectId);
    List<PlanningHistory> findByLineItemIdOrderByChangedAtAsc(Long lineItemId);
}