

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

    public ProjectRecordsService(ProjectRecordsRepository recordsRepository, ProjectRepository projectRepository) {
        this.recordsRepository = recordsRepository;
        this.projectRepository = projectRepository;
    }

    // Add a new record
    public ProjectRecords addRecord(Long projectId, ProjectRecords record) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        record.setProject(project);

        // ❌ REMOVED auto date & day logic
        // ✅ Now date comes from user, day handled by entity (@PrePersist)

        // 🔥 IMPORTANT: Set relationship
        if (record.getMaterials() != null) {
            for (Material m : record.getMaterials()) {
                m.setProjectRecord(record);
            }
        }

        return recordsRepository.save(record);
    }

    // Fetch all records for a project
    public List<ProjectRecords> getRecordsByProject(Long projectId) {
        return recordsRepository.findByProjectProjectId(projectId);
    }

    // Fetch records for a project in a date range
    public List<ProjectRecords> getRecordsByProjectAndDate(Long projectId, LocalDate startDate, LocalDate endDate) {
        return recordsRepository.findByProjectProjectIdAndRecordDateBetween(projectId, startDate, endDate);
    }

    public byte[] generateProjectHistoryPDF(LocalDate startDate, LocalDate endDate) throws Exception {
        List<ProjectRecords> records = recordsRepository.findByRecordDateBetween(startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);

        pdf.setDefaultPageSize(com.itextpdf.kernel.geom.PageSize.A4.rotate());

        Document document = new Document(pdf);
        document.setMargins(20, 20, 20, 20);

        DateTimeFormatter titleFormatter = DateTimeFormatter.ofPattern("d MMMM yyyy");
        document.add(new Paragraph("Dispatch Report: " + startDate.format(titleFormatter) + " to " + endDate.format(titleFormatter))
                .setBold().setFontSize(16));

        // ✅ Added Driver column
        float[] columnWidths = {30f, 150f, 40f, 70f, 40f, 120f, 80f, 80f, 50f, 60f, 80f};
        Table table = new Table(columnWidths);
        table.setWidth(com.itextpdf.layout.properties.UnitValue.createPercentValue(100));

        String[] headers = {
                "Sr No", "Project Name", "Sqft-", "Job Card No", "DC No",
                "Material and Quantity", "Vehicle", "Driver", "Day", "Date", "Remark"
        };

        for (String header : headers) {
            table.addHeaderCell(new Cell()
                    .add(new Paragraph(header).setBold().setFontSize(9))
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        }

        int srNo = 1;
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

        for (ProjectRecords r : records) {
            table.addCell(new Cell().add(new Paragraph(String.valueOf(srNo++)).setFontSize(8)));
            table.addCell(new Cell().add(new Paragraph(r.getProject().getProjectName()).setFontSize(8)));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(r.getSqft())).setFontSize(8)));
            table.addCell(new Cell().add(new Paragraph(r.getJobCardNo()).setFontSize(8)));
            table.addCell(new Cell().add(new Paragraph(r.getDcNo()).setFontSize(8)));

//            String materialContent = "";
//            if (r.getMaterials() != null) {
//                materialContent = r.getMaterials().stream()
//                        .map(m -> m.getMaterialName() + ": " + m.getQuantity())
//                        .collect(Collectors.joining("\n"));
//            }
            String materialContent = "";
            if (r.getMaterials() != null) {
                materialContent = r.getMaterials().stream()
                        .map(m -> {
                            Double qty = m.getQuantity();

                            String formattedQty = (qty % 1 == 0)
                                    ? String.valueOf(qty.intValue())
                                    : String.valueOf(qty);

                            return m.getMaterialName() + ": " + formattedQty;
                        })
                        .collect(Collectors.joining("\n"));
            }
            table.addCell(new Cell().add(new Paragraph(materialContent).setFontSize(8)));

            // ✅ Vehicle & Driver separated
            table.addCell(new Cell().add(new Paragraph(r.getVehicleDriver()).setFontSize(8)));
            table.addCell(new Cell().add(new Paragraph(r.getDriver()).setFontSize(8)));

            table.addCell(new Cell().add(new Paragraph(r.getDayOfWeek()).setFontSize(8)));
            table.addCell(new Cell().add(new Paragraph(r.getRecordDate().format(dateFormatter)).setFontSize(8)));

            table.addCell(new Cell().add(new Paragraph(r.getRemark()).setFontSize(8)));
        }

        document.add(table);
        document.close();
        return baos.toByteArray();
    }
}