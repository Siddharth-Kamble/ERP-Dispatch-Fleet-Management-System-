package onedeoleela.onedeoleela.Repository;


import onedeoleela.onedeoleela.Entity.ProjectLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectLogRepository extends JpaRepository<ProjectLog, Long> {



    List<ProjectLog> findByProjectNameOrderByCreatedAtDesc(String projectName);

    @Query("SELECT t.towerId, t.towerName " +
            "FROM ProjectLog p JOIN p.tower t " +
            "WHERE p.tripId = :tripId")
    List<Object[]> findTowerDetailsByTripId(@Param("tripId") Long tripId);
    ProjectLog findTopByTripIdOrderByIdDesc(Long tripId);
    Optional<ProjectLog> findFirstByTripIdOrderByCreatedAtDesc(Long tripId);
    @Query("SELECT p FROM ProjectLog p WHERE p.tripId = :tripId")
    List<ProjectLog> findByTripId(@Param("tripId") Long tripId);
    @Query("SELECT p FROM ProjectLog p WHERE p.tripId = :tripId")
    Optional<ProjectLog> findFirstByTripId(@Param("tripId") Long tripId);

    Optional<ProjectLog> findTopByTripIdOrderByCreatedAtDesc(Long tripId);

}