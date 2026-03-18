package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.Floor;
import onedeoleela.onedeoleela.Service.FloorService;
import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Service.ProjectService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/floors")
@RequiredArgsConstructor
public class FloorController {
    private final FloorService floorService;
    private final    ProjectService projectService;
    @PostMapping("/project/{projectId}")
    public Floor createFloor(@PathVariable Long projectId, @RequestBody Floor floor) {
        return floorService.createFloor(projectId, floor);
    }

    @GetMapping
    public List<Floor> getAllFloors() {
        return floorService.getAllFloors();
    }

    @GetMapping("/{id}")
    public Floor getFloorById(@PathVariable Long id) {
        return floorService.getFloorById(id);
    }

    @GetMapping("/number/{floorNumber}")
    public Floor getFloorByNumber(@PathVariable Integer floorNumber) {
        return floorService.getFloorByNumber(floorNumber);
    }

    @GetMapping("/project/{projectId}")
    public List<Floor> getFloorsByProject(@PathVariable Long projectId) {
        return floorService.getFloorsByProject(projectId);
    }

    @DeleteMapping("/{id}")
    public String deleteFloor(@PathVariable Long id) {
        floorService.deleteFloor(id);
        return "Floor deleted successfully";
    }
    @GetMapping("/max-floor/{projectId}")
    public Integer getMaxFloorNumber(@PathVariable Long projectId) {
        return floorService.getMaxFloorNumber(projectId);
    }
    @GetMapping("/projectId/{projectName}")
    public Long getProjectID(@PathVariable String projectName) {

        Long projectId = projectService.getProjectIdByName(projectName);

        // or throw a ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        return Objects.requireNonNullElse(projectId, 0L);

    }

}