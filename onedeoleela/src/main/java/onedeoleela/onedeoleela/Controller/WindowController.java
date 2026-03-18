//    package onedeoleela.onedeoleela.Controller;
//
//    import onedeoleela.onedeoleela.Entity.Trip;
//    import onedeoleela.onedeoleela.Entity.Window;
//    import onedeoleela.onedeoleela.Service.WindowService;
//
//    import org.springframework.web.bind.annotation.*;
//
//    import java.util.List;
//
//    @RestController
//    @RequestMapping("/windows")
//    @CrossOrigin(origins = "http://localhost:3000")
//    public class WindowController {
//
//        private final WindowService windowService;
//
//        public WindowController(WindowService windowService) {
//            this.windowService = windowService;
//        }
//
//        @GetMapping("/all")
//        public List<Window> getAllWindows() {
//            return windowService.getAllWindows();
//        }
//
//        @GetMapping("/trip/{tripId}")
//        public Trip getTripDetails(@PathVariable Long tripId) {
//            return windowService.getTripDetails(tripId);
//        }
//
//        @PostMapping("/trip/{tripId}/flat/{flatNumber}")
//        public Window createWindow(@PathVariable Long tripId,
//                                   @PathVariable Integer flatNumber,
//                                   @RequestBody Window window) {
//
//            return windowService.createWindow(tripId, flatNumber, window);
//        }
//
//        @GetMapping("/trip/{tripId}/windows")
//        public List<Window> getWindowsByTrip(@PathVariable Long tripId) {
//            return windowService.getWindowsByTrip(tripId);
//        }
//    }


package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.Trip;
import onedeoleela.onedeoleela.Entity.Window;
import onedeoleela.onedeoleela.Service.WindowService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/windows")
@CrossOrigin(origins = "http://localhost:3000")
public class WindowController {

    private final WindowService windowService;

    public WindowController(WindowService windowService) {
        this.windowService = windowService;
    }

    @GetMapping("/all")
    public List<Window> getAllWindows() {
        return windowService.getAllWindows();
    }

    @GetMapping("/trip/{tripId}")
    public Trip getTripDetails(@PathVariable Long tripId) {
        return windowService.getTripDetails(tripId);
    }

    /**
     * Create a new Window and assign it to Trip, Flat, and optionally Floor
     * floorId can be passed as a query parameter: /trip/{tripId}/flat/{flatNumber}?floorId=1
     */
    @PostMapping("/trip/{tripId}/flat/{flatNumber}")
    public Window createWindow(
            @PathVariable Long tripId,
            @PathVariable String flatNumber,
            @RequestParam(required = false) Long floorId, // optional floorId
            @RequestBody Window window) {

        return windowService.createWindow(tripId, flatNumber, floorId, window);
    }

    @GetMapping("/trip/{tripId}/windows")
    public List<Window> getWindowsByTrip(@PathVariable Long tripId) {
        return windowService.getWindowsByTrip(tripId);
    }
}