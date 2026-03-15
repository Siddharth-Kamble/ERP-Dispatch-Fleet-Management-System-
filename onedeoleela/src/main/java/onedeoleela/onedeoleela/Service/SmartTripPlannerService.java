package onedeoleela.onedeoleela.Service;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.VehicleRequisition;
import onedeoleela.onedeoleela.Entity.RequisitionStatus;
import onedeoleela.onedeoleela.Repository.VehicleRequisitionRepository;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SmartTripPlannerService {

    private final VehicleRequisitionRepository requisitionRepository;

    private static final long TIME_WINDOW = 60;

    public List<List<VehicleRequisition>> generateSmartGroups() {

        List<VehicleRequisition> pending =
                requisitionRepository.findByStatusAndTripIsNull(RequisitionStatus.PENDING);

        List<List<VehicleRequisition>> groups = new ArrayList<>();

        for (VehicleRequisition req : pending) {

            // skip records without coordinates
            if (!hasCoordinates(req)) {
                continue;
            }

            boolean added = false;

            for (List<VehicleRequisition> group : groups) {

                VehicleRequisition base = group.get(0);

                if (isSameDirection(base, req)
                        && isTimeCompatible(base, req)
                        && isOnTheWay(base, req)) {

                    group.add(req);
                    added = true;
                    break;
                }
            }

            if (!added) {

                List<VehicleRequisition> newGroup = new ArrayList<>();
                newGroup.add(req);
                groups.add(newGroup);
            }
        }

        return groups;
    }

    // ---------------- CHECK COORDINATES ----------------

    private boolean hasCoordinates(VehicleRequisition r) {

        return r.getStartLat() != null &&
                r.getStartLng() != null &&
                r.getEndLat() != null &&
                r.getEndLng() != null;
    }

    // ---------------- TIME WINDOW ----------------

    private boolean isTimeCompatible(VehicleRequisition a, VehicleRequisition b) {

        LocalDateTime t1 =
                LocalDateTime.of(a.getRequisitionDate(), a.getRequisitionTime());

        LocalDateTime t2 =
                LocalDateTime.of(b.getRequisitionDate(), b.getRequisitionTime());

        long minutes =
                Math.abs(Duration.between(t1, t2).toMinutes());

        return minutes <= TIME_WINDOW;
    }

    // ---------------- ROUTE DIRECTION ----------------

    private boolean isSameDirection(VehicleRequisition a, VehicleRequisition b) {

        if (!hasCoordinates(a) || !hasCoordinates(b)) {
            return false;
        }

        double dLat1 = a.getEndLat() - a.getStartLat();
        double dLng1 = a.getEndLng() - a.getStartLng();

        double dLat2 = b.getEndLat() - b.getStartLat();
        double dLng2 = b.getEndLng() - b.getStartLng();

        return (dLat1 * dLat2 + dLng1 * dLng2) > 0;
    }

    // ---------------- DISTANCE CHECK ----------------

    private boolean isOnTheWay(VehicleRequisition a, VehicleRequisition b) {

        if (!hasCoordinates(a) || !hasCoordinates(b)) {
            return false;
        }

        double distance =
                haversine(
                        a.getStartLat(), a.getStartLng(),
                        b.getStartLat(), b.getStartLng()
                );

        return distance < 50; // within 50 km
    }

    // ---------------- HAVERSINE ----------------

    private double haversine(double lat1, double lon1, double lat2, double lon2) {

        final int R = 6371;

        double latDistance =
                Math.toRadians(lat2 - lat1);

        double lonDistance =
                Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                        + Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2)
                        * Math.sin(lonDistance / 2);

        double c =
                2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}