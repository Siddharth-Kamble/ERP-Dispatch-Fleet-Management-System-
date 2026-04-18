package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.VehicleRequest;
import onedeoleela.onedeoleela.Service.VehicleRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicle-requests")
@CrossOrigin(origins = "*")
public class VehicleRequestController {

    private final VehicleRequestService service;

    public VehicleRequestController(VehicleRequestService service) {
        this.service = service;
    }

    // ── CREATE new request ────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<VehicleRequest> create(@RequestBody VehicleRequest request) {
        return ResponseEntity.ok(service.createRequest(request));
    }

    // ── GET ALL (dispatcher) ──────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<VehicleRequest>> getAll() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    // ── GET BY REQUESTER eCode ────────────────────────────────────────────
    @GetMapping("/my/{eCode}")
    public ResponseEntity<List<VehicleRequest>> getMyRequests(@PathVariable String eCode) {
        return ResponseEntity.ok(service.getRequestsByRequester(eCode));
    }

    // ── GET BY DEPARTMENT ─────────────────────────────────────────────────
    @GetMapping("/department/{department}")
    public ResponseEntity<List<VehicleRequest>> getByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(service.getRequestsByDepartment(department));
    }

    // ── DISPATCHER: schedule ─────────────────────────────────────────────
    @PutMapping("/{id}/schedule")
    public ResponseEntity<VehicleRequest> schedule(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.scheduleRequest(
                id,
                body.get("vehicleNumber"),
                body.get("driverName"),
                LocalDate.parse(body.get("scheduledDate")),
                LocalTime.parse(body.get("scheduledTime")),
                body.get("note")
        ));
    }

    // ── REQUESTER: accept ────────────────────────────────────────────────
    @PutMapping("/{id}/accept")
    public ResponseEntity<VehicleRequest> accept(@PathVariable Long id) {
        return ResponseEntity.ok(service.acceptSchedule(id));
    }

    // ── REQUESTER: reject + propose new time ─────────────────────────────
    @PutMapping("/{id}/reject")
    public ResponseEntity<VehicleRequest> reject(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.rejectAndPropose(
                id,
                body.get("rejectionReason"),
                LocalDate.parse(body.get("proposedDate")),
                LocalTime.parse(body.get("proposedTime"))
        ));
    }

    // ── DISPATCHER: reschedule ────────────────────────────────────────────
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<VehicleRequest> reschedule(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.reschedule(
                id,
                body.get("vehicleNumber"),
                body.get("driverName"),
                LocalDate.parse(body.get("scheduledDate")),
                LocalTime.parse(body.get("scheduledTime")),
                body.get("note")
        ));
    }

    // ── COMPLETE ──────────────────────────────────────────────────────────
    @PutMapping("/{id}/complete")
    public ResponseEntity<VehicleRequest> complete(@PathVariable Long id) {
        return ResponseEntity.ok(service.completeRequest(id));
    }

    // ── CANCEL ────────────────────────────────────────────────────────────
    @PutMapping("/{id}/cancel")
    public ResponseEntity<VehicleRequest> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancelRequest(id));
    }

    // ── NOTIFICATION COUNTS ───────────────────────────────────────────────
    @GetMapping("/notifications/dispatcher/count")
    public ResponseEntity<Map<String, Long>> dispatcherCount() {
        return ResponseEntity.ok(Map.of("count", service.getDispatcherUnreadCount()));
    }

    @GetMapping("/notifications/requester/{eCode}/count")
    public ResponseEntity<Map<String, Long>> requesterCount(@PathVariable String eCode) {
        return ResponseEntity.ok(Map.of("count", service.getRequesterUnreadCount(eCode)));
    }

    // ── MARK READ ─────────────────────────────────────────────────────────
    @PutMapping("/notifications/dispatcher/read")
    public ResponseEntity<Void> markDispatcherRead() {
        service.markDispatcherNotificationsRead();
        return ResponseEntity.ok().build();
    }

    @PutMapping("/notifications/requester/{eCode}/read")
    public ResponseEntity<Void> markRequesterRead(@PathVariable String eCode) {
        service.markRequesterNotificationsRead(eCode);
        return ResponseEntity.ok().build();
    }
}