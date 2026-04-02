    package onedeoleela.onedeoleela.Entity;



    import com.fasterxml.jackson.annotation.JsonFormat;
    import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
    import com.fasterxml.jackson.annotation.JsonProperty;
    import jakarta.persistence.*;
    import lombok.*;

    import java.time.LocalDate;
    import java.time.LocalDateTime;

    @Entity
    @Table(name = "project_logs")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public class ProjectLog {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String projectName;

        private String dcNo;

        private String workOrderNumber;

        private String codeNo;

        private Long tripId;

        private LocalDateTime createdAt;

        @PrePersist
        public void prePersist(){
            this.createdAt = LocalDateTime.now();
        }


        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "tower_id")
        @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // ADD THIS LINE
        private Tower tower;

        @JsonProperty("towerId")
        public Long getTowerId() {
            return tower != null ? tower.getTowerId() : null;
        }

        // ✅ NEW FIELD (User Input Date)
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate userDate;
    }