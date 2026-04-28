//package onedeoleela.onedeoleela.Repository.PA_BOSS;
//
//import onedeoleela.onedeoleela.Entity.PA_BOSS.Appointment;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.stereotype.Repository;
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Repository
//public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
//
//    // Find overlapping availability set by the boss
//    @Query("SELECT a FROM Appointment a WHERE a.status = 'AVAILABLE' " +
//            "AND a.startTime <= :requestedStart AND a.endTime >= :requestedEnd")
//    List<Appointment> findMatchingAvailability(LocalDateTime requestedStart, LocalDateTime requestedEnd);
//
//    // Fetch appointments for a specific user (Boss or PA)
//    @Query("SELECT a FROM Appointment a WHERE a.boss.id = :userId OR a.pa.id = :userId ORDER BY a.startTime DESC")
//    List<Appointment> findAllByUser(Long userId);
//
//    // Notification counts
//    List<Appointment> findByBossIdAndBossReadFalse(Long bossId);
//
//    // For the PA: Find all appointments where the PA hasn't seen the update
//    List<Appointment> findByPaIdAndPaReadFalse(Long paId);
//
//    // Count methods for the notification badges
//    long countByBossIdAndBossReadFalse(Long bossId);
//    long countByPaIdAndPaReadFalse(Long paId);
//
//    // Get all appointments involving a specific Boss (for the history table)
//    List<Appointment> findByBossIdOrderByStartTimeDesc(Long bossId);
//
//    // Get all for a specific PA
//    List<Appointment> findByPaIdOrderByStartTimeDesc(Long paId);
//}

package onedeoleela.onedeoleela.Repository.PA_BOSS;

import onedeoleela.onedeoleela.Entity.PA_BOSS.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Find overlapping availability set by the boss
    @Query("SELECT a FROM Appointment a WHERE a.status = 'AVAILABLE' " +
            "AND a.startTime <= :requestedStart AND a.endTime >= :requestedEnd")
    List<Appointment> findMatchingAvailability(LocalDateTime requestedStart, LocalDateTime requestedEnd);

    // All appointments for a specific user (Boss or PA)
    @Query("SELECT a FROM Appointment a WHERE a.boss.id = :userId OR a.pa.id = :userId ORDER BY a.startTime DESC")
    List<Appointment> findAllByUser(Long userId);

    // Unread notifications for Boss
    List<Appointment> findByBossIdAndBossReadFalse(Long bossId);

    // Unread notifications for PA
    List<Appointment> findByPaIdAndPaReadFalse(Long paId);

    // Unread counts for notification badges
    long countByBossIdAndBossReadFalse(Long bossId);
    long countByPaIdAndPaReadFalse(Long paId);

    // Full history for Boss
    List<Appointment> findByBossIdOrderByStartTimeDesc(Long bossId);

    // Full history for PA
    List<Appointment> findByPaIdOrderByStartTimeDesc(Long paId);

    // Upcoming approved/pending appointments after a given time
    @Query("SELECT a FROM Appointment a WHERE (a.status = 'APPROVED' OR a.status = 'PENDING') " +
            "AND a.startTime > :now ORDER BY a.startTime ASC")
    List<Appointment> findUpcoming(LocalDateTime now);
}