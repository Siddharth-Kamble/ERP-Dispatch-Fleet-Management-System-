package onedeoleela.onedeoleela.Coordinator.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)

@Entity
@Table(name = "tracker_sheets")
public class TrackerSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // Linked to work order — one tracker sheet per WO
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private WorkOrder workOrder;

    // Auto-filled from WO
    @Column(name = "project_name")
    private String projectName;

    @Column(name = "tower_name")
    private String towerName;

    @Column(name = "sheet_date")
    private LocalDate date;

    @OneToMany(
            mappedBy      = "trackerSheet",
            cascade       = CascadeType.ALL,
            orphanRemoval = true,
            fetch         = FetchType.EAGER
    )
    @OrderBy("srNo ASC")
    private List<TrackerSheetRow> rows = new ArrayList<>();
}