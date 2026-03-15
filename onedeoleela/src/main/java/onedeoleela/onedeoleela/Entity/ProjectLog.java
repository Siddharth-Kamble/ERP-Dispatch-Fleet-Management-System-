package onedeoleela.onedeoleela.Entity;



import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectName;

    private String dcNo;

    private String workOrderNumber;

    private String codeNo;

    private Long tripId;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist(){
        this.createdAt = LocalDateTime.now();
    }
}