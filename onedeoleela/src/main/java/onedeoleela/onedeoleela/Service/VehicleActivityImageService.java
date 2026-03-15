//package onedeoleela.onedeoleela.Service;
//
//import lombok.RequiredArgsConstructor;
//import onedeoleela.onedeoleela.Entity.ImageCompressionUtil;
//import onedeoleela.onedeoleela.Entity.TripStatusEnum;
//import onedeoleela.onedeoleela.Entity.VehicleActivityImage;
//import onedeoleela.onedeoleela.Entity.VehicleActivityTrack;
//import onedeoleela.onedeoleela.Repository.VehicleActivityImageRepository;
//import onedeoleela.onedeoleela.Repository.VehicleActivityTrackRepository;
//
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//
//@Service
//@RequiredArgsConstructor
//public class VehicleActivityImageService {
//
//    private final VehicleActivityImageRepository imageRepository;
//    private final VehicleActivityTrackRepository trackRepository;
//
//    @Transactional
//    public String uploadImage(MultipartFile file, Long tripId) throws IOException {
//
//        if (file == null || file.isEmpty()) {
//            throw new RuntimeException("Uploaded file is empty");
//        }
//
//        if (tripId == null) {
//            throw new RuntimeException("Trip ID cannot be null");
//        }
//
//
//        // ✅ 1️⃣ Fetch latest trip status
//        VehicleActivityTrack latestTrack = trackRepository
//                .findTopByTripIdOrderByEventTimeDesc(tripId)
//                .orElseThrow(() ->
//                        new RuntimeException("No trip status found for Trip ID: " + tripId));
//
//        TripStatusEnum currentStatus = latestTrack.getStatus();
//
//        // ✅ 2️⃣ Generate timestamp
//        LocalDateTime now = LocalDateTime.now();
//        String formattedDateTime = now.format(
//                DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
//
//        // ✅ 3️⃣ Generate dynamic file name
//        String generatedFileName =
//                "TRIP_" + tripId + "_" +
//                        currentStatus.name() + "_" +
//                        formattedDateTime + ".jpg";
//
//        // ✅ 4️⃣ Compress image (60% quality)
//        byte[] compressedImage =
//                ImageCompressionUtil.compressImage(file.getBytes(), 0.5f);
//        // ✅ 5️⃣ Create and save entity
//        System.out.println("Compressed image class: " + compressedImage.getClass());
//        System.out.println("Compressed image length: " + compressedImage.length);
//        VehicleActivityImage image = new VehicleActivityImage();
//        image.setTripId(tripId);
//        image.setStatus(currentStatus);
//        image.setFileName(generatedFileName);
//        image.setContentType(file.getContentType()); // better than hardcoding
//        image.setImageData(compressedImage);
//        image.setUploadedAt(now);
//
//        imageRepository.save(image);
//        System.out.println("Compressed image class: " + compressedImage.getClass());
//        System.out.println("Compressed image length: " + compressedImage.length);
//        return "Image stored successfully under status: " + currentStatus.name();
//    }
//}

package onedeoleela.onedeoleela.Service;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.ImageCompressionUtil;
import onedeoleela.onedeoleela.Entity.TripStatusEnum;
import onedeoleela.onedeoleela.Entity.VehicleActivityImage;
import onedeoleela.onedeoleela.Entity.VehicleActivityTrack;
import onedeoleela.onedeoleela.Repository.VehicleActivityImageRepository;
import onedeoleela.onedeoleela.Repository.VehicleActivityTrackRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class VehicleActivityImageService {

    private final VehicleActivityImageRepository imageRepository;
    private final VehicleActivityTrackRepository trackRepository;

    @Transactional
    public String uploadImage(MultipartFile file, Long tripId) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty");
        }

        if (tripId == null) {
            throw new RuntimeException("Trip ID cannot be null");
        }

        // 1. Fetch latest trip status
        VehicleActivityTrack latestTrack = trackRepository
                .findTopByTripIdOrderByEventTimeDesc(tripId)
                .orElseThrow(() ->
                        new RuntimeException("No trip status found for Trip ID: " + tripId));

        TripStatusEnum currentStatus = latestTrack.getStatus();

        // 2. Generate timestamp and dynamic file name
        LocalDateTime now = LocalDateTime.now();
        String formattedDateTime = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String generatedFileName = "TRIP_" + tripId + "_" + currentStatus.name() + "_" + formattedDateTime + ".jpg";

        // 3. Compress image (matches your Util outputting JPG)
        byte[] compressedImage = ImageCompressionUtil.compressImage(file.getBytes(), 0.5f);

        // 4. Create and save entity
        VehicleActivityImage image = new VehicleActivityImage();
        image.setTripId(tripId);
        image.setStatus(currentStatus);
        image.setFileName(generatedFileName);

        // 🔥 FIX: Hardcode to "image/jpeg" because ImageCompressionUtil
        // transforms the bytes into a JPEG, regardless of original format.
        image.setContentType("image/jpeg");

        image.setImageData(compressedImage);
        image.setUploadedAt(now);

        imageRepository.save(image);
        return "Image stored successfully under status: " + currentStatus.name();
    }
}