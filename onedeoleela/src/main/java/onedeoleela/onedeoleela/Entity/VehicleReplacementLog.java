package onedeoleela.onedeoleela.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_replacement_log")
public class VehicleReplacementLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_id")
    private Long tripId;

    @Column(name = "old_vehicle_number")
    private String oldVehicleNumber;

    @Column(name = "new_vehicle_number")
    private String newVehicleNumber;

    private String reason;

    @Column(name = "changed_by")
    private String changedBy;

    @Column(name = "changed_at")
    private LocalDateTime changedAt = LocalDateTime.now();

    // ===== GETTERS & SETTERS =====

    public Long getId() {
        return id;
    }

    public Long getTripId() {
        return tripId;
    }

    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }

    public String getOldVehicleNumber() {
        return oldVehicleNumber;
    }

    public void setOldVehicleNumber(String oldVehicleNumber) {
        this.oldVehicleNumber = oldVehicleNumber;
    }

    public String getNewVehicleNumber() {
        return newVehicleNumber;
    }

    public void setNewVehicleNumber(String newVehicleNumber) {
        this.newVehicleNumber = newVehicleNumber;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}