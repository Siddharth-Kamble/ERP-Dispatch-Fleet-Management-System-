package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Flat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long flatId;

    private Integer flatNumber;

    @ManyToOne
    @JoinColumn(name = "floor_id")
    private Floor floor;
}