package onedeoleela.onedeoleela.Entity;



import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "vehicle_requests")
@Data
public class VehicleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Who is requesting ──────────────────────────────────────────────────
    @Column(nullable = false)
    private String requesterECode;

    @Column(nullable = false)
    private String requesterName;

    @Column(nullable = false)
    private String department;

    // ── Request details ────────────────────────────────────────────────────
    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private LocalDate requestedDate;

    @Column(nullable = false)
    private LocalTime requestedTime;

    @Column(nullable = false)
    private String destination;

    private String numberOfPassengers;

    // ── Priority ───────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(length = 500)
    private String priorityNote;

    // ── Dispatcher scheduling ──────────────────────────────────────────────
    private String assignedVehicleNumber;
    private String assignedDriverName;
    private LocalDate scheduledDate;
    private LocalTime scheduledTime;

    @Column(length = 500)
    private String dispatcherNote;

    // ── Requester counter-proposal ─────────────────────────────────────────
    private LocalDate requesterProposedDate;
    private LocalTime requesterProposedTime;

    @Column(length = 500)
    private String requesterRejectionReason;

    // ── Status ────────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    // ── Unread notification flags ──────────────────────────────────────────
    private boolean notifyRequester = false;
    private boolean notifyDispatcher = false;

    // ── Audit ──────────────────────────────────────────────────────────────
    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = RequestStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Priority {
        URGENT, HIGH, NORMAL, LOW, SCHEDULED
    }

    public enum RequestStatus {
        PENDING,
        SCHEDULED,
        ACCEPTED,
        REJECTED_BY_USER,
        RESCHEDULED,
        COMPLETED,
        CANCELLED
    }
}
