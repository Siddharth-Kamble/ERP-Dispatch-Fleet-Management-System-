package onedeoleela.onedeoleela.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "trip_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TripStatusUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    private String driverName;
    private Integer driverECode;
    private String vehicleNumber;

    @ElementCollection
    private List<String> routePoints;

    private String description;

    @Enumerated(EnumType.STRING)
    private TripStatusEnum status;

    private LocalDateTime assignedAt;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime loadingStartedAt;
    private LocalDateTime loadingCompletedAt;
    private LocalDateTime inTransitAt;
    private LocalDateTime reachedDestinationAt;
    private LocalDateTime unloadingStartedAt;
    private LocalDateTime unloadingCompletedAt;
    private LocalDateTime returnJourneyStartedAt;
    private LocalDateTime returnJourneyCompletedAt;
}