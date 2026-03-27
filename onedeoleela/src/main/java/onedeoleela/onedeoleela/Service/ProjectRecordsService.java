//package onedeoleela.onedeoleela.Service;
//
//import com.itextpdf.kernel.pdf.PdfDocument;
//import com.itextpdf.kernel.pdf.PdfWriter;
//import com.itextpdf.layout.Document;
//import com.itextpdf.layout.element.Paragraph;
//import com.itextpdf.layout.element.Table;
//import com.itextpdf.layout.element.Cell;
//import com.itextpdf.layout.property.TextAlignment;
//import com.itextpdf.kernel.colors.ColorConstants;
//
//import onedeoleela.onedeoleela.Entity.Project;
//import onedeoleela.onedeoleela.Entity.ProjectRecords;
//import onedeoleela.onedeoleela.Repository.ProjectRecordsRepository;
//import onedeoleela.onedeoleela.Repository.ProjectRepository;
//import org.springframework.stereotype.Service;
//
//import java.io.ByteArrayOutputStream;
//import java.time.LocalDate;
//import java.time.format.DateTimeFormatter;
//import java.util.List;
//
//@Service
//public class ProjectRecordsService {
//
//    private final ProjectRecordsRepository recordsRepository;
//    private final ProjectRepository projectRepository;
//
//    public ProjectRecordsService(ProjectRecordsRepository recordsRepository, ProjectRepository projectRepository) {
//        this.recordsRepository = recordsRepository;
//        this.projectRepository = projectRepository;
//    }
//
//    // Add a new record
//    public ProjectRecords addRecord(Long projectId, ProjectRecords record) {
//        Project project = projectRepository.findById(projectId)
//                .orElseThrow(() -> new RuntimeException("Project not found"));
//
//        record.setProject(project);
//
//        LocalDate today = LocalDate.now();
//        record.setRecordDate(today);
//        record.setDayOfWeek(today.getDayOfWeek().name());
//
//        return recordsRepository.save(record);
//    }
//
//    // Fetch all records for a project
//    public List<ProjectRecords> getRecordsByProject(Long projectId) {
//        return recordsRepository.findByProjectProjectId(projectId);
//    }
//
//    // Fetch records for a project in a date range
//    public List<ProjectRecords> getRecordsByProjectAndDate(Long projectId, LocalDate startDate, LocalDate endDate) {
//        return recordsRepository.findByProjectProjectIdAndRecordDateBetween(projectId, startDate, endDate);
//    }
//
//    public byte[] generateProjectHistoryPDF(LocalDate startDate, LocalDate endDate) throws Exception {
//
//        List<ProjectRecords> records = recordsRepository.findAll().stream()
//                .filter(r -> !r.getRecordDate().isBefore(startDate) && !r.getRecordDate().isAfter(endDate))
//                .toList();
//
//        ByteArrayOutputStream baos = new ByteArrayOutputStream();
//        PdfWriter writer = new PdfWriter(baos);
//        PdfDocument pdf = new PdfDocument(writer);
//        Document document = new Document(pdf);
//
//        // Heading
//        document.add(new Paragraph("Dispatch Report")
//                .setBold()
//                .setFontSize(18)
//                .setTextAlignment(TextAlignment.CENTER)
//        );
//
//        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//        document.add(new Paragraph("Date Range: " + startDate.format(dtf) + " to " + endDate.format(dtf))
//                .setFontSize(12)
//                .setTextAlignment(TextAlignment.CENTER)
//        );
//
//        document.add(new Paragraph("\n")); // spacing
//
//        // Table with columns: Project, Date, Day, Sqft, Job Card, DC, Remark, Vehicle/Driver
//        float[] columnWidths = {100f, 70f, 60f, 50f, 100f, 50f, 100f, 100f};
//        Table table = new Table(columnWidths);
//
//        String[] headers = {"Project Name", "Date", "Day", "Sqft", "Job Card No", "DC No", "Remark", "Vehicle/Driver"};
//        for (String header : headers) {
//            table.addHeaderCell(new Cell()
//                    .add(new Paragraph(header).setBold())
//                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
//                    .setTextAlignment(TextAlignment.CENTER)
//            );
//        }
//
//        for (ProjectRecords r : records) {
//            table.addCell(new Cell().add(new Paragraph(r.getProject().getProjectName())));
//            table.addCell(new Cell().add(new Paragraph(r.getRecordDate().format(dtf))));
//            table.addCell(new Cell().add(new Paragraph(r.getDayOfWeek())));
//            table.addCell(new Cell().add(new Paragraph(String.valueOf(r.getSqft()))));
//            table.addCell(new Cell().add(new Paragraph(r.getJobCardNo())));
//            table.addCell(new Cell().add(new Paragraph(r.getDcNo())));
//            table.addCell(new Cell().add(new Paragraph(r.getRemark())));
//            table.addCell(new Cell().add(new Paragraph(r.getVehicleDriver())));
//        }
//
//        document.add(table);
//        document.close();
//
//        return baos.toByteArray();
//    }
//}



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

        LocalDate today = LocalDate.now();
        record.setRecordDate(today);
        record.setDayOfWeek(today.getDayOfWeek().name());

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








//    public byte[] generateProjectHistoryPDF(LocalDate startDate, LocalDate endDate) throws Exception {
//        List<ProjectRecords> records = recordsRepository.findByRecordDateBetween(startDate, endDate);
//
//        ByteArrayOutputStream baos = new ByteArrayOutputStream();
//        PdfWriter writer = new PdfWriter(baos);
//        PdfDocument pdf = new PdfDocument(writer);
//        Document document = new Document(pdf);
//        document.setMargins(20, 20, 20, 20);
//
//        // Title: Dispatch Report [Week Range]
//        DateTimeFormatter titleFormatter = DateTimeFormatter.ofPattern("d MMMM yyyy");
//        document.add(new Paragraph("Dispatch Report " + startDate.format(titleFormatter) + " to " + endDate.format(titleFormatter))
//                .setBold().setFontSize(16));
//
//        // Column widths (matching the screenshot proportions)
//        float[] columnWidths = {25f, 150f, 40f, 80f, 30f, 30f, 30f, 30f, 30f, 30f, 30f, 30f, 50f, 100f};
//        Table table = new Table(columnWidths);
//        table.setWidth(com.itextpdf.layout.properties.UnitValue.createPercentValue(100));
//
//        // --- HEADERS ---
//        String[] mainHeaders = {"Sr No", "Project Name", "Sqft-", "Job Card No", "DC No", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Remark", "Vehicle / Driver"};
//
//        // Add date row above days
//        table.addHeaderCell(new Cell(1, 5).add(new Paragraph(""))); // Empty spacer
//        for (int i = 0; i < 7; i++) {
//            LocalDate current = startDate.plusDays(i);
//            table.addHeaderCell(new Cell().add(new Paragraph(current.format(DateTimeFormatter.ofPattern("dd-MM"))).setFontSize(8)).setBold());
//        }
//        table.addHeaderCell(new Cell(1, 2).add(new Paragraph("")));
//
//        // Add main text headers
//        for (String header : mainHeaders) {
//            table.addHeaderCell(new Cell().add(new Paragraph(header).setBold().setFontSize(9)).setBackgroundColor(ColorConstants.WHITE));
//        }
//
//        // --- DATA ROWS ---
//        int srNo = 1;
//        for (ProjectRecords r : records) {
//            table.addCell(new Cell().add(new Paragraph(String.valueOf(srNo++)).setFontSize(8)));
//            table.addCell(new Cell().add(new Paragraph(r.getProject().getProjectName()).setFontSize(8)));
//            table.addCell(new Cell().add(new Paragraph(String.valueOf(r.getSqft())).setFontSize(8)));
//            table.addCell(new Cell().add(new Paragraph(r.getJobCardNo()).setFontSize(8)));
//            table.addCell(new Cell().add(new Paragraph(r.getDcNo()).setFontSize(8)));
//
//            // Logic for Grey Cells in the Day Columns
//            String recordDay = r.getDayOfWeek().toUpperCase(); // e.g., "MONDAY"
//            String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};
//
//            for (String day : days) {
//                Cell dayCell = new Cell();
//                if (recordDay.equals(day)) {
//                    dayCell.setBackgroundColor(ColorConstants.GRAY); // Matches the screenshot highlight
//                }
//                table.addCell(dayCell);
//            }
//
//            table.addCell(new Cell().add(new Paragraph(r.getRemark()).setFontSize(8)));
//            table.addCell(new Cell().add(new Paragraph(r.getVehicleDriver()).setFontSize(8)));
//        }
//
//        document.add(table);
//        document.close();
//        return baos.toByteArray();
//    }



    public byte[] generateProjectHistoryPDF(LocalDate startDate, LocalDate endDate) throws Exception {
        List<ProjectRecords> records = recordsRepository.findByRecordDateBetween(startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);

        // Set to Landscape for better fit of the new column structure
        pdf.setDefaultPageSize(com.itextpdf.kernel.geom.PageSize.A4.rotate());

        Document document = new Document(pdf);
        document.setMargins(20, 20, 20, 20);

        // Header Title
        DateTimeFormatter titleFormatter = DateTimeFormatter.ofPattern("d MMMM yyyy");
        document.add(new Paragraph("Dispatch Report: " + startDate.format(titleFormatter) + " to " + endDate.format(titleFormatter))
                .setBold().setFontSize(16));

        // Updated column widths for the new sequence
        // SrNo, Project, Sqft, JobCard, DC, Material/Qty, Vehicle, Day, Date, Remark
        float[] columnWidths = {30f, 150f, 40f, 70f, 40f, 120f, 100f, 50f, 60f, 80f};
        Table table = new Table(columnWidths);
        table.setWidth(com.itextpdf.layout.properties.UnitValue.createPercentValue(100));

        // Headers
        String[] headers = {
                "Sr No", "Project Name", "Sqft-", "Job Card No", "DC No",
                "Material and Quantity", "Vehicle / Driver", "Day", "Date", "Remark"
        };

        for (String header : headers) {
            table.addHeaderCell(new Cell()
                    .add(new Paragraph(header).setBold().setFontSize(9))
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        }

        // Data Rows
        int srNo = 1;
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

        for (ProjectRecords r : records) {
            table.addCell(new Cell().add(new Paragraph(String.valueOf(srNo++)).setFontSize(8)));
            table.addCell(new Cell().add(new Paragraph(r.getProject().getProjectName()).setFontSize(8)));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(r.getSqft())).setFontSize(8)));
            table.addCell(new Cell().add(new Paragraph(r.getJobCardNo()).setFontSize(8)));
            table.addCell(new Cell().add(new Paragraph(r.getDcNo()).setFontSize(8)));

            // --- Material and Quantity Logic ---
            // This assumes you are storing materials as a List or a formatted String
            // If it's the dynamic list from the frontend, we join them here
            String materialContent = "";
            if (r.getMaterials() != null) {
                materialContent = r.getMaterials().stream()
                        .map(m -> m.getMaterialName() + ": " + m.getQuantity())
                        .collect(Collectors.joining("\n"));
            }
            table.addCell(new Cell().add(new Paragraph(materialContent).setFontSize(8)));

            table.addCell(new Cell().add(new Paragraph(r.getVehicleDriver()).setFontSize(8)));

            // Day and Date columns
            table.addCell(new Cell().add(new Paragraph(r.getDayOfWeek()).setFontSize(8)));
            table.addCell(new Cell().add(new Paragraph(r.getRecordDate().format(dateFormatter)).setFontSize(8)));

            table.addCell(new Cell().add(new Paragraph(r.getRemark()).setFontSize(8)));
        }

        document.add(table);
        document.close();
        return baos.toByteArray();
    }
    // Generate PDF report for project records in a date range
//        public byte[] generateProjectHistoryPDF(LocalDate startDate, LocalDate endDate) throws Exception {
//
//        // Filter records by date range
//        List<ProjectRecords> records = recordsRepository.findAll().stream()
//                .filter(r -> !r.getRecordDate().isBefore(startDate) && !r.getRecordDate().isAfter(endDate))
//                .toList();
//
//        // PDF setup
//        ByteArrayOutputStream baos = new ByteArrayOutputStream();
//        PdfWriter writer = new PdfWriter(baos);
//        PdfDocument pdf = new PdfDocument(writer);
//        Document document = new Document(pdf);
//
//        // Heading (alignment removed)
//        document.add(new Paragraph("Dispatch Report")
//                .setBold()
//                .setFontSize(18)
//        );
//
//        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//        document.add(new Paragraph("Date Range: " + startDate.format(dtf) + " to " + endDate.format(dtf))
//                .setFontSize(12)
//        );
//
//        document.add(new Paragraph("\n")); // spacing
//
//        // Table
//        float[] columnWidths = {100f, 70f, 60f, 50f, 100f, 50f, 100f, 100f};
//        Table table = new Table(columnWidths);
//
//        String[] headers = {"Project Name", "Date", "Day", "Sqft", "Job Card No", "DC No", "Remark", "Vehicle/Driver"};
//        for (String header : headers) {
//            table.addHeaderCell(new Cell()
//                    .add(new Paragraph(header).setBold())
//                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
//            );
//        }
//
//        // Data rows
//        for (ProjectRecords r : records) {
//            table.addCell(new Cell().add(new Paragraph(r.getProject().getProjectName())));
//            table.addCell(new Cell().add(new Paragraph(r.getRecordDate().format(dtf))));
//            table.addCell(new Cell().add(new Paragraph(r.getDayOfWeek())));
//            table.addCell(new Cell().add(new Paragraph(String.valueOf(r.getSqft()))));
//            table.addCell(new Cell().add(new Paragraph(r.getJobCardNo())));
//            table.addCell(new Cell().add(new Paragraph(r.getDcNo())));
//            table.addCell(new Cell().add(new Paragraph(r.getRemark())));
//            table.addCell(new Cell().add(new Paragraph(r.getVehicleDriver())));
//        }
//
//        document.add(table);
//        document.close();
//
//        return baos.toByteArray();
//    }
}