package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.Trip;
import onedeoleela.onedeoleela.Entity.TripStatusUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
public interface TripStatusUpdateRepository extends JpaRepository<TripStatusUpdate, Long> {

    Optional<TripStatusUpdate> findByTrip_Id(Long tripId);

    List<TripStatusUpdate> findByDriverECode(Integer driverECode);

    Optional<TripStatusUpdate> findByTrip(Trip trip);
}