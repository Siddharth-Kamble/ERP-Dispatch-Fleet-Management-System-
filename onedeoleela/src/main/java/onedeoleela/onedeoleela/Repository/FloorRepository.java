package onedeoleela.onedeoleela.Repository;



import onedeoleela.onedeoleela.Entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FloorRepository extends JpaRepository<Floor, Long> {

    Optional<Floor> findByFloorNumber(Integer floorNumber);

    List<Floor> findByProject_ProjectId(Long projectId);

}