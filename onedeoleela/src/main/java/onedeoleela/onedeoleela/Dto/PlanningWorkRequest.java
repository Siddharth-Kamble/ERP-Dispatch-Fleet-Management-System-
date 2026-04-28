package onedeoleela.onedeoleela.Dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PlanningWorkRequest {
    private Long   projectId;       // links to your Project.projectId
    private String workName;
    private String workOrderNo;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
}