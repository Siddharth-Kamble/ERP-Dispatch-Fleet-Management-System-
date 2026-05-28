package onedeoleela.onedeoleela.Planning.Entity;



import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
        import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "template_line_items")
public class TemplateLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    @JsonIgnore
    private WorkTemplate template;

     private Integer srNo;

    private String lineItemName;
    private String department;
    private String actionPerson;


    private String defaultStatus;

    private String remark;


    private String linkedItemIds;
}