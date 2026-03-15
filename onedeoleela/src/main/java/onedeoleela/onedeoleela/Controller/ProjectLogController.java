package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.ProjectLog;
import onedeoleela.onedeoleela.Service.ProjectLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
