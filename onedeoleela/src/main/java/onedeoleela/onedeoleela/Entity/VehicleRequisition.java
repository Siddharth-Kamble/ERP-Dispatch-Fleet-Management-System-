package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "vehicle_requisitions")
public class VehicleRequisition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requisition_no", unique = true, nullable = false)
    private String requisitionNo;

    @Column(name = "requisition_by", nullable = false)
    private String requisitionBy;

    @Column(name = "requisition_date")
    private LocalDate requisitionDate;

    @Column(name = "requisition_time")
    private LocalTime requisitionTime;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "location_from")
    private String locationFrom;

    @Column(name = "location_to")
    private String locationTo;

    /* ===== NEW LAT LNG ===== */

    @Column(name = "start_lat")
    private Double startLat;

    @Column(name = "start_lng")
    private Double startLng;

    @Column(name = "end_lat")
    private Double endLat;

    @Column(name = "end_lng")
    private Double endLng;

    @Column(name = "department")
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RequisitionStatus status = RequisitionStatus.PENDING;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "file_id")
    private Long fileId;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;

    /* ===== GETTERS SETTERS ===== */

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getRequisitionNo() { return requisitionNo; }

    public void setRequisitionNo(String requisitionNo) { this.requisitionNo = requisitionNo; }

    public String getRequisitionBy() { return requisitionBy; }

    public void setRequisitionBy(String requisitionBy) { this.requisitionBy = requisitionBy; }

    public LocalDate getRequisitionDate() { return requisitionDate; }

    public void setRequisitionDate(LocalDate requisitionDate) { this.requisitionDate = requisitionDate; }

    public LocalTime getRequisitionTime() { return requisitionTime; }

    public void setRequisitionTime(LocalTime requisitionTime) { this.requisitionTime = requisitionTime; }

    public String getProjectName() { return projectName; }

    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getLocationFrom() { return locationFrom; }

    public void setLocationFrom(String locationFrom) { this.locationFrom = locationFrom; }

    public String getLocationTo() { return locationTo; }

    public void setLocationTo(String locationTo) { this.locationTo = locationTo; }

    public Double getStartLat() { return startLat; }

    public void setStartLat(Double startLat) { this.startLat = startLat; }

    public Double getStartLng() { return startLng; }

    public void setStartLng(Double startLng) { this.startLng = startLng; }

    public Double getEndLat() { return endLat; }

    public void setEndLat(Double endLat) { this.endLat = endLat; }

    public Double getEndLng() { return endLng; }

    public void setEndLng(Double endLng) { this.endLng = endLng; }

    public String getDepartment() { return department; }

    public void setDepartment(String department) { this.department = department; }

    public RequisitionStatus getStatus() { return status; }

    public void setStatus(RequisitionStatus status) { this.status = status; }

    public Long getCreatedBy() { return createdBy; }

    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getFileId() { return fileId; }

    public void setFileId(Long fileId) { this.fileId = fileId; }

    public Trip getTrip() { return trip; }

    public void setTrip(Trip trip) { this.trip = trip; }
}