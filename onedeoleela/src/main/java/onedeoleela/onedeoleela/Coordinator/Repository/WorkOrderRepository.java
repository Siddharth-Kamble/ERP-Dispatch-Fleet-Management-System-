package onedeoleela.onedeoleela.Coordinator.Repository;

 import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrder;
 import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findAllByOrderByIdDesc();
    List<WorkOrder> findByProjectNameOrderByIdDesc(String projectName);
    boolean existsByWorkOrderNo(String workOrderNo);
}