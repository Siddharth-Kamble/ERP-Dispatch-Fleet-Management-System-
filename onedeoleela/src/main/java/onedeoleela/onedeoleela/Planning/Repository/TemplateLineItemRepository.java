package onedeoleela.onedeoleela.Planning.Repository;


 import onedeoleela.onedeoleela.Planning.Entity.TemplateLineItem;
 import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateLineItemRepository extends JpaRepository<TemplateLineItem, Long> {

    List<TemplateLineItem> findByTemplateIdOrderBySrNoAsc(Long templateId);
}