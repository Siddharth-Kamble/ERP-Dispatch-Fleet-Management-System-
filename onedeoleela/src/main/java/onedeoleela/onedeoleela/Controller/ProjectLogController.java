package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.ProjectLog;
import onedeoleela.onedeoleela.Service.ProjectLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/logs")
@CrossOrigin
public class ProjectLogController {

    private final ProjectLogService projectLogService;

    public ProjectLogController(ProjectLogService projectLogService) {
        this.projectLogService = projectLogService;
    }

    @PostMapping
    public ProjectLog createLog(@RequestBody ProjectLog log){
        return projectLogService.saveLog(log);
    }

    @GetMapping
    public List<ProjectLog> getAllLogs(){
        return projectLogService.getAllLogs();
    }

    @GetMapping("/trip/{tripId}")
    public List<ProjectLog> getLogsByTrip(@PathVariable Long tripId){
        return projectLogService.getLogsByTrip(tripId);
    }

    @GetMapping("/project/{projectName}")
    public List<ProjectLog> getLogsByProjectName(@PathVariable String projectName){
        return projectLogService.getLogsByProjectName(projectName);
    }

    @GetMapping("/trip/{tripId}/dates")
    public ResponseEntity<Map<String, Object>> getTripDates(@PathVariable Long tripId) {
        return ResponseEntity.ok(projectLogService.getTripDates(tripId));
    }

    @GetMapping("/tower/{tripId}")
    public Map<String, Object> getTowerDetails(@PathVariable Long tripId) {
        return projectLogService.getTowerDetailsByTripId(tripId);
    }
}
