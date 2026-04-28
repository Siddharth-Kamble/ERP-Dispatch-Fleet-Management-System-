
package onedeoleela.onedeoleela.Dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PlanningLineItemRequest {
    private Long        workId;         // links to PlanningWork.id
    private Integer     srNo;
    private String      lineItemName;
    private LocalDate   startDate;
    private LocalDate   endDate;
    private String      department;
    private String      actionPerson;
    private String      status;
    private String      remark;
    private List<Long>  linkedItemIds;  // IDs of other line items to cascade
}
