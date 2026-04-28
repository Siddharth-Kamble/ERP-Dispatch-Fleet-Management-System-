package onedeoleela.onedeoleela.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class PlanningLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_id", nullable = false)
    @JsonIgnore
    private PlanningWork work;

    @Column(name = "work_id", insertable = false, updatable = false)
    private Long workId;

    private Integer srNo;
    private String  lineItemName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String  department;
    private String  actionPerson;
    private String  status;       // NOT STARTED | IN PROGRESS | DONE | ON HOLD | CANCELLED
    private String  remark;

    /**
     * Comma-separated IDs of linked line items.
     * Example: "3,7,12"
     * When this item's date shifts >= 2 days, all linked items also shift.
     */
    private String linkedItemIds;
}