package onedeoleela.onedeoleela.Controller;


import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.TripCancellation;
import onedeoleela.onedeoleela.Service.TripCancellationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cancellations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // Matches your React App port
public class TripCancellationController {

    private final TripCancellationService cancellationService;

    @PostMapping("/reject/{tripId}")
    public ResponseEntity<String> rejectTrip(
            @PathVariable Long tripId,
            @RequestBody Map<String, String> payload) { // Direct Map instead of DTO

        try {
            // Extracting values by their JSON keys
            String eCode = payload.get("eCode");
            String reason = payload.get("reason");
            String remarks = payload.get("remarks");

            cancellationService.processCancellation(tripId, eCode, reason, remarks);

            return ResponseEntity.ok("Trip rejection recorded successfully.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Failed: " + e.getMessage());
        }
    }

    @GetMapping("/all-logs")
    public ResponseEntity<List<TripCancellation>> getAllLogs() {
        List<TripCancellation> logs = cancellationService.getAllLogs();
        return ResponseEntity.ok(logs);
    }
    @GetMapping("/driver/{eCode}")
    public ResponseEntity<List<TripCancellation>> getLogsByDriver(@PathVariable String eCode) {
        List<TripCancellation> logs = cancellationService.getLogsByDriver(eCode);
        return ResponseEntity.ok(logs);
    }
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<Map<String, Object>> getInfoByTripId(@PathVariable Long tripId) {
        try {
            Map<String, Object> details = cancellationService.getCancellationDetailsWithDriver(tripId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}