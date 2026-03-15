package onedeoleela.onedeoleela.Service;


import onedeoleela.onedeoleela.Entity.VehicleActivityTrack;
import onedeoleela.onedeoleela.Repository.VehicleActivityTrackRepository;
import onedeoleela.onedeoleela.Repository.TripRepository;
import onedeoleela.onedeoleela.Entity.Trip;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleActivityTrackService {

    private final VehicleActivityTrackRepository trackRepository;
    private final TripRepository tripRepository;

    public VehicleActivityTrackService(VehicleActivityTrackRepository trackRepository,
                                       TripRepository tripRepository) {
        this.trackRepository = trackRepository;
        this.tripRepository = tripRepository;
    }

    // Fetch all trips for live tracking
    public List<Trip> getAllActiveTrips() {
        return tripRepository.findAll(); // Optionally filter by status
    }

    // Fetch vehicle activity history for a trip
    public List<VehicleActivityTrack> getTripHistory(Long tripId) {
        return trackRepository.findByTripIdOrderByEventTimeAsc(tripId);
    }
}