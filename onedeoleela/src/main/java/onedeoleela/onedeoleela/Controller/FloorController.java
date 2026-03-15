package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.Floor;
import onedeoleela.onedeoleela.Service.FloorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/floors")
@RequiredArgsConstructor
public class FloorController {

    private final FloorService floorService;

    // Create Floor
    @PostMapping("/project/{projectId}")
    public Floor createFloor(@PathVariable Long projectId,
                             @RequestBody Floor floor) {

        return floorService.createFloor(projectId, floor);
    }

    // Get All Floors
    @GetMapping
    public List<Floor> getAllFloors() {
        return floorService.getAllFloors();
    }

    // Get Floor by ID
    @GetMapping("/{id}")
    public Floor getFloorById(@PathVariable Long id) {
        return floorService.getFloorById(id);
    }

    // Get Floor by Number
    @GetMapping("/number/{floorNumber}")
    public Floor getFloorByNumber(@PathVariable Integer floorNumber) {
        return floorService.getFloorByNumber(floorNumber);
    }

    // Get Floors by Project
    @GetMapping("/project/{projectId}")
    public List<Floor> getFloorsByProject(@PathVariable Long projectId) {
        return floorService.getFloorsByProject(projectId);
    }

    // Delete Floor
    @DeleteMapping("/{id}")
    public String deleteFloor(@PathVariable Long id) {
        floorService.deleteFloor(id);
        return "Floor deleted successfully";
    }
}