package onedeoleela.onedeoleela.Service;

import jakarta.transaction.Transactional;
import onedeoleela.onedeoleela.Entity.Flat;
import onedeoleela.onedeoleela.Entity.Floor;
import onedeoleela.onedeoleela.Repository.FlatRepository;
import onedeoleela.onedeoleela.Repository.FloorRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FlatService {

    private final FlatRepository flatRepository;
    private final FloorRepository floorRepository;

    // Create Flat under Floor
    @Transactional
    public Flat createFlat(Long floorId, Flat flat) {
        // 1. Verify the Floor exists
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new RuntimeException("Floor not found"));

        // 2. Prevent Duplicate Flat Numbers on the same floor
        Optional<Flat> existingFlat = flatRepository
                .findByFlatNumberAndFloor_FloorId(flat.getFlatNumber(), floorId);

        if (existingFlat.isPresent()) {
            throw new RuntimeException("Flat " + flat.getFlatNumber() + " already exists on this floor");
        }

        // 3. Link the Flat to the Floor
        flat.setFloor(floor);
        Flat savedFlat = flatRepository.save(flat);

        // 4. Update the Floor's totalFlats count
        int currentCount = (floor.getTotalFlats() != null) ? floor.getTotalFlats() : 0;
        floor.setTotalFlats(currentCount + 1);

        // 5. Save the updated floor
        floorRepository.save(floor);

        return savedFlat;
    }

    public List<Flat> getAllFlats() {
        return flatRepository.findAll();
    }

    public Flat getFlatById(Long id) {
        return flatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flat not found"));
    }

    public Flat getFlatByNumber(String flatNumber) {
        return flatRepository.findByFlatNumber(flatNumber)
                .orElseThrow(() -> new RuntimeException("Flat not found"));
    }

    public void deleteFlat(Long id) {
        flatRepository.deleteById(id);
    }
    public List<Flat> getFlatsByFloorId(Long floorId) {
        return flatRepository.findAll().stream()
                .filter(flat -> flat.getFloor() != null && flat.getFloor().getFloorId().equals(floorId))
                .toList();
    }
}