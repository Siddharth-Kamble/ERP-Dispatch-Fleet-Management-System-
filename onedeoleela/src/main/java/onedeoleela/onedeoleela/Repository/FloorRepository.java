package onedeoleela.onedeoleela.Repository;



import onedeoleela.onedeoleela.Entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FloorRepository extends JpaRepository<Floor, Long> {
    Optional<Floor> findByFloorNumber(Integer floorNumber);


    List<Floor> findByTower_TowerId(Long towerId);
    Optional<Floor> findByFloorNumberAndTower_TowerId(Integer floorNumber, Long towerId);


    @Query("SELECT MAX(f.floorNumber) FROM Floor f WHERE f.tower.towerId = :towerId")
    Integer findMaxFloorNumberByTowerId(Long towerId);


    Optional<Floor> findFirstByTower_TowerId(Long towerId);



}