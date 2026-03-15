package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.VehicleActivity;
import onedeoleela.onedeoleela.Entity.VehicleStatus;
import onedeoleela.onedeoleela.Entity.Vehicle;
import onedeoleela.onedeoleela.Repository.VehicleActivityRepository;
import onedeoleela.onedeoleela.Repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VehicleActivityService {

    private final VehicleActivityRepository activityRepository;
    private final VehicleRepository vehicleRepository;

    public VehicleActivityService(VehicleActivityRepository activityRepository,
                                  VehicleRepository vehicleRepository) {
        this.activityRepository = activityRepository;
        this.vehicleRepository = vehicleRepository;
    }

    // -------- ADD ACTIVITY --------
    public VehicleActivity addActivity(Long vehicleId, VehicleActivity activity) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with id: " + vehicleId));

        activity.setVehicle(vehicle);

        if (activity.getInTime() == null) {
            activity.setInTime(LocalDateTime.now());
        }

        if (activity.getTimestamp() == null) {
            activity.setTimestamp(activity.getInTime());
        }

        return activityRepository.save(activity);
    }

    // -------- GET BY VEHICLE --------
    public List<VehicleActivity> getActivitiesByVehicle(Long vehicleId) {
        return activityRepository.findByVehicle_IdOrderByTimestampDesc(vehicleId);
    }

    // -------- GET TODAY ACTIVITY BY DRIVER --------
    public List<VehicleActivity> getTodayActivityByDriver(Integer driverECode) {

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        return activityRepository.findTodayByDriverECode(
                driverECode,
                startOfDay,
                endOfDay
        );
    }

    // -------- UPDATE ACTIVITY --------
    public VehicleActivity updateActivity(Long activityId, VehicleActivity updatedActivity) {

        VehicleActivity existingActivity = activityRepository.findById(activityId)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found with id: " + activityId));

        if (updatedActivity.getActivityType() != null)
            existingActivity.setActivityType(updatedActivity.getActivityType());

        if (updatedActivity.getDetails() != null)
            existingActivity.setDetails(updatedActivity.getDetails());

        if (updatedActivity.getLocation() != null)
            existingActivity.setLocation(updatedActivity.getLocation());

        if (updatedActivity.getDistance() != null)
            existingActivity.setDistance(updatedActivity.getDistance());

        if (updatedActivity.getLatitude() != null)
            existingActivity.setLatitude(updatedActivity.getLatitude());

        if (updatedActivity.getLongitude() != null)
            existingActivity.setLongitude(updatedActivity.getLongitude());

        if (updatedActivity.getSpeed() != null) {
            existingActivity.setSpeed(updatedActivity.getSpeed());
            existingActivity.setTrackingStatus(calculateStatus(updatedActivity.getSpeed()));
        }

        if (updatedActivity.getInTime() != null) {
            existingActivity.setInTime(updatedActivity.getInTime());
            existingActivity.setTimestamp(updatedActivity.getInTime());
        }

        if (updatedActivity.getOutTime() != null)
            existingActivity.setOutTime(updatedActivity.getOutTime());

        return activityRepository.save(existingActivity);
    }

    // -------- DELETE --------
    public void deleteActivity(Long activityId) {

        VehicleActivity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found with id: " + activityId));

        activityRepository.delete(activity);
    }

    // -------- LIVE GPS UPDATE --------
    public VehicleActivity updateVehicleLocation(
            Long vehicleId,
            Double latitude,
            Double longitude,
            Double speed
    ) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with id: " + vehicleId));

        VehicleActivity activity = new VehicleActivity();
        activity.setVehicle(vehicle);
        activity.setActivityType("GPS_UPDATE");
        activity.setLatitude(latitude);
        activity.setLongitude(longitude);
        activity.setSpeed(speed);
        activity.setTrackingStatus(calculateStatus(speed));
        activity.setInTime(LocalDateTime.now());
        activity.setTimestamp(LocalDateTime.now());

        return activityRepository.save(activity);
    }

    // -------- LIVE FLEET --------
    public List<VehicleActivity> getLiveFleetLocations() {
        return activityRepository.findLatestLocationForAllVehicles();
    }

    // -------- STATUS CALCULATION --------
    private VehicleStatus calculateStatus(Double speed) {

        if (speed == null || speed == 0)
            return VehicleStatus.STOPPED;

        if (speed > 5)
            return VehicleStatus.MOVING;

        return VehicleStatus.IDLE;
    }
}