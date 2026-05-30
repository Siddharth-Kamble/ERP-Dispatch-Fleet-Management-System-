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
@Table(name = "info_sheets")
public class InfoSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Linked to work order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    // Auto-filled from work order
    @Column(name = "project_name")
    private String projectName;

    @Column(name = "tower_name")
    private String towerName;

    // User inputs
    @Column(name = "flat_type")          // e.g. 1BHK, 2BHK, 3BHK, 4BHK
    private String flatType;

    @Column(name = "flat_no")
    private String flatNo;

    @Column(name = "sheet_date")
    private LocalDate date;

    @OneToMany(
            mappedBy     = "infoSheet",
            cascade      = CascadeType.ALL,
            orphanRemoval = true,
            fetch        = FetchType.EAGER
    )
    private List<InfoSheetItem> items = new ArrayList<>();
}