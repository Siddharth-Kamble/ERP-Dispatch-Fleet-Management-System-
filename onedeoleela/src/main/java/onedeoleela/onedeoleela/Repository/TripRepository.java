package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.Trip;
import onedeoleela.onedeoleela.Entity.TripStatusEnum;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByDriverId(Long driverId);

    List<Trip> findByVehicleId(Long vehicleId);

    List<Trip> findAllByOrderByTripDateDesc();

    List<Trip> findByStatus(TripStatusEnum status);

    List<Trip> findByDriverECode(Integer driverECode);

    List<Trip> findByDriverECodeAndTripDateBetween(
            Integer driverECode,
            LocalDateTime start,
            LocalDateTime end
    );

    // Unique vehicle numbers for driver
    @Query("""
        SELECT DISTINCT t.vehicleNumber
        FROM Trip t
        WHERE t.driverECode = :eCode
    """)
    List<String> findUniqueVehicleNumbersByECode(@Param("eCode") Integer eCode);

    // Today's pending trips
    @Query("""
        SELECT t FROM Trip t
        WHERE t.driverECode = :eCode
        AND t.tripDate >= :startOfDay
        AND t.tripDate < :endOfDay
        AND t.id NOT IN (
            SELECT ts.trip.id FROM TripStatusUpdate ts
        )
    """)
    List<Trip> findTodayPendingTrips(
            @Param("eCode") Integer eCode,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    // Active vehicles
    @Query("""
        SELECT DISTINCT t.vehicleNumber
        FROM Trip t
        WHERE t.status <> :completedStatus
    """)
    List<String> findDistinctActiveVehicleNumbers(
            @Param("completedStatus") TripStatusEnum completedStatus
    );

    // Completed vehicles
    @Query("""
        SELECT DISTINCT t.vehicleNumber
        FROM Trip t
        WHERE t.status = :completedStatus
    """)
    List<String> findDistinctCompletedVehicleNumbers(
            @Param("completedStatus") TripStatusEnum completedStatus
    );



    @Query("SELECT t FROM Trip t WHERE " +
            "(:vNum IS NULL OR :vNum = '' OR t.vehicleNumber iLIKE %:vNum%) AND " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(CAST(:sDate AS date) IS NULL OR CAST(t.tripDate AS date) >= :sDate) AND " +
            "(CAST(:eDate AS date) IS NULL OR CAST(t.tripDate AS date) <= :eDate) " +
            "ORDER BY t.tripDate DESC") // 🔥 Newest entries at the top
    List<Trip> findWithFilters(
            @Param("vNum") String vNum,
            @Param("status") TripStatusEnum status,
            @Param("sDate") LocalDate sDate,
            @Param("eDate") LocalDate eDate,
            Pageable pageable // 🔥 This allows us to limit to 50
    );
}