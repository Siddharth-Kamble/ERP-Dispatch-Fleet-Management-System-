package onedeoleela.onedeoleela.Planning.Repository;

import onedeoleela.onedeoleela.Planning.Entity.WorkTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkTemplateRepository extends JpaRepository<WorkTemplate, Long> {

    /** All templates, newest first */
    List<WorkTemplate> findAllByOrderByCreatedAtDesc();

    /** Search by name (case-insensitive) */
    List<WorkTemplate> findByTemplateNameContainingIgnoreCaseOrderByCreatedAtDesc(String name);
}