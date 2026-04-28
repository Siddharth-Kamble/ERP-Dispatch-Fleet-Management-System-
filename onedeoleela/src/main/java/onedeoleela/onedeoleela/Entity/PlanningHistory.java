package onedeoleela.onedeoleela.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "planning_history")
public class PlanningHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_id")
    @JsonIgnore
    private PlanningWork work;

    // ── Denormalized — history stays readable even if items are later deleted ──
    private Long   lineItemId;
    private String lineItemName;
    private String workName;
    private String projectName;
    private String projectCode;

    // ── What changed ──────────────────────────────────────────────────────────
    // field values: "startDate" | "endDate" | "status" | "lineItemName"
    //               | "department" | "actionPerson" | "remark" | "srNo" | "general"
    private String field;
    private String oldValue;
    private String newValue;

    // ── Why & who ─────────────────────────────────────────────────────────────
    private String reason;
    private String changedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime changedAt;

    // ── Cascade info ──────────────────────────────────────────────────────────
    private String cascadedItemNames;   // comma-separated names of items that also shifted
}