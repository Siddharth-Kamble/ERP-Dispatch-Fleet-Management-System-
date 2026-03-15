package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.TripRequisition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripRequisitionRepository extends JpaRepository<TripRequisition, Long> {

    List<TripRequisition> findByTripId(Long tripId);

}