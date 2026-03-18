    package onedeoleela.onedeoleela.Service;



    import onedeoleela.onedeoleela.Entity.ProjectLog;
    import onedeoleela.onedeoleela.Repository.ProjectLogRepository;
    import org.springframework.stereotype.Service;

    import java.util.List;

    @Service
    public class ProjectLogService {

        private final ProjectLogRepository projectLogRepository;

        public ProjectLogService(ProjectLogRepository projectLogRepository) {
            this.projectLogRepository = projectLogRepository;
        }

        public ProjectLog saveLog(ProjectLog log){
            return projectLogRepository.save(log);
        }

        public List<ProjectLog> getAllLogs(){
            return projectLogRepository.findAll();
        }

        public List<ProjectLog> getLogsByTrip(Long tripId){
            return projectLogRepository.findByTripId(tripId);
        }
        public List<ProjectLog> getLogsByProjectName(String projectName){
            return projectLogRepository.findByProjectNameOrderByCreatedAtDesc(projectName);
        }
    }
