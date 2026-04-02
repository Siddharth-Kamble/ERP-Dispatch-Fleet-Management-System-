package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.Tower;
import onedeoleela.onedeoleela.Service.TowerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/towers")
@CrossOrigin
public class TowerController {

    @Autowired
    private TowerService towerService;

    // ✅ Create Tower under Project
    @PostMapping("/project/{projectId}")
    public Tower createTower(@PathVariable Long projectId, @RequestBody Tower tower) {
        return towerService.createTower(projectId, tower);
    }

    @GetMapping("/project/{projectId}")
    public List<Tower> getTowersByProject(@PathVariable Long projectId) {
        return towerService.getTowersByProject(projectId);
    }
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<String> getTowerNameByTrip(@PathVariable Long tripId) {
        String towerName = towerService.getTowerNameByTripId(tripId);
        return ResponseEntity.ok(towerName);
    }

    // ✅ Get Tower by ID
    @GetMapping("/{towerId}")
    public Tower getTower(@PathVariable Long towerId) {
        return towerService.getTowerById(towerId);
    }

    // ✅ Delete Tower
    @DeleteMapping("/{towerId}")
    public String deleteTower(@PathVariable Long towerId) {
        towerService.deleteTower(towerId);
        return "Tower deleted successfully";
    }
}