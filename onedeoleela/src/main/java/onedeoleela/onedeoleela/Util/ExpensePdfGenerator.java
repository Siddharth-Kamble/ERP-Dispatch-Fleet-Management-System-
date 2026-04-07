

package onedeoleela.onedeoleela.Util;

import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.image.ImageDataFactory;

import onedeoleela.onedeoleela.Entity.ExpenseEntity;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

public class ExpensePdfGenerator {

    public static byte[] generateExpenseReport(
            String vehicleNumber,
            String driverName,
            List<ExpenseEntity> expenses,
            Map<String,String> userNames
    ) throws Exception {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // ===== TITLE =====
        Paragraph title = new Paragraph("Vehicle Expense Report")
                .setBold()
                .setFontSize(18)
                .setTextAlignment(TextAlignment.CENTER);

        document.add(title);

        document.add(new Paragraph("Vehicle Number: " + vehicleNumber));
       // document.add(new Paragraph("Driver: " + driverName));
        document.add(new Paragraph("\n"));

        // ===== TABLE =====
        Table table = new Table(UnitValue.createPercentArray(new float[]{
                2,2,2,3,2,2,2,3   // ✅ UPDATED (added 2 columns)
        })).useAllAvailableWidth();

        table.addHeaderCell("Category");
        table.addHeaderCell("Date");
        table.addHeaderCell("Updated By");
        table.addHeaderCell("Description");

        // ✅ NEW HEADERS
        table.addHeaderCell("Rate");
        table.addHeaderCell("Diesel Liter");

        table.addHeaderCell("Amount");
        table.addHeaderCell("Bill");

        double total = 0;

        for (ExpenseEntity e : expenses) {

            table.addCell(e.getType().toString());

            table.addCell(e.getDate().toString());

            // Convert ECode → Name
            String updatedBy = userNames.getOrDefault(e.getDriverECode(), "Unknown");
            table.addCell(updatedBy);

            table.addCell(
                    e.getDescription() != null
                            ? e.getDescription()
                            : "-"
            );

            // ✅ RATE COLUMN
            table.addCell(
                    e.getRate() != null ? "₹ " + e.getRate() : "-"
            );

            // ✅ DIESEL LITER COLUMN
            table.addCell(
                    e.getDieselLiter() != null ? e.getDieselLiter() + " L" : "-"
            );

            table.addCell("₹ " + e.getAmount());

            total += e.getAmount();

            if (e.getImageData() != null) {

                Image img = new Image(
                        ImageDataFactory.create(e.getImageData())
                );

                img.setWidth(80);

                table.addCell(img);

            } else {

                table.addCell("-");

            }
        }

        document.add(table);

        document.add(
                new Paragraph("\nTotal Expense: ₹ " + total)
                        .setBold()
        );

        document.close();

        return out.toByteArray();
    }
}