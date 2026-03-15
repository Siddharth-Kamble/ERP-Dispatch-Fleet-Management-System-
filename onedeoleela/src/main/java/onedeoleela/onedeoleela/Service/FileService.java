package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.FileEntity;
import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Repository.FileRepository;
import onedeoleela.onedeoleela.Repository.UserRepository;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FileService {
    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final Tika tika = new Tika();

    public FileService(FileRepository fileRepository, UserRepository userRepository) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

//        public FileEntity uploadFile(MultipartFile file, String username) throws Exception {
//            // Detect file name
//            String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown";
//
//            // Detect file type using Apache Tika
//            String fileType = tika.detect(file.getBytes());
//
//            FileEntity entity = new FileEntity();
//            entity.setFileName(fileName);
//            entity.setFileType(fileType != null ? fileType : "unknown");
//            entity.setFileSize(file.getSize());
//            entity.setUploadedBy(username);
//            entity.setUploadedAt(LocalDateTime.now());
//            entity.setFileData(file.getBytes());
//            System.out.println("fileData class: " + entity.getFileData().getClass());
//            System.out.println("fileData length: " + entity.getFileData().length);
//            return fileRepository.save(entity);
//        }

    public FileEntity uploadFile(MultipartFile file, Long eCode) throws IOException {

        User user = userRepository.findByeCode(eCode)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String username = user.getFullName();

        FileEntity entity = new FileEntity();
        entity.setFileName(file.getOriginalFilename());
        entity.setFileType(file.getContentType());
        entity.setFileSize(file.getSize());
        entity.setFileData(file.getBytes());
        entity.setUploadedBy(username);
        entity.setUploadedAt(LocalDateTime.now());
        return fileRepository.save(entity);
    }

    /**
     * Download a file by ID
     * @param fileId ID of the file
     * @return Optional<FileEntity>
     */
    public Optional<FileEntity> downloadFile(Long fileId) {
        return fileRepository.findById(fileId);
    }

    /**
     * List all files metadata
     * @return List<FileEntity>
     */
    public List<FileEntity> getAllFiles() {
        return fileRepository.findAll();
    }


    public void deleteFile(Long fileId) {
        fileRepository.deleteById(fileId);
    }

    public List<FileEntity> getFilesByUploader(String username) {
        return fileRepository.findAll()
                .stream()
                .filter(f -> f.getUploadedBy().equalsIgnoreCase(username))
                .toList();
    }
}