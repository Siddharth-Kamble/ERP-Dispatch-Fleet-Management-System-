package onedeoleela.onedeoleela.Entity;

public enum TripStatusEnum {
    ASSIGNED,                // Trip assigned to driver
    ACKNOWLEDGED,            // Driver acknowledges the trip
    LOADING_STARTED,         // Loading at origin started
    LOADING_COMPLETED,       // Loading at origin completed
    IN_TRANSIT,              // Vehicle en route to destination
    REACHED_DESTINATION,     // Vehicle reached destination
    UNLOADING_STARTED,       // Unloading at destination started
    UNLOADING_COMPLETED,     // Unloading at destination completed
    RETURN_JOURNEY_STARTED,  // Vehicle started return journey
    RETURN_JOURNEY_COMPLETED,
    CANCELLED// Vehicle completed return journey
}