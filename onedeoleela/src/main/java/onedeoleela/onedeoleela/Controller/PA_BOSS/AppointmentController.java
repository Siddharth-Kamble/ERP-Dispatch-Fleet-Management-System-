

package onedeoleela.onedeoleela.Controller.PA_BOSS;

import onedeoleela.onedeoleela.Entity.PA_BOSS.Appointment;
import onedeoleela.onedeoleela.Repository.PA_BOSS.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {
        RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // ─── 1. Fetch ALL appointments for Dashboard ──────────────────────────────

    @GetMapping("/all")
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String role) {

        // ✅ Allow BOSS from both dashboard and widget
        // Also allow PA to see their own appointments via other endpoints
        if ("BOSS".equals(role)) {
            return ResponseEntity.ok(appointmentRepository.findAll());
        }

        // ✅ If no role sent — also allow (for BossAppointmentPage)
        // but log it
        if (role == null || role.isEmpty()) {
            System.out.println("⚠️ /all called without role param — allowing for now");
            return ResponseEntity.ok(appointmentRepository.findAll());
        }

        // ✅ Any other role — block
        System.out.println("🚫 Unauthorized /all access — role: " + role);
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Access denied: BOSS role required");
    }

    // ─── 2. Boss creates an "AVAILABLE" open slot ─────────────────────────────
    @PostMapping("/post-slot")
    public Appointment postSlot(@RequestBody Appointment appointment) {
        appointment.setStatus("AVAILABLE");
        appointment.setBossRead(true);
        appointment.setPaRead(false); // Alert PA: a new slot is open
        return appointmentRepository.save(appointment);
    }

    // ─── 3. PA creates a new appointment request ─────────────────────────────
    //        If booking an existing "AVAILABLE" slot, auto-approve.
    //        Otherwise sets status to PENDING and alerts Boss.
    @PostMapping("/schedule")
    public Appointment schedule(@RequestBody Appointment appointment) {
        if ("AVAILABLE".equals(appointment.getStatus())) {
            // PA is booking a Boss-posted open slot → auto-approve
            appointment.setStatus("APPROVED");
            appointment.setBossRead(true);
        } else {
            // New PA request → needs Boss review
            appointment.setStatus("PENDING");
            appointment.setBossRead(false); // Alert Boss
        }
        appointment.setPaRead(true);
        return appointmentRepository.save(appointment);
    }

    // ─── 4. Boss Action: Approve / Reject / Reschedule (also supports re-edit) ─
    //        Boss can call this endpoint ANY time to change status again.
    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment #" + id + " not found"));

        String newStatus = payload.get("status");
        String bossComment = payload.get("bossComment");
        String newStartTime = payload.get("startTime"); // For rescheduling

        // Update status (APPROVED / REJECTED / RESCHEDULED — boss can re-edit freely)
        if (newStatus != null) apt.setStatus(newStatus);
        if (bossComment != null) apt.setBossComment(bossComment);

        // If rescheduling, update the start time
        if ("RESCHEDULED".equals(newStatus) && newStartTime != null && !newStartTime.isBlank()) {
            apt.setStartTime(LocalDateTime.parse(newStartTime));
        }

        // Boss has acted → mark bossRead; PA needs to see the update
        apt.setBossRead(true);
        apt.setPaRead(false);

        return ResponseEntity.ok(appointmentRepository.save(apt));
    }

    // ─── 5. Mark notifications as read for a given user role ─────────────────
    @PutMapping("/mark-read/{userId}")
    public ResponseEntity<Void> markRead(@PathVariable Long userId, @RequestParam String role) {
        List<Appointment> list = role.equals("BOSS")
                ? appointmentRepository.findByBossIdAndBossReadFalse(userId)
                : appointmentRepository.findByPaIdAndPaReadFalse(userId);

        list.forEach(a -> {
            if (role.equals("BOSS")) a.setBossRead(true);
            else a.setPaRead(true);
        });
        appointmentRepository.saveAll(list);
        return ResponseEntity.ok().build();
    }

    // ─── 6. Get appointments for a specific user (PA or Boss) ─────────────────
    @GetMapping("/user/{userId}")
    public List<Appointment> getByUser(@PathVariable Long userId) {
        return appointmentRepository.findAllByUser(userId);
    }

    // ─── 7. Unread notification count ─────────────────────────────────────────
    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@RequestParam Long userId, @RequestParam String role) {
        long count = role.equals("BOSS")
                ? appointmentRepository.countByBossIdAndBossReadFalse(userId)
                : appointmentRepository.countByPaIdAndPaReadFalse(userId);
        return Map.of("count", count);
    }
}