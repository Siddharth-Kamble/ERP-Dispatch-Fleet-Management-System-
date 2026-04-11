

package onedeoleela.onedeoleela.Service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.kernel.colors.ColorConstants;

import onedeoleela.onedeoleela.Entity.Material;
import onedeoleela.onedeoleela.Entity.Project;
import onedeoleela.onedeoleela.Entity.ProjectRecords;
import onedeoleela.onedeoleela.Repository.ProjectRecordsRepository;
import onedeoleela.onedeoleela.Repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectRecordsService {

    private final ProjectRecordsRepository recordsRepository;
    private final ProjectRepository projectRepository;

    public ProjectRecordsService(ProjectRecordsRepository recordsRepository,
                                 ProjectRepository projectRepository) {
        this.recordsRepository = recordsRepository;
        this.projectRepository = projectRepository;
    }

    // ── Null-safe helper ─────────────────────────────────────────────────────
    private String safe(String value) {
        return (value != null) ? value : "";
    }

    private String safeDouble(Double value) {
        if (value == null) return "";
        return (value % 1 == 0) ? String.valueOf(value.intValue()) : String.valueOf(value);
    }

    // ── Add a new record ─────────────────────────────────────────────────────
    public ProjectRecords addRecord(Long projectId, ProjectRecords record) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        record.setProject(project);

        if (record.getMaterials() != null) {
            for (Material m : record.getMaterials()) {
                m.setProjectRecord(record);
            }
        }

        return recordsRepository.save(record);
    }

    // ── Fetch all records for a project ─────────────────────────────────────
    public List<ProjectRecords> getRecordsByProject(Long projectId) {
        return recordsRepository.findByProjectProjectId(projectId);
    }

    // ── Fetch records for a project in a date range ──────────────────────────
    public List<ProjectRecords> getRecordsByProjectAndDate(Long projectId,
                                                           LocalDate startDate,
                                                           LocalDate endDate) {
        return recordsRepository.findByProjectProjectIdAndRecordDateBetween(
                projectId, startDate, endDate);
    }

    // ── Generate PDF ─────────────────────────────────────────────────────────
    public byte[] generateProjectHistoryPDF(LocalDate startDate, LocalDate endDate)
            throws Exception {

        // Use the ordered query so rows appear chronologically
        List<ProjectRecords> records =
                recordsRepository.findByRecordDateBetweenOrderByRecordDateAsc(startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);

        // Landscape A4
        pdf.setDefaultPageSize(com.itextpdf.kernel.geom.PageSize.A4.rotate());

        Document document = new Document(pdf);
        document.setMargins(20, 20, 20, 20);

        // ── Title ────────────────────────────────────────────────────────────
        DateTimeFormatter titleFormatter = DateTimeFormatter.ofPattern("d MMMM yyyy");
        document.add(
                new Paragraph("Dispatch Report: "
                        + startDate.format(titleFormatter)
                        + " to "
                        + endDate.format(titleFormatter))
                        .setBold()
                        .setFontSize(16)
        );

        // ── Column widths matching the 10 required headers ───────────────────
        // Sr No | Project Name | Sqft | Job Card No | DC No |
        // Material and Quantity | Vehicle | Driver | Day | Date | Remark
        float[] columnWidths = {30f, 130f, 40f, 70f, 40f, 130f, 80f, 80f, 50f, 60f, 80f};
        Table table = new Table(columnWidths);
        table.setWidth(com.itextpdf.layout.properties.UnitValue.createPercentValue(100));

        // ── Headers ──────────────────────────────────────────────────────────
        String[] headers = {
                "Sr No",
                "Project Name",
                "Sqft",
                "Job Card No",
                "DC No",
                "Material and Quantity",
                "Vehicle",
                "Driver",
                "Day",
                "Date",
                "Remark"
        };

        for (String header : headers) {
            table.addHeaderCell(
                    new Cell()
                            .add(new Paragraph(header).setBold().setFontSize(9))
                            .setBackgroundColor(ColorConstants.LIGHT_GRAY)
            );
        }

        // ── Rows ─────────────────────────────────────────────────────────────
        int srNo = 1;
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

        for (ProjectRecords r : records) {

            // Sr No
            table.addCell(new Cell().add(
                    new Paragraph(String.valueOf(srNo++)).setFontSize(8)));

            // Project Name — null-safe via the project relation
            String projectName = (r.getProject() != null && r.getProject().getProjectName() != null)
                    ? r.getProject().getProjectName() : "";
            table.addCell(new Cell().add(new Paragraph(projectName).setFontSize(8)));

            // Sqft
            table.addCell(new Cell().add(
                    new Paragraph(safeDouble(r.getSqft())).setFontSize(8)));

            // Job Card No
            table.addCell(new Cell().add(
                    new Paragraph(safe(r.getJobCardNo())).setFontSize(8)));

            // DC No
            table.addCell(new Cell().add(
                    new Paragraph(safe(r.getDcNo())).setFontSize(8)));

            // Material and Quantity — null-safe stream
            String materialContent = "";
            if (r.getMaterials() != null && !r.getMaterials().isEmpty()) {
                materialContent = r.getMaterials().stream()
                        .map(m -> {
                            String name = (m.getMaterialName() != null) ? m.getMaterialName() : "";
                            String qty  = safeDouble(m.getQuantity());
                            return name + ": " + qty;
                        })
                        .collect(Collectors.joining("\n"));
            }
            table.addCell(new Cell().add(new Paragraph(materialContent).setFontSize(8)));

            // Vehicle
            table.addCell(new Cell().add(
                    new Paragraph(safe(r.getVehicleDriver())).setFontSize(8)));

            // Driver
            table.addCell(new Cell().add(
                    new Paragraph(safe(r.getDriver())).setFontSize(8)));

            // Day
            table.addCell(new Cell().add(
                    new Paragraph(safe(r.getDayOfWeek())).setFontSize(8)));

            // Date
            String dateStr = (r.getRecordDate() != null)
                    ? r.getRecordDate().format(dateFormatter) : "";
            table.addCell(new Cell().add(new Paragraph(dateStr).setFontSize(8)));

            // Remark
            table.addCell(new Cell().add(
                    new Paragraph(safe(r.getRemark())).setFontSize(8)));
        }

        document.add(table);
        document.close();
        return baos.toByteArray();
    }
}