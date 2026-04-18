    package onedeoleela.onedeoleela.Service;



    import onedeoleela.onedeoleela.Entity.ProjectLog;
    import onedeoleela.onedeoleela.Entity.Window;
    import onedeoleela.onedeoleela.Repository.ProjectLogRepository;
    import onedeoleela.onedeoleela.Repository.WindowRepository;
    import org.springframework.stereotype.Service;

    import java.time.LocalDateTime;
    import java.util.HashMap;
    import java.util.List;
    import java.util.Map;

    @Service
    public class ProjectLogService {

        private final ProjectLogRepository projectLogRepository;
        private final WindowRepository windowRepository;
        public ProjectLogService(ProjectLogRepository projectLogRepository, WindowRepository windowRepository) {
            this.projectLogRepository = projectLogRepository;
            this.windowRepository = windowRepository;
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


        public Map<String, Object> getTripDates(Long tripId) {

            Map<String, Object> response = new HashMap<>();

            ProjectLog log = projectLogRepository.findTopByTripIdOrderByIdDesc(tripId);
            List<Window> windows = windowRepository.findWindowsByTripId(tripId);

            String userDate = null;
            String actualDate = null;
            boolean sameDate = true;

            // userDate
            if (log != null && log.getUserDate() != null) {
                userDate = log.getUserDate().toString();
            }

            // actualDate
            if (windows != null && !windows.isEmpty()) {
                LocalDateTime created = windows.get(0).getCreatedAt();
                if (created != null) {
                    actualDate = created.toLocalDate().toString();
                }
            }

            // compare
            if (userDate != null && actualDate != null) {
                sameDate = userDate.equals(actualDate);
            }

            response.put("userDate", userDate);
            response.put("actualDate", actualDate);
            response.put("sameDate", sameDate);

            return response;
        }

        public Map<String, Object> getTowerDetailsByTripId(Long tripId) {

            List<Object[]> data = projectLogRepository.findTowerDetailsByTripId(tripId);

            if (data.isEmpty()) {
                throw new RuntimeException("No data found for this tripId");
            }

            // ✅ Since all towerIds are same → take first row
            Object[] row = data.get(0);

            Map<String, Object> result = new HashMap<>();
            result.put("towerId", row[0]);
            result.put("towerName", row[1]);

            return result;
        }
    }
