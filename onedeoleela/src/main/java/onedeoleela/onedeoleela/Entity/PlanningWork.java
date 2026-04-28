package onedeoleela.onedeoleela.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
public class PlanningWork {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;

    // Expose projectId in JSON without full Project object
    @Column(name = "project_id", insertable = false, updatable = false)
    private Long projectId;

    private String workName;
    private String workOrderNo;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;

    @OneToMany(mappedBy = "work", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PlanningLineItem> lineItems;
}