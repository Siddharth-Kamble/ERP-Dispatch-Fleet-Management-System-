//package onedeoleela.onedeoleela.Service.PA_BOSS;
//
//import onedeoleela.onedeoleela.Entity.PA_BOSS.Appointment;
//import onedeoleela.onedeoleela.Repository.PA_BOSS.AppointmentRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import java.util.List;
//
//@Service
//public class AppointmentService {
//
//    @Autowired
//    private AppointmentRepository appointmentRepository;
//
//    /**
//     * PA schedules an appointment.
//     * Logic: If a "Boss Available" slot exists for this time, AUTO-APPROVE.
//     */
//    public Appointment scheduleAppointment(Appointment request) {
//        // Check if boss already posted this time as available
//        List<Appointment> availability = appointmentRepository.findMatchingAvailability(
//                request.getStartTime(),
//                request.getEndTime()
//        );
//
//        if (!availability.isEmpty()) {
//            request.setStatus("APPROVED"); // Boss is free, direct approval
//            request.setBossRead(true);     // Boss doesn't need to approve, but might want to see it
//        } else {
//            request.setStatus("PENDING");  // Needs Boss intervention
//            request.setBossRead(false);    // Trigger notification for Boss
//        }
//
//        request.setPaRead(true);
//        return appointmentRepository.save(request);
//    }
//
//    /**
//     * Boss updates status (Approve/Refuse/Reschedule)
//     */
//    public Appointment updateStatus(Long id, String status, String comment) {
//        Appointment apt = appointmentRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Appointment not found"));
//
//        apt.setStatus(status);
//        apt.setBossComment(comment);
//
//        // When boss updates, PA needs to be notified
//        apt.setPaRead(false);
//        apt.setBossRead(true); // Boss has now seen/acted on it
//
//        return appointmentRepository.save(apt);
//    }
//
//    public List<Appointment> getUserAppointments(Long userId) {
//        // Mark all as read for the user when they view the list
//        List<Appointment> list = appointmentRepository.findAllByUser(userId);
//        list.forEach(a -> {
//            if(a.getBoss() != null && a.getBoss().getId().equals(userId)) a.setBossRead(true);
//            if(a.getPa() != null && a.getPa().getId().equals(userId)) a.setPaRead(true);
//        });
//        appointmentRepository.saveAll(list);
//        return list;
//    }
//}

package onedeoleela.onedeoleela.Service.PA_BOSS;

import onedeoleela.onedeoleela.Entity.PA_BOSS.Appointment;
import onedeoleela.onedeoleela.Repository.PA_BOSS.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    /**
     * PA creates a new appointment request.
     * - If a Boss "AVAILABLE" slot exists for this time → AUTO-APPROVE.
     * - Otherwise → PENDING (Boss must review).
     */
    public Appointment scheduleAppointment(Appointment request) {
        List<Appointment> availability = appointmentRepository.findMatchingAvailability(
                request.getStartTime(),
                request.getEndTime() != null ? request.getEndTime() : request.getStartTime().plusMinutes(30)
        );

        if (!availability.isEmpty()) {
            request.setStatus("APPROVED");
            request.setBossRead(true);
        } else {
            request.setStatus("PENDING");
            request.setBossRead(false); // Trigger Boss notification
        }

        request.setPaRead(true);
        return appointmentRepository.save(request);
    }

    /**
     * Boss updates status: APPROVED / REJECTED / RESCHEDULED.
     * Boss can re-call this at any time to change the status again.
     */
    public Appointment updateStatus(Long id, String status, String comment, LocalDateTime newTime) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + id));

        apt.setStatus(status);
        if (comment != null) apt.setBossComment(comment);

        // For rescheduling, update the startTime
        if ("RESCHEDULED".equals(status) && newTime != null) {
            apt.setStartTime(newTime);
        }

        // Boss has acted; PA needs notification
        apt.setBossRead(true);
        apt.setPaRead(false);

        return appointmentRepository.save(apt);
    }

    /**
     * Retrieve all appointments for a user, marking them as "read" for that user.
     */
    public List<Appointment> getUserAppointments(Long userId) {
        List<Appointment> list = appointmentRepository.findAllByUser(userId);
        list.forEach(a -> {
            if (a.getBoss() != null && a.getBoss().getId().equals(userId)) a.setBossRead(true);
            if (a.getPa()   != null && a.getPa().getId().equals(userId))   a.setPaRead(true);
        });
        appointmentRepository.saveAll(list);
        return list;
    }

    /**
     * Fetch upcoming approved/pending appointments.
     */
    public List<Appointment> getUpcoming() {
        return appointmentRepository.findUpcoming(LocalDateTime.now());
    }
}