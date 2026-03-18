package onedeoleela.onedeoleela.Service;


import onedeoleela.onedeoleela.Entity.Floor;
import onedeoleela.onedeoleela.Entity.Project;
import onedeoleela.onedeoleela.Repository.FloorRepository;
import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class FloorService {
    private final FloorRepository floorRepository;
    private final ProjectRepository projectRepository;

    public Floor createFloor(Long projectId, Floor floor) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        floor.setProject(project);
        return floorRepository.save(floor);
    }

    public List<Floor> getAllFloors() {
        return floorRepository.findAll();
    }

    public Floor getFloorById(Long id) {
        return floorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Floor not found with id: " + id));
    }

    public Floor getFloorByNumber(Integer floorNumber) {
        return floorRepository.findByFloorNumber(floorNumber)
                .orElseThrow(() -> new RuntimeException("Floor not found with number: " + floorNumber));
    }

    public List<Floor> getFloorsByProject(Long projectId) {
        return floorRepository.findByProject_ProjectId(projectId);
    }

    public void deleteFloor(Long id) {
        Floor floor = getFloorById(id);
        floorRepository.delete(floor);
    }
    public Integer getMaxFloorNumber(Long projectId) {
        return floorRepository.findMaxFloorNumberByProjectId(projectId);
    }
}