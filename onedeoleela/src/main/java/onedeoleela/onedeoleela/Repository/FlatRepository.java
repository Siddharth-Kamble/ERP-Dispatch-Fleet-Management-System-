package onedeoleela.onedeoleela.Repository;



import onedeoleela.onedeoleela.Entity.Flat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FlatRepository extends JpaRepository<Flat, Long> {

    Optional<Flat> findByFlatNumber(String flatNumber);
    Optional<Flat> findByFlatNumberAndFloor_FloorId(String flatNumber, Long floorId);
}