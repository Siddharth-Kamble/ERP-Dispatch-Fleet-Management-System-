package onedeoleela.onedeoleela.Service;


import onedeoleela.onedeoleela.Entity.Floor;
import onedeoleela.onedeoleela.Entity.Project;
import onedeoleela.onedeoleela.Entity.Tower;
import onedeoleela.onedeoleela.Repository.FloorRepository;
import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Repository.ProjectRepository;
import onedeoleela.onedeoleela.Repository.TowerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class FloorService {
    private final FloorRepository floorRepository;
    private final ProjectRepository projectRepository;
    private final TowerRepository towerRepository;


    public List<Floor> getAllFloors() {
        return floorRepository.findAll();
    }

    public Floor getFloorById(Long id) {
        return floorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Floor not found with id: " + id));
    }

    public Floor getFloorByNumber(Integer floorNumber) {
        return floorRepository.findByFloorNumber(floorNumber)
                .orElseThrow(() -> new RuntimeException("Floor not found with number: " + floorNumber));
    }


    public void deleteFloor(Long id) {
        Floor floor = getFloorById(id);
        floorRepository.delete(floor);
    }

//    public Floor createFloor(Long towerId, Floor floor) {
//        Tower tower = towerRepository.findById(towerId)
//                .orElseThrow(() -> new RuntimeException("Tower not found"));
//
//        floor.setTower(tower);
//        return floorRepository.save(floor);
//    }


    public Floor createFloor(Long towerId, Floor floor) {
        // 1. Verify the Tower exists
        Tower tower = towerRepository.findById(towerId)
                .orElseThrow(() -> new RuntimeException("Tower not found"));

        // 2. Check if this floor number already exists in THIS tower
        Optional<Floor> existingFloor = floorRepository
                .findByFloorNumberAndTower_TowerId(floor.getFloorNumber(), towerId);

        if (existingFloor.isPresent()) {
            throw new RuntimeException("Floor Already Exist");
        }

        // 3. Set floor relations and defaults
        floor.setTower(tower);
        floor.setTotalFlats(0);
        Floor savedFloor = floorRepository.save(floor);

        // 4. Update the Tower's floor count
        // Assuming your Tower entity has a field called totalFloors
        int currentCount = tower.getTotalFloors() != null ? tower.getTotalFloors() : 0;
        tower.setTotalFloors(currentCount + 1);

        // 5. Save the updated tower
        towerRepository.save(tower);

        return savedFloor;
    }

    // ✅ Get Floors by Tower
    public List<Floor> getFloorsByTower(Long towerId) {
        return floorRepository.findByTower_TowerId(towerId);
    }

    // ✅ Delete Floor

}