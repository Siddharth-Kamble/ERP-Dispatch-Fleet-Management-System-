    package onedeoleela.onedeoleela.Repository;

    import onedeoleela.onedeoleela.Entity.ProjectRecords;
    import org.springframework.data.jpa.repository.JpaRepository;
    import org.springframework.stereotype.Repository;

    import java.time.LocalDate;
    import java.util.List;

    @Repository
    public interface ProjectRecordsRepository extends JpaRepository<ProjectRecords, Long> {

        // Fetch all records for a project
        List<ProjectRecords> findByProjectProjectId(Long projectId);
        List<ProjectRecords> findByRecordDateBetween(LocalDate startDate, LocalDate endDate);
        // Fetch records for a project filtered by date range
        List<ProjectRecords> findByProjectProjectIdAndRecordDateBetween(
                Long projectId, LocalDate startDate, LocalDate endDate);
    }