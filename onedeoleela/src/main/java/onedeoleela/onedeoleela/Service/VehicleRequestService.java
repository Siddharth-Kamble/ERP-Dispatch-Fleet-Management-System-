package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.VehicleRequest;
import onedeoleela.onedeoleela.Entity.VehicleRequest.RequestStatus;
import onedeoleela.onedeoleela.Repository.VehicleRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class VehicleRequestService {

    private final VehicleRequestRepository repo;

    public VehicleRequestService(VehicleRequestRepository repo) {
        this.repo = repo;
    }

    // ── CREATE ────────────────────────────────────────────────────────────

    public VehicleRequest createRequest(VehicleRequest request) {
        request.setStatus(RequestStatus.PENDING);
        request.setNotifyDispatcher(true);   // dispatcher gets notified
        request.setNotifyRequester(false);
        return repo.save(request);
    }

    // ── GET ALL (dispatcher sees everything) ──────────────────────────────

    public List<VehicleRequest> getAllRequests() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    // ── GET BY REQUESTER ──────────────────────────────────────────────────

    public List<VehicleRequest> getRequestsByRequester(String eCode) {
        return repo.findByRequesterECodeOrderByCreatedAtDesc(eCode);
    }

    // ── GET BY DEPARTMENT ─────────────────────────────────────────────────

    public List<VehicleRequest> getRequestsByDepartment(String department) {
        return repo.findByDepartmentOrderByCreatedAtDesc(department);
    }

    // ── DISPATCHER: SCHEDULE a vehicle for a request ──────────────────────

    public VehicleRequest scheduleRequest(Long id,
                                          String vehicleNumber,
                                          String driverName,
                                          LocalDate scheduledDate,
                                          LocalTime scheduledTime,
                                          String note) {
        VehicleRequest req = getById(id);
        req.setAssignedVehicleNumber(vehicleNumber);
        req.setAssignedDriverName(driverName);
        req.setScheduledDate(scheduledDate);
        req.setScheduledTime(scheduledTime);
        req.setDispatcherNote(note);
        req.setStatus(RequestStatus.SCHEDULED);
        req.setNotifyRequester(true);    // requester gets notified
        req.setNotifyDispatcher(false);
        return repo.save(req);
    }

    // ── REQUESTER: ACCEPT the scheduled time ─────────────────────────────

    public VehicleRequest acceptSchedule(Long id) {
        VehicleRequest req = getById(id);
        req.setStatus(RequestStatus.ACCEPTED);
        req.setNotifyDispatcher(true);   // dispatcher gets notified
        req.setNotifyRequester(false);
        return repo.save(req);
    }

    // ── REQUESTER: REJECT and propose new time ────────────────────────────

    public VehicleRequest rejectAndPropose(Long id,
                                           String rejectionReason,
                                           LocalDate proposedDate,
                                           LocalTime proposedTime) {
        VehicleRequest req = getById(id);
        req.setRequesterRejectionReason(rejectionReason);
        req.setRequesterProposedDate(proposedDate);
        req.setRequesterProposedTime(proposedTime);
        req.setStatus(RequestStatus.REJECTED_BY_USER);
        req.setNotifyDispatcher(true);   // dispatcher gets notified
        req.setNotifyRequester(false);
        return repo.save(req);
    }

    // ── DISPATCHER: RESCHEDULE after user rejection ───────────────────────

    public VehicleRequest reschedule(Long id,
                                     String vehicleNumber,
                                     String driverName,
                                     LocalDate newDate,
                                     LocalTime newTime,
                                     String note) {
        VehicleRequest req = getById(id);
        req.setAssignedVehicleNumber(vehicleNumber);
        req.setAssignedDriverName(driverName);
        req.setScheduledDate(newDate);
        req.setScheduledTime(newTime);
        req.setDispatcherNote(note);
        req.setStatus(RequestStatus.RESCHEDULED);
        req.setNotifyRequester(true);
        req.setNotifyDispatcher(false);
        return repo.save(req);
    }

    // ── COMPLETE ──────────────────────────────────────────────────────────

    public VehicleRequest completeRequest(Long id) {
        VehicleRequest req = getById(id);
        req.setStatus(RequestStatus.COMPLETED);
        req.setNotifyRequester(true);
        req.setNotifyDispatcher(false);
        return repo.save(req);
    }

    // ── CANCEL ────────────────────────────────────────────────────────────

    public VehicleRequest cancelRequest(Long id) {
        VehicleRequest req = getById(id);
        req.setStatus(RequestStatus.CANCELLED);
        req.setNotifyRequester(true);
        req.setNotifyDispatcher(true);
        return repo.save(req);
    }

    // ── CLEAR NOTIFICATION for dispatcher ────────────────────────────────

    public void markDispatcherNotificationsRead() {
        List<VehicleRequest> unread = repo.findByNotifyDispatcherTrue();
        unread.forEach(r -> r.setNotifyDispatcher(false));
        repo.saveAll(unread);
    }

    // ── CLEAR NOTIFICATION for requester ─────────────────────────────────

    public void markRequesterNotificationsRead(String eCode) {
        List<VehicleRequest> unread = repo.findByRequesterECodeAndNotifyRequesterTrue(eCode);
        unread.forEach(r -> r.setNotifyRequester(false));
        repo.saveAll(unread);
    }

    // ── NOTIFICATION COUNTS ───────────────────────────────────────────────

    public long getDispatcherUnreadCount() {
        return repo.countByNotifyDispatcherTrue();
    }

    public long getRequesterUnreadCount(String eCode) {
        return repo.countByRequesterECodeAndNotifyRequesterTrue(eCode);
    }

    // ── INTERNAL ──────────────────────────────────────────────────────────

    private VehicleRequest getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("VehicleRequest not found: " + id));
    }
}