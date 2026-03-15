package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.CancelledTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CancelledTripRepository extends JpaRepository<CancelledTrip, Long> {
}