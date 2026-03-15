package onedeoleela.onedeoleela.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import onedeoleela.onedeoleela.Entity.VehicleRequisition;
import onedeoleela.onedeoleela.Entity.RequisitionStatus;
import onedeoleela.onedeoleela.Entity.Trip;

import onedeoleela.onedeoleela.Repository.VehicleRequisitionRepository;
import onedeoleela.onedeoleela.Repository.TripRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class VehicleRequisitionService {

    @Autowired
    private VehicleRequisitionRepository repository;

    @Autowired
    private TripRepository tripRepository;

    // ================= CREATE REQUISITION =================
    public VehicleRequisition createRequisition(VehicleRequisition req) {

        req.setRequisitionNo(generateReqNo());

        if (req.getRequisitionDate() == null) {
            req.setRequisitionDate(LocalDate.now());
        }

        if (req.getRequisitionTime() == null) {
            req.setRequisitionTime(LocalTime.now());
        }

        if (req.getStatus() == null) {
            req.setStatus(RequisitionStatus.PENDING);
        }

        return repository.save(req);
    }

    // ================= GET ALL =================
    public List<VehicleRequisition> getAllRequisitions() {
        return repository.findAll();
    }

    // ================= GET PENDING REQUISITIONS =================
    public List<VehicleRequisition> getPendingRequisitions() {
        return repository.findByStatus(RequisitionStatus.PENDING);
    }

    // ================= UPDATE STATUS =================
    public VehicleRequisition updateStatus(Long id, RequisitionStatus status) {

        VehicleRequisition req = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Requisition not found"));

        req.setStatus(status);

        return repository.save(req);
    }

    // ================= AUTO ASSIGN REQUISITIONS TO TRIP =================
    public void autoAssignRequisitionsToTrip(Long tripId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        List<String> routePoints = trip.getPoints();

        List<VehicleRequisition> pendingRequisitions =
                repository.findByStatus(RequisitionStatus.PENDING);

        for (VehicleRequisition req : pendingRequisitions) {

            if (req.getLocationFrom() == null || req.getLocationTo() == null)
                continue;

            int fromIndex = routePoints.indexOf(req.getLocationFrom());
            int toIndex = routePoints.indexOf(req.getLocationTo());

            // check if requisition fits route
            if (fromIndex >= 0 && toIndex >= 0 && fromIndex < toIndex) {

                req.setTrip(trip);
                req.setStatus(RequisitionStatus.APPROVED);

                repository.save(req);
            }
        }
    }

    // ================= SMART ROUTE MATCH =================
    public boolean isOnTheWay(List<String> route, String from, String to) {

        int fromIndex = route.indexOf(from);
        int toIndex = route.indexOf(to);

        return fromIndex >= 0 && toIndex >= 0 && fromIndex < toIndex;
    }

    // ================= GENERATE REQUISITION NUMBER =================
    private String generateReqNo() {

        VehicleRequisition last =
                repository.findTopByOrderByIdDesc();

        int nextNumber = 1;

        if (last != null && last.getRequisitionNo() != null) {

            String[] parts = last.getRequisitionNo().split("-");

            nextNumber = Integer.parseInt(parts[2]) + 1;
        }

        int year = LocalDate.now().getYear();

        return String.format("VR-%d-%04d", year, nextNumber);
    }
}