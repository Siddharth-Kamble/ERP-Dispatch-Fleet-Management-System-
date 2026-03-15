package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.FileEntity;
import onedeoleela.onedeoleela.Entity.VehicleRequisition;
import onedeoleela.onedeoleela.Repository.VehicleRequisitionRepository;
import onedeoleela.onedeoleela.Service.FileService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin
public class FileController {

    private final FileService fileService;
    private final VehicleRequisitionRepository requisitionRepository;

    public FileController(FileService fileService,
                          VehicleRequisitionRepository requisitionRepository) {
        this.fileService = fileService;
        this.requisitionRepository = requisitionRepository;
    }

    // ✅ UPDATED UPLOAD METHOD
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("eCode") Long eCode,
            @RequestParam("requisitionNo") String requisitionNo) {

        try {

            // 1️⃣ Save file
            FileEntity savedFile = fileService.uploadFile(file, eCode);

            // 2️⃣ Find requisition
            VehicleRequisition req =
                    requisitionRepository
                            .findByRequisitionNo(requisitionNo)
                            .orElseThrow(() -> new RuntimeException("Requisition not found"));

            // 3️⃣ Link file to requisition
            req.setFileId(savedFile.getId());
            requisitionRepository.save(req);

            return ResponseEntity.ok("File uploaded & linked successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // DOWNLOAD
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {

        FileEntity file = fileService.downloadFile(id)
                .orElseThrow(() -> new RuntimeException("File not found"));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + file.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(file.getFileType()))
                .body(file.getFileData());
    }

    @GetMapping("/all")
    public ResponseEntity<List<FileEntity>> getAllFiles() {
        return ResponseEntity.ok(fileService.getAllFiles());
    }
}