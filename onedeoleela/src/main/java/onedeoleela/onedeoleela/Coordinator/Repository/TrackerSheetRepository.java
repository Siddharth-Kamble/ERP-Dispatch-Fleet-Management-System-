package onedeoleela.onedeoleela.Coordinator.Repository;

import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrackerSheetRepository extends JpaRepository<TrackerSheet, Long> {

    // One tracker sheet per work order
    Optional<TrackerSheet> findByWorkOrderId(Long workOrderId);

    // All tracker sheets for a project
    List<TrackerSheet> findByProjectNameOrderByIdDesc(String projectName);
}