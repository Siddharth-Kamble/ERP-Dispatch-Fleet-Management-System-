package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "driver_breaks")
public class DriverBreakActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Column(name = "break_start", nullable = false)
    private LocalDateTime breakStart;

    @Column(name = "break_end")
    private LocalDateTime breakEnd;

    @Column(name = "reason")
    private String reason; // ✅ Reason for the break

    @PrePersist
    protected void onCreate() {
        if (breakStart == null) {
            this.breakStart = LocalDateTime.now();
        }
    }
}