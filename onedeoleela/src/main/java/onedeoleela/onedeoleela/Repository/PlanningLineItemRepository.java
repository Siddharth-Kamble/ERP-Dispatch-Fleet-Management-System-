package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.PlanningLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanningLineItemRepository extends JpaRepository<PlanningLineItem, Long> {

    /** All line items for a work, ordered by srNo ascending */
    List<PlanningLineItem> findByWorkIdOrderBySrNoAsc(Long workId);
}