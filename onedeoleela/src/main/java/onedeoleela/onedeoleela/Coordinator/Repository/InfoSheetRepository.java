package onedeoleela.onedeoleela.Coordinator.Repository;


import onedeoleela.onedeoleela.Coordinator.Entity.InfoSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InfoSheetRepository extends JpaRepository<InfoSheet, Long> {

    // All sheets for a specific work order
    List<InfoSheet> findByWorkOrderIdOrderByIdDesc(Long workOrderId);

    // All sheets for a project
    List<InfoSheet> findByProjectNameOrderByIdDesc(String projectName);

    // Check duplicate flat no within same WO
    boolean existsByWorkOrderIdAndFlatNo(Long workOrderId, String flatNo);
}