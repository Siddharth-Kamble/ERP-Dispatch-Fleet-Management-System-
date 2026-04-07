

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
    private Project project;

    private Double sqft;
    private String jobCardNo;
    private String dcNo;
    private String remark;

    private String vehicleDriver;

    private String driver; // ✅ added

    private LocalDate recordDate; // ✅ user enters this

    private String dayOfWeek; // ✅ auto-filled

    @OneToMany(mappedBy = "projectRecord", cascade = CascadeType.ALL)
    private List<Material> materials;

    // ✅ AUTO DAY LOGIC
    @PrePersist
    @PreUpdate
    public void setDayFromDate() {
        if (this.recordDate != null) {
            this.dayOfWeek = this.recordDate.getDayOfWeek().toString();
        }
    }
}