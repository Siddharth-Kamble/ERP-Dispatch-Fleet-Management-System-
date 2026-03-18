package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.Flat;
import onedeoleela.onedeoleela.Repository.FlatRepository;
import onedeoleela.onedeoleela.Service.FlatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/flats")
@RequiredArgsConstructor
public class FlatController {

    private final FlatService flatService;

    // Create Flat under a Floor
    @PostMapping("/floor/{floorId}")
    public Flat createFlat(@PathVariable Long floorId,
                           @RequestBody Flat flat) {

        return flatService.createFlat(floorId, flat);
    }

    // Get All Flats
    @GetMapping
    public List<Flat> getAllFlats() {
        return flatService.getAllFlats();
    }

    // Get Flat by ID
    @GetMapping("/{id}")
    public Flat getFlatById(@PathVariable Long id) {
        return flatService.getFlatById(id);
    }

    // Get Flat by Flat Number
    @GetMapping("/number/{flatNumber}")
    public Flat getFlatByNumber(@PathVariable String flatNumber) {
        return flatService.getFlatByNumber(flatNumber);
    }

    // Delete Flat
    @DeleteMapping("/{id}")
    public String deleteFlat(@PathVariable Long id) {
        flatService.deleteFlat(id);
        return "Flat deleted successfully";
    }
    // Get all flats by floor ID
    @GetMapping("/floor/{floorId}")
    public List<Flat> getFlatsByFloor(@PathVariable Long floorId) {
        return flatService.getFlatsByFloorId(floorId);
    }

}