    package onedeoleela.onedeoleela.Service;


    import onedeoleela.onedeoleela.Entity.Project;
    import onedeoleela.onedeoleela.Repository.ProjectRepository;
    import org.springframework.stereotype.Service;

    import java.util.List;
    import java.util.Optional;

    @Service
    public class ProjectService {

        private final ProjectRepository projectRepository;

        public ProjectService(ProjectRepository projectRepository) {
            this.projectRepository = projectRepository;
        }

        // Create Project
        public Project createProject(Project project) {
            return projectRepository.save(project);
        }

        // Get All Projects
        public List<Project> getAllProjects() {
            return projectRepository.findAll();
        }

        // Get Project By Id
        public Optional<Project> getProjectById(Long id) {
            return projectRepository.findById(id);
        }

        // Update Project
        public Project updateProject(Long id, Project project) {
            Project existingProject = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            existingProject.setProjectCode(project.getProjectCode());
            existingProject.setProjectName(project.getProjectName());
            existingProject.setProjectType(project.getProjectType());
            existingProject.setDescription(project.getDescription());
            existingProject.setClientName(project.getClientName());
            existingProject.setClientContact(project.getClientContact());
            existingProject.setClientEmail(project.getClientEmail());
            existingProject.setSiteName(project.getSiteName());
            existingProject.setSiteAddress(project.getSiteAddress());
            existingProject.setCity(project.getCity());
            existingProject.setState(project.getState());
            existingProject.setCountry(project.getCountry());
            existingProject.setStartDate(project.getStartDate());
            existingProject.setExpectedEndDate(project.getExpectedEndDate());
            existingProject.setActualEndDate(project.getActualEndDate());
            existingProject.setProjectStatus(project.getProjectStatus());
            existingProject.setEstimatedCost(project.getEstimatedCost());
            existingProject.setContractValue(project.getContractValue());
            existingProject.setProjectManager(project.getProjectManager());
            existingProject.setSiteEngineer(project.getSiteEngineer());
            existingProject.setTotalAreaSqFt(project.getTotalAreaSqFt());
            existingProject.setNumberOfFloors(project.getNumberOfFloors());

            return projectRepository.save(existingProject);
        }

        // Delete Project
        public void deleteProject(Long id) {
            projectRepository.deleteById(id);
        }
        public Optional<Project> getProjectByName(String projectName) {
            return projectRepository.findByProjectName(projectName);
        }
        public Long getProjectIdByName(String projectName) {
            return projectRepository.findByProjectName(projectName)
                    .map(Project::getProjectId)
                    .orElse(null); // or throw an exception if project not found
        }
    }

