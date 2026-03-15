package onedeoleela.onedeoleela.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_activity_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VehicleActivityImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_id", nullable = false)
    private Long tripId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TripStatusEnum status;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "image_data", nullable = false)
    @JdbcTypeCode(java.sql.Types.VARBINARY) // 🔥 This forces Postgres to use 'bytea'
    @Basic(fetch = FetchType.EAGER)
    @JsonIgnore
    private byte[] imageData;
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }
}