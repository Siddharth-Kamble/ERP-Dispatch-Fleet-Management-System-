package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.DailyProgressReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyProgressReportRepository
        extends JpaRepository<DailyProgressReport, Long> {

    /**
     * Fetch all rows for a specific report date, ordered exactly as they
     * appear in the printed report: by SR.NO first, then TRIP number.
     */
    List<DailyProgressReport> findByReportDateOrderBySrNoAscTripNumberAsc(LocalDate reportDate);

    /**
     * Fetch rows for a date range (useful for multi-day summaries).
     */
    List<DailyProgressReport> findByReportDateBetweenOrderByReportDateAscSrNoAscTripNumberAsc(
            LocalDate from, LocalDate to);

    /**
     * Fetch all trips assigned to a specific driver on a given date.
     */
    List<DailyProgressReport> findByReportDateAndDriverNameIgnoreCaseOrderBySrNoAscTripNumberAsc(
            LocalDate reportDate, String driverName);

    /**
     * Fetch all trips for a specific vehicle on a given date.
     */
    List<DailyProgressReport> findByReportDateAndVehicleNumberIgnoreCaseOrderBySrNoAscTripNumberAsc(
            LocalDate reportDate, String vehicleNumber);

    /**
     * Count achieved trips for a date — useful for the summary footer.
     */
    @Query("""
            SELECT COUNT(r) FROM DailyProgressReport r
            WHERE r.reportDate = :date
              AND r.targetAchieve = 'ACHIEVE'
            """)
    long countAchievedByDate(@Param("date") LocalDate date);

    /**
     * Count total trips (rows with a description) for a date.
     */
    @Query("""
            SELECT COUNT(r) FROM DailyProgressReport r
            WHERE r.reportDate = :date
              AND r.description IS NOT NULL
              AND r.description <> ''
            """)
    long countTripsByDate(@Param("date") LocalDate date);

    /**
     * Fetch distinct report dates available in the database, newest first.
     */
    @Query("SELECT DISTINCT r.reportDate FROM DailyProgressReport r ORDER BY r.reportDate DESC")
    List<LocalDate> findDistinctReportDates();
}