package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    // You can add custom queries if needed
}