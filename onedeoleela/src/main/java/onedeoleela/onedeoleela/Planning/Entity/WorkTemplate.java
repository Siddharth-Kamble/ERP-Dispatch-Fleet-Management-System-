package onedeoleela.onedeoleela.Planning.Entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Getter
@Setter
@Table(name = "work_templates")
public class WorkTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

     @Column(nullable = false)
    private String templateName;

     @Column(columnDefinition = "TEXT")
    private String templateDescription;


    private String defaultWorkName;

     private String createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

     private Integer itemCount;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (itemCount == null) itemCount = 0;
    }

    @OneToMany(
            mappedBy     = "template",
            cascade      = CascadeType.ALL,
            orphanRemoval = true,
            fetch        = FetchType.LAZY
    )
    @OrderBy("srNo ASC")
    private List<TemplateLineItem> lineItems = new ArrayList<>();
}