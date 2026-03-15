package onedeoleela.onedeoleela.Repository;





import onedeoleela.onedeoleela.Entity.PortalTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortalTripRepository extends JpaRepository<PortalTrip, Long> {
    List<PortalTrip> findByVehicleNumber(String vehicleNumber);
}