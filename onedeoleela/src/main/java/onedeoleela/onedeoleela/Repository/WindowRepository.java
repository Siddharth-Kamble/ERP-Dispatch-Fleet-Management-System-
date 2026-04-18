package onedeoleela.onedeoleela.Repository;




import onedeoleela.onedeoleela.Entity.Window;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface WindowRepository extends JpaRepository<Window, Long> {




    List<Window> findByTrip_Id(Long tripId);

    // ✅ FIX: JOIN FETCH flat and trip so they are never lazy-loaded proxies
    //         This guarantees flatNumber is always present in the API response
    @Query("SELECT w FROM Window w LEFT JOIN FETCH w.flat LEFT JOIN FETCH w.trip LEFT JOIN FETCH w.floor WHERE w.trip.id = :tripId ORDER BY w.createdAt ASC")
    List<Window> findWindowsByTripId(@Param("tripId") Long tripId);

    // ✅ FIX: Override findAll with JOIN FETCH so /windows/all always returns full flat data
    @Query("SELECT w FROM Window w LEFT JOIN FETCH w.flat LEFT JOIN FETCH w.trip LEFT JOIN FETCH w.floor ORDER BY w.createdAt DESC")
    List<Window> findAllWithDetails();
}
