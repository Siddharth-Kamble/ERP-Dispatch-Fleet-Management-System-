    package onedeoleela.onedeoleela.Controller;

    import onedeoleela.onedeoleela.Entity.Floor;
    import onedeoleela.onedeoleela.Service.FloorService;
    import lombok.RequiredArgsConstructor;
    import onedeoleela.onedeoleela.Service.ProjectService;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;
    import org.springframework.web.server.ResponseStatusException;

    import java.util.List;


    @RestController
    @RequestMapping("/floors")
    @RequiredArgsConstructor
    public class FloorController {
        private final FloorService floorService;
        private final    ProjectService projectService;

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






        // ✅ Get Floors by Tower
          @DeleteMapping("/{floorId}")
        public String deleteFloor(@PathVariable Long floorId) {
            floorService.deleteFloor(floorId);
            return "Floor deleted successfully";
        }

        // ✅ ADD YOUR METHOD HERE
        @GetMapping("/tower/{towerId}")
        public List<Floor> getFloorsByTower(@PathVariable Long towerId) {
            return floorService.getFloorsByTower(towerId);
        }

        @PostMapping("/tower/{towerId}")
        public ResponseEntity<?> createFloor(@PathVariable Long towerId, @RequestBody Floor floor) {
            try {
                Floor created = floorService.createFloor(towerId, floor);
                return ResponseEntity.ok(created); // Returns the Floor object on success
            } catch (RuntimeException e) {
                // This returns "Floor X already exists in this tower" as a 400 Bad Request
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(e.getMessage());
            }
        }

    }