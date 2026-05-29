

package onedeoleela.onedeoleela.Coordinator.Entity;

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
@Entity
@Table(name = "work_orders")
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "work_order_no", nullable = false, unique = true)
    private String workOrderNo;

    @Column(name = "project_name", nullable = false)
    private String projectName;

    // ── NEW FIELD ─────────────────────────────────────────────────────────────
    @Column(name = "tower_name")
    private String towerName;

    @Column(name = "wo_date")
    private LocalDate date;

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<WorkOrderItem> items = new ArrayList<>();
}