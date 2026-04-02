package onedeoleela.onedeoleela.Repository;



import onedeoleela.onedeoleela.Entity.Floor;
import onedeoleela.onedeoleela.Entity.Window;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WindowRepository extends JpaRepository<Window, Long> {

    List<Window> findByTrip_Id(Long tripId);
    @Query("SELECT w FROM Window w WHERE w.trip.id = :tripId ORDER BY w.createdAt ASC")
    List<Window> findWindowsByTripId(@Param("tripId") Long tripId);
}
