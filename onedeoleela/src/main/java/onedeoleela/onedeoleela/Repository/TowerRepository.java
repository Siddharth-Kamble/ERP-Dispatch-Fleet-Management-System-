package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.Tower;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TowerRepository extends JpaRepository<Tower, Long> {

    List<Tower> findByProject_ProjectId(Long projectId);
}