package onedeoleela.onedeoleela.Coordinator.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "info_sheet_flats")
public class InfoSheetFlat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "info_sheet_id", nullable = false)
    @JsonIgnore
    private InfoSheet infoSheet;

    // e.g. 1BHK, 2BHK, 3BHK, 4BHK
    @Column(name = "flat_type")
    private String flatType;

    // e.g. 101, A-202
    @Column(name = "flat_no")
    private String flatNo;

    @OneToMany(
            mappedBy      = "flat",
            cascade       = CascadeType.ALL,
            orphanRemoval = true,
            fetch         = FetchType.EAGER
    )
    @OrderBy("id ASC")
    private List<InfoSheetItem> items = new ArrayList<>();
}
