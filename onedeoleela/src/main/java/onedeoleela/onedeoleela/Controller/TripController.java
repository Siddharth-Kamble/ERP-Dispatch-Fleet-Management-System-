package onedeoleela.onedeoleela.Controller;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.Trip;
import onedeoleela.onedeoleela.Entity.TripStatusEnum;
import onedeoleela.onedeoleela.Service.TripService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TripController {

    private final TripService tripService;

    // CREATE TRIP MANUAL
    @PostMapping("/planned")
    public Trip createTrip(@RequestBody Trip trip) {
        return tripService.createTrip(trip);
    }

    // AUTO GROUP TRIP
    @PostMapping("/auto-group-trip")
    public Trip createGroupedTrip(
            @RequestParam String driverName,
            @RequestParam String vehicleNumber,
            @RequestParam String locationFrom
    ) {

        return tripService.createTripWithGroupedRequisitions(
                driverName,
                vehicleNumber,
                locationFrom
        );
    }

    // GET ALL TRIPS
    @GetMapping
    public List<Trip> getAllTrips() {
        return tripService.getAllTrips();
    }

    // DRIVER TRIPS
    @GetMapping("/driver/{driverId}")
    public List<Trip> getTripsByDriver(@PathVariable Long driverId) {
        return tripService.getTripsByDriver(driverId);
    }

    // VEHICLE TRIPS
    @GetMapping("/vehicle/{vehicleId}")
    public List<Trip> getTripsByVehicle(@PathVariable Long vehicleId) {
        return tripService.getTripsByVehicle(vehicleId);
    }

    // STATUS TRIPS
    @GetMapping("/status/{status}")
    public List<Trip> getTripsByStatus(@PathVariable TripStatusEnum status) {
        return tripService.getTripsByStatus(status);
    }

    // ACTIVE VEHICLES
    @GetMapping("/active-vehicles")
    public ResponseEntity<List<String>> getActiveVehicles() {

        List<String> vehicles = tripService.getActiveVehicles();

        return ResponseEntity.ok(vehicles);
    }


    // INACTIVE VEHICLES
    @GetMapping("/inactive-vehicles")
    public ResponseEntity<List<String>> getInactiveVehicles() {

        List<String> vehicles = tripService.getInactiveVehicles();

        return ResponseEntity.ok(vehicles);
    }
    @GetMapping("/trip/{eCode}/today")
    public List<Trip> getDriverTripsToday(@PathVariable Long eCode) {
        return tripService.getTripsForDriverToday(Math.toIntExact(eCode));
    }
    @GetMapping("/latest-logs")
    public ResponseEntity<List<Trip>> getLatestTripLogs(
            @RequestParam(required = false) String vehicleNumber,
            @RequestParam(required = false) TripStatusEnum status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Pass all 4 filter criteria to the service
        List<Trip> trips = tripService.getFilteredLatestTrips(vehicleNumber, status, startDate, endDate, 50);
        return ResponseEntity.ok(trips);
    }
    @GetMapping("/{tripId}")
    public Trip getTripDetails(@PathVariable Long tripId) {
        return tripService.getTripById(tripId);
    }
}