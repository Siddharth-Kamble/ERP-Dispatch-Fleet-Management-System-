package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    Optional<Item> findFirstByTrip_Id(Long tripId);

    /**
     * Fetch all items for a trip — used by:
     *   1. ItemService.getColumnPresence() — determines which PDF columns to show
     *   2. Any frontend list/table view for a specific trip
     */
    List<Item> findByTrip_Id(Long tripId);
}