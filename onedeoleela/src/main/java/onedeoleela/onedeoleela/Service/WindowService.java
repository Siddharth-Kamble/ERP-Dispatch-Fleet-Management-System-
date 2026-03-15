package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.Flat;
import onedeoleela.onedeoleela.Entity.Trip;
import onedeoleela.onedeoleela.Entity.Window;

import onedeoleela.onedeoleela.Repository.FlatRepository;
import onedeoleela.onedeoleela.Repository.TripRepository;
import onedeoleela.onedeoleela.Repository.WindowRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WindowService {

    private final WindowRepository windowRepository;
    private final TripRepository tripRepository;
    private final FlatRepository flatRepository;

    public WindowService(WindowRepository windowRepository,
                         TripRepository tripRepository,
                         FlatRepository flatRepository) {
        this.windowRepository = windowRepository;
        this.tripRepository = tripRepository;
        this.flatRepository = flatRepository;
    }

    public Trip getTripDetails(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    public Window createWindow(Long tripId, Integer flatNumber, Window window) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        Flat flat = flatRepository.findByFlatNumber(flatNumber)
                .orElseThrow(() -> new RuntimeException("Flat not found"));

        window.setTrip(trip);
        window.setFlat(flat);
        window.setFlatNumber(flatNumber);   // added this line

        return windowRepository.save(window);
    }

    public List<Window> getWindowsByTrip(Long tripId) {
        return windowRepository.findByTrip_Id(tripId);
    }

    public List<Window> getAllWindows() {
        return windowRepository.findAll();
    }
}