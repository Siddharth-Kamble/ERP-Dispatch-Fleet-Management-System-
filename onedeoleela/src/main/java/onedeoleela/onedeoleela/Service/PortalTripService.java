package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.PortalTrip;
import onedeoleela.onedeoleela.Repository.PortalTripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Optional;

@Service
public class PortalTripService {

    @Autowired
    private PortalTripRepository portalTripRepository;

    // Save Trip
    public PortalTrip saveTrip(PortalTrip portalTrip) {
        return portalTripRepository.save(portalTrip);
    }

    // Get All Trips
    public List<PortalTrip> getAllTrips() {
        return portalTripRepository.findAll();
    }

    // Get Trip By ID
    public Optional<PortalTrip> getTripById(Long id) {
        return portalTripRepository.findById(id);
    }

    // Delete Trip
    public void deleteTrip(Long id) {
        portalTripRepository.deleteById(id);
    }
    public List<PortalTrip> getTripsByVehicleNumber(String vehicleNumber) {
        return portalTripRepository.findByVehicleNumber(vehicleNumber);
    }
}