package onedeoleela.onedeoleela.Repository;



import onedeoleela.onedeoleela.Entity.Window;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WindowRepository extends JpaRepository<Window, Long> {

    List<Window> findByTrip_Id(Long tripId);

}
