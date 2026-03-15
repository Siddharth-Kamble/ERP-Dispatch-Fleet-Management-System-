    package onedeoleela.onedeoleela.Service;

    import lombok.RequiredArgsConstructor;
    import onedeoleela.onedeoleela.Entity.DriverBreakActivity;
    import onedeoleela.onedeoleela.Repository.DriverBreakActivityRepository;
    import org.springframework.stereotype.Service;

    import java.time.Duration;
    import java.time.LocalDateTime;
    import java.util.List;

    @Service
    @RequiredArgsConstructor
    public class DriverBreakActivityService {

        private final DriverBreakActivityRepository breakRepository;

        // Start break with optional reason
        public DriverBreakActivity startBreak(Long tripId, String reason) {
            DriverBreakActivity breakActivity = new DriverBreakActivity();
            breakActivity.setTripId(tripId);
            breakActivity.setBreakStart(LocalDateTime.now());
            breakActivity.setReason(reason); // set reason
            return breakRepository.save(breakActivity);
        }

        // End the last break for a trip
        public DriverBreakActivity endBreak(Long tripId) {
            List<DriverBreakActivity> breaks = breakRepository.findByTripId(tripId);
            if (breaks.isEmpty()) {
                throw new RuntimeException("No break found for Trip ID: " + tripId);
            }
            // Find the last break without end time
            DriverBreakActivity lastBreak = breaks.stream()
                    .filter(b -> b.getBreakEnd() == null)
                    .reduce((first, second) -> second)
                    .orElseThrow(() -> new RuntimeException("All breaks already ended for Trip ID: " + tripId));

            lastBreak.setBreakEnd(LocalDateTime.now());
            return breakRepository.save(lastBreak);
        }

        // Get total break time in minutes
        public long getTotalBreakMinutes(Long tripId) {
            List<DriverBreakActivity> breaks = breakRepository.findByTripId(tripId);
            return breaks.stream()
                    .filter(b -> b.getBreakEnd() != null)
                    .mapToLong(b -> Duration.between(b.getBreakStart(), b.getBreakEnd()).toMinutes())
                    .sum();
        }
        public List<DriverBreakActivity> getBreaksByTrip(Long tripId) {
            return breakRepository.findByTripIdOrderByBreakStartAsc(tripId);
        }
    }