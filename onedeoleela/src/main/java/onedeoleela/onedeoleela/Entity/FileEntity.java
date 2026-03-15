package onedeoleela.onedeoleela.Entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;



import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "files")
public class FileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;  // Automatically detected

    @Column(nullable = false)
    private String fileType;  // Automatically detected

    @Column(nullable = false)
    private Long fileSize;    // File size in bytes

    @Column(nullable = false)
    private String uploadedBy; // Username of uploader

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @Lob
    @Column(nullable = false)
    @JsonIgnore
    private byte[] fileData;

    public FileEntity() {}

    public FileEntity(String fileName, String fileType, Long fileSize, String uploadedBy, LocalDateTime uploadedAt, byte[] fileData) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = uploadedAt;
        this.fileData = fileData;
    }


}