package onedeoleela.onedeoleela.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "windows")
public class Window {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long windowId;

    private String windowSeriesNumber;

    private String location;

    @JsonProperty("wCodeNo")
    private String wCodeNo;

    private String jobCardNo;

    private String series;

    private String description;

    private Double width;

    private Double height;

    private Integer trackOuter;

    private Integer bottomFix;

    private Integer glassShutter;

    private Integer meshShutter;

    private Integer units;

    private Double sqft;

    private String remark;

    private Integer floor;

    private Integer flatNumber;   // added flat number column in windows table

    @ManyToOne
    @JoinColumn(name = "flat_id")
    private Flat flat;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;
}