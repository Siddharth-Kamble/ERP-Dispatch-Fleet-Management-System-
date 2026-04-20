package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;

    private String projectCode;
    private String projectName;
    private String projectType;
    private String description;

    private String clientName;
    private String clientContact;
    private String clientEmail;

    private String siteName;
    private String siteAddress;
    private String city;
    private String state;
    private String country;

    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private LocalDate actualEndDate;

    private String projectStatus;

    private Double estimatedCost;
    private Double contractValue;

    private String projectManager;
    private String siteEngineer;

    private Double totalAreaSqFt;
    private Integer numberOfFloors;

    @OneToMany(mappedBy = "project", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Tower> towers;
}