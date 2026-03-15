package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String mobile;
    private String licenseNo;

    @Column(name = "e_code", nullable = false)
    private Integer eCode;

    @Column(name = "joining_date")
    private LocalDate joiningDate;
}
