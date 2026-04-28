package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "planning_projects")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PlanningProject {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String projectName;

    @Column(unique = true)
    private String projectCode;        // e.g. ODL1054

    private String clientName;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime createdAt;
    private String createdBy;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}

