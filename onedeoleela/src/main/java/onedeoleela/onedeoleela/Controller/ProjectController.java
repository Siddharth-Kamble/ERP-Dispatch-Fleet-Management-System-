    package onedeoleela.onedeoleela.Controller;

    import onedeoleela.onedeoleela.Entity.Project;
    import onedeoleela.onedeoleela.Service.ProjectLogService;
    import onedeoleela.onedeoleela.Service.ProjectService;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;
    import java.util.Map;
    import java.util.Optional;

    @RestController
    @RequestMapping("/projects")
    @CrossOrigin(origins = "http://localhost:3000") // Allow frontend access
    public class ProjectController {

        private final ProjectService projectService;
        private final ProjectLogService projectLogService;

        public ProjectController(ProjectService projectService, ProjectLogService projectLogService) {
            this.projectService = projectService;
            this.projectLogService = projectLogService;
        }

        // Create Project
        @PostMapping
        public ResponseEntity<Project> createProject(@RequestBody Project project) {
            Project createdProject = projectService.createProject(project);
            return ResponseEntity.ok(createdProject);
        }

        // Get All Projects
        @GetMapping
        public ResponseEntity<List<Project>> getAllProjects() {
            List<Project> projects = projectService.getAllProjects();
            return ResponseEntity.ok(projects);
        }

        // Get Project By Id
        @GetMapping("/{id}")
        public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
            Optional<Project> project = projectService.getProjectById(id);
            return project.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        // Update Project
        @PutMapping("/{id}")
        public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project project) {
            Project updatedProject = projectService.updateProject(id, project);
            return ResponseEntity.ok(updatedProject);
        }

        // Delete Project
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
            projectService.deleteProject(id);
            return ResponseEntity.noContent().build();
        }

        // -----------------------------
        // New Endpoint for WindowManager frontend
        // Fetch project details by project name
        @GetMapping("/by-name/{projectName}")
        public ResponseEntity<Project> getProjectByName(@PathVariable String projectName) {
            Optional<Project> project = projectService.getProjectByName(projectName);
            return project.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        @GetMapping("/PAddress/{tripId}")
        public Map<String, String> getProjectDetails(@PathVariable Long tripId) {
            return projectLogService.getDetails(tripId);
        }
    }