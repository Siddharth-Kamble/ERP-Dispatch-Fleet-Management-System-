package onedeoleela.onedeoleela.Coordinator.Repository;


import onedeoleela.onedeoleela.Coordinator.Entity.InfoSheetFlat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InfoSheetFlatRepository extends JpaRepository<InfoSheetFlat, Long> {
}
