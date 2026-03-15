package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.Flat;
import onedeoleela.onedeoleela.Entity.Floor;
import onedeoleela.onedeoleela.Repository.FlatRepository;
import onedeoleela.onedeoleela.Repository.FloorRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FlatService {

    private final FlatRepository flatRepository;
    private final FloorRepository floorRepository;

    // Create Flat under Floor
    public Flat createFlat(Long floorId, Flat flat) {

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new RuntimeException("Floor not found"));

        flat.setFloor(floor);

        return flatRepository.save(flat);
    }

    public List<Flat> getAllFlats() {
        return flatRepository.findAll();
    }

    public Flat getFlatById(Long id) {
        return flatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flat not found"));
    }

    public Flat getFlatByNumber(Integer flatNumber) {
        return flatRepository.findByFlatNumber(flatNumber)
                .orElseThrow(() -> new RuntimeException("Flat not found"));
    }

    public void deleteFlat(Long id) {
        flatRepository.deleteById(id);
    }
}