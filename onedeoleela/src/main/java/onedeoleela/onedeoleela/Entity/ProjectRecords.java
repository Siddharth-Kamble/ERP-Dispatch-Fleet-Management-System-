package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
public class ProjectRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project; // existing Project entity

    private Double sqft;
    private String jobCardNo;
    private String dcNo;
    private String remark;
    private String vehicleDriver;

    private LocalDate recordDate; // store actual date automatically
    private String dayOfWeek;

    @OneToMany(mappedBy = "projectRecord", cascade = CascadeType.ALL)
    private List<Material> materials;// store day automatically
}
