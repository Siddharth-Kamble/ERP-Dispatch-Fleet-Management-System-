package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.VehicleRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRequestRepository extends JpaRepository<VehicleRequest, Long> {

    // All requests by a specific requester (for user's own dashboard)
    List<VehicleRequest> findByRequesterECodeOrderByCreatedAtDesc(String requesterECode);

    // All requests by department
    List<VehicleRequest> findByDepartmentOrderByCreatedAtDesc(String department);

    // All requests for dispatcher (all, sorted newest first)
    List<VehicleRequest> findAllByOrderByCreatedAtDesc();

    // Unread notifications for dispatcher
    List<VehicleRequest> findByNotifyDispatcherTrue();

    // Unread notifications for a specific requester
    List<VehicleRequest> findByRequesterECodeAndNotifyRequesterTrue(String requesterECode);

    // Count unread for dispatcher
    long countByNotifyDispatcherTrue();

    // Count unread for requester
    long countByRequesterECodeAndNotifyRequesterTrue(String requesterECode);
}