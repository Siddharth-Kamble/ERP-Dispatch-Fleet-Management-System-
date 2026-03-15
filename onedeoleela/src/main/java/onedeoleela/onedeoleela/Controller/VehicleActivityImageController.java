//package onedeoleela.onedeoleela.Controller;
//
//
//
//import lombok.RequiredArgsConstructor;
//import onedeoleela.onedeoleela.Entity.TripStatusEnum;
//import onedeoleela.onedeoleela.Service.VehicleActivityImageService;
//import onedeoleela.onedeoleela.Repository.VehicleActivityImageRepository;
//import onedeoleela.onedeoleela.Entity.VehicleActivityImage;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/vehicle-images")
//@RequiredArgsConstructor
//public class VehicleActivityImageController {
//
//    private final VehicleActivityImageService service;
//    private final VehicleActivityImageRepository imageRepository;
//
//    @PostMapping("/upload")
//    public ResponseEntity<String> uploadImage(
//            @RequestParam("file") MultipartFile file,
//            @RequestParam("tripId") Long tripId
//    ) throws IOException {
//
//        return ResponseEntity.ok(
//                service.uploadImage(file, tripId)
//        );
//    }
//
//    @GetMapping("/trip/{tripId}")
//    public ResponseEntity<List<VehicleActivityImage>> getImagesByTrip(
//            @PathVariable Long tripId) {
//
//        return ResponseEntity.ok(
//                imageRepository.findByTripId(tripId)
//        );
//    }
//
//    @GetMapping("/trip/{tripId}/status/{status}")
//    public ResponseEntity<List<VehicleActivityImage>> getImagesByTripAndStatus(
//            @PathVariable Long tripId,
//            @PathVariable TripStatusEnum status) {
//
//        return ResponseEntity.ok(
//                imageRepository.findByTripIdAndStatus(tripId, status)
//        );
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
//
//        VehicleActivityImage image =
//                imageRepository.findById(id)
//                        .orElseThrow();
//
//        return ResponseEntity.ok()
//                .header("Content-Type", image.getContentType())
//                .body(image.getImageData());
//    }
//}


package onedeoleela.onedeoleela.Controller;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.TripStatusEnum;
import onedeoleela.onedeoleela.Service.VehicleActivityImageService;
import onedeoleela.onedeoleela.Repository.VehicleActivityImageRepository;
import onedeoleela.onedeoleela.Entity.VehicleActivityImage;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/vehicle-images")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows React to access the image stream
public class VehicleActivityImageController {

    private final VehicleActivityImageService service;
    private final VehicleActivityImageRepository imageRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("tripId") Long tripId
    ) throws IOException {
        return ResponseEntity.ok(service.uploadImage(file, tripId));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<VehicleActivityImage>> getImagesByTrip(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(imageRepository.findByTripId(tripId));
    }

    @GetMapping("/trip/{tripId}/status/{status}")
    public ResponseEntity<List<VehicleActivityImage>> getImagesByTripAndStatus(
            @PathVariable Long tripId,
            @PathVariable TripStatusEnum status) {
        return ResponseEntity.ok(imageRepository.findByTripIdAndStatus(tripId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        return imageRepository.findById(id)
                .map(image -> {
                    // Safety check: force correct header if DB entry is old/wrong
                    String contentType = image.getContentType();
                    if (image.getFileName().toLowerCase().endsWith(".jpg")) {
                        contentType = "image/jpeg";
                    }

                    return ResponseEntity.ok()
                            .header("Content-Type", contentType)
                            .body(image.getImageData());
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
