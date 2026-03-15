package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "vehicle_activity") // ✅ match DB
public class VehicleActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private String activityType;

    private String details;
    private String location;
    private Double distance;

    // ---------------- GPS Tracking Fields ----------------
    private Double latitude;
    private Double longitude;
    private Double speed; // km/h

    @Enumerated(EnumType.STRING)
    private VehicleStatus trackingStatus;
    // MOVING, IDLE, STOPPED
    // -----------------------------------------------------

    @Column(nullable = false)
    private LocalDateTime inTime;

    private LocalDateTime outTime;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = inTime;
        }
    }
}
