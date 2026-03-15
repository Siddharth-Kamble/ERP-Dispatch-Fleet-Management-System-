package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "trip_cancellations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripCancellation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private Long tripId;

    // The unique vehicle number involved in the request
    private String vehicleNumber;

    // The Employee Code of the driver who rejected the trip
    private Long eCode;

    // Categorized reason (e.g., "Vehicle Issue", "Personal", "Shift End")
    private String reason;

    // Detailed explanation from the driver
    @Column(columnDefinition = "TEXT")
    private String remarks;

    // Timestamp of when the cancellation occurred
    private LocalDateTime cancelledAt = LocalDateTime.now();
}