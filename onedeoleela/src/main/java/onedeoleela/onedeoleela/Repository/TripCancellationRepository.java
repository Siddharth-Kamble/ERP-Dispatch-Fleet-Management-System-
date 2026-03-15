package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.TripCancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TripCancellationRepository extends JpaRepository<TripCancellation, Long> {
    @Query("SELECT t FROM TripCancellation t WHERE t.eCode = :eCode")
    List<TripCancellation> findByDriverECode(@Param("eCode") String eCode);
    Optional<TripCancellation> findByTripId(Long tripId);

}