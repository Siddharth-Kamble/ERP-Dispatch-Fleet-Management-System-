//package onedeoleela.onedeoleela.Coordinator.Entity;
//
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import jakarta.persistence.*;
//import lombok.*;
//
//import java.math.BigDecimal;
//
//@Data
//@Getter
//@Setter
//@AllArgsConstructor
//@NoArgsConstructor
//@Entity
//@Table(name = "info_sheet_items")
//public class InfoSheetItem {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "info_sheet_id", nullable = false)
//    @JsonIgnore
//    private InfoSheet infoSheet;
//
//    @Column(name = "sr_no")
//    private String srNo;
//
//    @Column(name = "location")
//    private String location;
//
//    @Column(name = "window_code")
//    private String windowCode;
//
//    @Column(name = "typology")
//    private String typology;
//
//    @Column(name = "series")
//    private String series;
//
//    @Column(name = "length", precision = 10, scale = 4)
//    private BigDecimal length;
//
//    @Column(name = "height", precision = 10, scale = 4)
//    private BigDecimal height;
//
//    @Column(name = "sqft", precision = 12, scale = 4)
//    private BigDecimal sqft;
//}

package onedeoleela.onedeoleela.Coordinator.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "info_sheet_items")
public class InfoSheetItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flat_id", nullable = false)
    @JsonIgnore
    private InfoSheetFlat flat;

    @Column(name = "sr_no")
    private String srNo;

    @Column(name = "location")
    private String location;

    @Column(name = "window_code")
    private String windowCode;

    @Column(name = "typology")
    private String typology;

    @Column(name = "series")
    private String series;

    @Column(name = "length",   precision = 10, scale = 4)
    private BigDecimal length;

    @Column(name = "height",   precision = 10, scale = 4)
    private BigDecimal height;

    @Column(name = "sqft",     precision = 12, scale = 4)
    private BigDecimal sqft;
}
