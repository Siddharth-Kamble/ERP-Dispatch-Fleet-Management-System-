package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.DriverBreakActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverBreakActivityRepository extends JpaRepository<DriverBreakActivity, Long> {
    List<DriverBreakActivity> findByTripIdOrderByBreakStartAsc(Long tripId);
    List<DriverBreakActivity> findByTripId(Long tripId);
}