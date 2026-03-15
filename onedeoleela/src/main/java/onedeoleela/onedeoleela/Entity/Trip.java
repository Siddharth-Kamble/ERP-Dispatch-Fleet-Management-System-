package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long vehicleId;

    private Long driverId;

    private String vehicleNumber;

    private String driverName;

    @Column(name = "driverecode")
    private Integer driverECode;

    @Enumerated(EnumType.STRING)
    private TripStatusEnum status;


    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "trip_points", joinColumns = @JoinColumn(name = "trip_id"))
    @Column(name = "point")
    private List<String> points;

    @Column(name = "trip_date", nullable = false)
    private LocalDateTime tripDate;

    // ✅ AUTO SET BEFORE INSERT
    @PrePersist
    public void prePersist() {
        if (this.tripDate == null) {
            this.tripDate = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = TripStatusEnum.ASSIGNED;
        }
    }
}