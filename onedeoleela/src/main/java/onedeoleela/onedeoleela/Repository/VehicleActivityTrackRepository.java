package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.VehicleActivityTrack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleActivityTrackRepository
        extends JpaRepository<VehicleActivityTrack, Long> {
    List<VehicleActivityTrack> findByTripIdIn(List<Long> tripIds);
    List<VehicleActivityTrack> findByTripId(Long tripId);
    Optional<VehicleActivityTrack>
    findTopByTripIdOrderByEventTimeDesc(Long tripId);
    List<VehicleActivityTrack> findByTripIdOrderByEventTimeAsc(Long tripId);


}