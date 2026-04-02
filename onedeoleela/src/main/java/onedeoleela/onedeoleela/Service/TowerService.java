package onedeoleela.onedeoleela.Service;



import onedeoleela.onedeoleela.Entity.Item;
import onedeoleela.onedeoleela.Entity.Project;
import onedeoleela.onedeoleela.Entity.ProjectLog;
import onedeoleela.onedeoleela.Entity.Tower;
import onedeoleela.onedeoleela.Repository.ItemRepository;
import onedeoleela.onedeoleela.Repository.ProjectLogRepository;
import onedeoleela.onedeoleela.Repository.ProjectRepository;
import onedeoleela.onedeoleela.Repository.TowerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TowerService {


    private final TowerRepository towerRepository;


    private final ProjectRepository projectRepository;
    private final ProjectLogRepository  projectLogRepository;
    private final ItemRepository itemRepository;

    public TowerService(TowerRepository towerRepository, ProjectRepository projectRepository, ProjectLogRepository projectLogRepository, ItemRepository itemRepository) {
        this.towerRepository = towerRepository;
        this.projectRepository = projectRepository;
        this.projectLogRepository = projectLogRepository;
        this.itemRepository = itemRepository;
    }

    // ✅ Create Tower
    public Tower createTower(Long projectId, Tower tower) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        tower.setProject(project);
        return towerRepository.save(tower);
    }

    // ✅ Get Towers by Project
    public List<Tower> getTowersByProject(Long projectId) {
        return towerRepository.findByProject_ProjectId(projectId);
    }

//    public String getTowerNameByTripId(Long tripId) {
//        // 1. Find any item with this tripId
//        Optional<Item> itemOpt = itemRepository.findFirstByTrip_Id(tripId);
//
//        // 2. If item found, get tower name from it
//        if (itemOpt.isPresent()) {
//            Item item = itemOpt.get();
//            if (item.getTower() != null) {
//                return item.getTower().getTowerName();
//            }
//        }
//        return "N/A";
//    }

    public String getTowerNameByTripId(Long tripId) {

        // 1. Find ProjectLog using tripId
        Optional<ProjectLog> logOpt = projectLogRepository.findFirstByTripId(tripId);

        // 2. Extract Tower from ProjectLog
        if (logOpt.isPresent()) {
            ProjectLog log = logOpt.get();

            if (log.getTower() != null) {
                return log.getTower().getTowerName(); // ✅ direct fetch
            }
        }

        return " ";
    }

    // ✅ Get Single Tower
    public Tower getTowerById(Long towerId) {
        return towerRepository.findById(towerId)
                .orElseThrow(() -> new RuntimeException("Tower not found"));
    }

    // ✅ Delete Tower
    public void deleteTower(Long towerId) {
        towerRepository.deleteById(towerId);
    }
}