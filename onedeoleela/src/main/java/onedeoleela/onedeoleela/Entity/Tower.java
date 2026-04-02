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
public class Tower {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long towerId;

    private String towerName; // e.g., A, B, C

    private Integer totalFloors;

    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonIgnore
    private Project project;

    @OneToMany(mappedBy = "tower", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Floor> floors;

    @JsonProperty("projectId")
    public Long getProjectId() {
        return project != null ? project.getProjectId() : null;
    }




}