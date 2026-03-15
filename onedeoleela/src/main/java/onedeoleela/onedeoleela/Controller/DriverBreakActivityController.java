package onedeoleela.onedeoleela.Controller;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.DriverBreakActivity;
import onedeoleela.onedeoleela.Service.DriverBreakActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/driver-break")
@RequiredArgsConstructor
public class DriverBreakActivityController {

    private final DriverBreakActivityService breakService;
    @GetMapping("/history/{tripId}")
    public ResponseEntity<List<DriverBreakActivity>> getBreakHistory(@PathVariable Long tripId) {
        return ResponseEntity.ok(breakService.getBreaksByTrip(tripId));
    }
    @PostMapping("/start")
    public ResponseEntity<DriverBreakActivity> startBreak(
            @RequestParam Long tripId,
            @RequestParam(required = false) String reason) { // optional reason
        return ResponseEntity.ok(breakService.startBreak(tripId, reason));
    }

    @PostMapping("/end")
    public ResponseEntity<DriverBreakActivity> endBreak(@RequestParam Long tripId) {
        return ResponseEntity.ok(breakService.endBreak(tripId));
    }

    @GetMapping("/total")
    public ResponseEntity<Long> getTotalBreak(@RequestParam Long tripId) {
        return ResponseEntity.ok(breakService.getTotalBreakMinutes(tripId));
    }
}