package onedeoleela.onedeoleela.Repository;



import onedeoleela.onedeoleela.Entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FloorRepository extends JpaRepository<Floor, Long> {
    Optional<Floor> findByFloorNumber(Integer floorNumber);
    List<Floor> findByProject_ProjectId(Long projectId);
    @Query("SELECT MAX(f.floorNumber) FROM Floor f WHERE f.project.projectId = :projectId")
    Integer findMaxFloorNumberByProjectId(@Param("projectId") Long projectId);
    Optional<Floor> findByFloorNumberAndProject_ProjectId(Integer floorNumber, Long projectId);
}