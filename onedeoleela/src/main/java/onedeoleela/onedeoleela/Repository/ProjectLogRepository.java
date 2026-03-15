package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.ProjectLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectLogRepository extends JpaRepository<ProjectLog, Long> {

    List<ProjectLog> findByTripId(Long tripId);

}