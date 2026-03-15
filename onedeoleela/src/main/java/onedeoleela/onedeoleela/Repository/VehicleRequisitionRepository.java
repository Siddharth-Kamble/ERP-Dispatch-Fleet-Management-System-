package onedeoleela.onedeoleela.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import onedeoleela.onedeoleela.Entity.VehicleRequisition;
import onedeoleela.onedeoleela.Entity.RequisitionStatus;

import java.util.List;
import java.util.Optional;

public interface VehicleRequisitionRepository
        extends JpaRepository<VehicleRequisition, Long> {

    // last requisition for number generation
    VehicleRequisition findTopByOrderByIdDesc();

    // find by requisition number
    Optional<VehicleRequisition> findByRequisitionNo(String requisitionNo);

    // filter by status
    List<VehicleRequisition> findByStatus(RequisitionStatus status);

    // smart trip planner
    List<VehicleRequisition> findByTripIsNull();

    // pending requisitions
    List<VehicleRequisition> findByStatusAndTripIsNull(RequisitionStatus status);
}