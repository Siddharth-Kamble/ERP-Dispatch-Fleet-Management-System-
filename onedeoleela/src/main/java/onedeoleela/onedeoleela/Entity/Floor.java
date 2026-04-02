package onedeoleela.onedeoleela.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class Floor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long floorId;

    private Integer floorNumber;

    private Integer totalFlats;



    @OneToMany(mappedBy = "floor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Flat> flats;




    @ManyToOne
    @JoinColumn(name = "tower_id")
    @JsonIgnore
    private Tower tower;
}