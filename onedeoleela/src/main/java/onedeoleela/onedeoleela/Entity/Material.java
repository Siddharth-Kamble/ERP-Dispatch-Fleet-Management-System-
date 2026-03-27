package onedeoleela.onedeoleela.Entity;



import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String materialName;
    private Double quantity;

    @ManyToOne
    @JoinColumn(name = "project_record_id")
    private ProjectRecords projectRecord;
}