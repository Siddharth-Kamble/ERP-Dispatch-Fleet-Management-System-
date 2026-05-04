package onedeoleela.onedeoleela.Repository;
import onedeoleela.onedeoleela.Entity.Window;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface WindowRepository extends JpaRepository<Window, Long> {
     List<Window> findByTrip_Id(Long tripId);

    @Query("SELECT w FROM Window w LEFT JOIN FETCH w.flat LEFT JOIN FETCH w.trip LEFT JOIN FETCH w.floor WHERE w.trip.id = :tripId ORDER BY w.createdAt ASC")
    List<Window> findWindowsByTripId(@Param("tripId") Long tripId);


    @Query("SELECT w FROM Window w LEFT JOIN FETCH w.flat LEFT JOIN FETCH w.trip LEFT JOIN FETCH w.floor ORDER BY w.createdAt DESC")
    List<Window> findAllWithDetails();
}
