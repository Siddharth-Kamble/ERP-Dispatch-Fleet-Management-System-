package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trip_requisitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TripRequisition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;

    private Long requisitionId;

}