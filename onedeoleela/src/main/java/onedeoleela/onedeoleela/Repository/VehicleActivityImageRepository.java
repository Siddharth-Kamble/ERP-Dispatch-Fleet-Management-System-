package onedeoleela.onedeoleela.Repository;


import onedeoleela.onedeoleela.Entity.TripStatusEnum;
import onedeoleela.onedeoleela.Entity.VehicleActivityImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehicleActivityImageRepository
        extends JpaRepository<VehicleActivityImage, Long> {

    List<VehicleActivityImage> findByTripId(Long tripId);

    List<VehicleActivityImage> findByTripIdAndStatus(Long tripId, TripStatusEnum status);
}