package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.PortalTrip;
import onedeoleela.onedeoleela.Service.PortalTripService;


import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/portaltrip")
public class PortalTripController {


    private final PortalTripService portalTripService;

    public PortalTripController(PortalTripService portalTripService) {
        this.portalTripService = portalTripService;
    }

@PostMapping(value = "/save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public PortalTrip saveTrip(
        @RequestParam String crnNumber,
        @RequestParam String pickupLocation,
        @RequestParam String dropLocation,
        @RequestParam Double fare,
        @RequestParam String status,
        @RequestParam String vehicleNumber,
        @RequestParam String driverName,
        @RequestParam String tripDate,
        @RequestParam MultipartFile photo
) throws IOException {

    PortalTrip trip = new PortalTrip();

    trip.setCrnNumber(crnNumber);
    trip.setPickupLocation(pickupLocation);
    trip.setDropLocation(dropLocation);
    trip.setFare(fare);
    trip.setStatus(status);
    trip.setVehicleNumber(vehicleNumber);
    trip.setDriverName(driverName);

    trip.setTripDate(LocalDate.parse(tripDate));  // convert string to date

    trip.setPhoto(photo.getBytes());

    return portalTripService.saveTrip(trip);
}
    @GetMapping("/all")
    public List<PortalTrip> getAllTrips() {
        return portalTripService.getAllTrips();
    }
    @GetMapping("/{id}")
    public Optional<PortalTrip> getTripById(@PathVariable Long id) {
        return portalTripService.getTripById(id);
    }
    @GetMapping("/vehicle/{vehicleNumber}")
    public List<PortalTrip> getTripsByVehicleNumber(@PathVariable String vehicleNumber) {
        return portalTripService.getTripsByVehicleNumber(vehicleNumber);
    }
}