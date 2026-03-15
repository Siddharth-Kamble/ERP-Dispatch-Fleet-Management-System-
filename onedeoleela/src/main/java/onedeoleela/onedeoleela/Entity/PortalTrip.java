package onedeoleela.onedeoleela.Entity;



import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "portal_trip")
public class PortalTrip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String crnNumber;
    private String pickupLocation;
    private String dropLocation;
    private Double fare;
    private String status;
    private String vehicleNumber;
    private String driverName;
    private LocalDate tripDate;

    @Column(name = "photo", columnDefinition = "bytea")
    @JdbcTypeCode(java.sql.Types.VARBINARY) // 🔥 This forces Postgres to use 'bytea'
    @Basic(fetch = FetchType.EAGER)
    @Lob
    private byte[] photo;

}