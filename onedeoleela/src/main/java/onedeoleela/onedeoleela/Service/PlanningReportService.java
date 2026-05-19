
package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.PlanningLineItem;
import onedeoleela.onedeoleela.Entity.PlanningWork;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.*;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Generates a PDF Project Schedule Report matching the Excel layout:
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │        AURO REALTY – THE REGENT PHASE-II TOWER 5   (orange bg)          │
 * ├──────────────────────┬──────────────────────────────┬────────────────────┤
 * │  30TH TO 35TH FLOORS │  WORK ORDER NO – BAWOJ/...  │ PROJECT CODE: ODL  │
 * ├────────┬─────┬───────┴──────────┬───────┬───────────┤                    │
 * │30TH... │ 249 │ NOS  │ 15417     │ SQFT  │           │                    │
 * ├────────┴─────┴───────────────────┴───────┴───────────┴────────────────────┤
 * │ SR NO. │ LINE ITEM │ START DATE │ END DATE │ DAYS │ DEPT │ ACTION │STATUS│REMARK│
 * ├────────┴───────────┴────────────┴──────────┴──────┴──────┴────────┴──────┴──────┤
 * │  data rows ...                                                             │
 * ├────────────────────────────────────────────────────────────────────────────┤
 * │                        │ TOTAL DAYS │  66  │                               │
 * └────────────────────────────────────────────────────────────────────────────┘
 *
 * Maven dependency:
 * <dependency>
 *     <groupId>org.apache.pdfbox</groupId>
 *     <artifactId>pdfbox</artifactId>
 *     <version>3.0.2</version>
 * </dependency>
 */
@Service
public class PlanningReportService {

    // ── Page geometry (A4 landscape) ──────────────────────────────────────────
    private static final float PAGE_W   = PDRectangle.A4.getHeight(); // 841.89
    private static final float PAGE_H   = PDRectangle.A4.getWidth();  // 595.28
    private static final float MARGIN_X = 20f;
    private static final float MARGIN_Y = 20f;
    private static final float TABLE_W  = PAGE_W - 2 * MARGIN_X;

    // ── Row heights ───────────────────────────────────────────────────────────
    private static final float ROW_TITLE   = 26f;   // "AURO REALTY" title row
    private static final float ROW_HDR2    = 18f;   // work order / project code row
    private static final float ROW_HDR3    = 18f;   // 249 NOS / 15417 SQFT row
    private static final float ROW_COL_HDR = 20f;   // column labels row
    private static final float ROW_DATA    = 15f;   // each data row
    private static final float ROW_FOOTER  = 17f;   // TOTAL DAYS row

    // ── Font sizes ────────────────────────────────────────────────────────────
    private static final float FS_TITLE  = 11f;
    private static final float FS_HDR    = 8f;
    private static final float FS_COL    = 7.5f;
    private static final float FS_DATA   = 7f;

    // ── 9 columns: SR | LINE ITEM | START | END | DAYS | DEPT | ACTION | STATUS | REMARK
    //    Must sum to TABLE_W = 801.89
    private static final float[] COL_W = { 28f, 185f, 65f, 65f, 32f, 105f, 110f, 75f, 137f };
    // Indices for reference:
    // 0=SR, 1=LINE_ITEM, 2=START, 3=END, 4=DAYS, 5=DEPT, 6=ACTION, 7=STATUS, 8=REMARK

    // ── Colours (R,G,B 0-1) ───────────────────────────────────────────────────
    // Orange title background (matches image)
    private static final float[] CLR_ORANGE     = { 0.98f, 0.65f, 0.20f }; // #FABA33
    private static final float[] CLR_BLACK      = { 0f,    0f,    0f    };
    private static final float[] CLR_WHITE      = { 1f,    1f,    1f    };
    // Light orange for sub-header rows
    private static final float[] CLR_HDR_LIGHT  = { 0.99f, 0.85f, 0.60f }; // #FCDA99
    // Column header row – same orange
    private static final float[] CLR_COL_HDR_BG = { 0.98f, 0.65f, 0.20f }; // same as title
    // Alternating row shading – very light yellow
    private static final float[] CLR_ROW_ALT    = { 1f,    0.98f, 0.92f };
    private static final float[] CLR_ROW_WHITE  = { 1f,    1f,    1f    };
    // Footer background – light orange
    private static final float[] CLR_FOOTER_BG  = { 0.99f, 0.88f, 0.65f };
    // Grid lines
    private static final float[] CLR_GRID       = { 0.50f, 0.50f, 0.50f };
    // Status text colours
    private static final float[] CLR_DONE       = { 0.05f, 0.50f, 0.05f };
    private static final float[] CLR_IN_PROG    = { 0.10f, 0.40f, 0.80f };
    private static final float[] CLR_ON_HOLD    = { 0.75f, 0.45f, 0.00f };
    private static final float[] CLR_CANCELLED  = { 0.75f, 0.10f, 0.10f };
    private static final float[] CLR_NOT_START  = { 0.40f, 0.40f, 0.40f };

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd-MM-yyyy");

    // ─────────────────────────────────────────────────────────────────────────

    public byte[] generateScheduleReport(PlanningWork work,
                                         List<PlanningLineItem> items) {
        try (PDDocument doc = new PDDocument()) {

            PDPage page = new PDPage(new PDRectangle(PAGE_W, PAGE_H));
            doc.addPage(page);

            PDFont bold = PDType1Font.HELVETICA_BOLD;
            PDFont reg  = PDType1Font.HELVETICA;

            try (PDPageContentStream cs = new PDPageContentStream(
                    doc, page, PDPageContentStream.AppendMode.OVERWRITE, true)) {

                float y = PAGE_H - MARGIN_Y;

                // ── Row 1: Title ──────────────────────────────────────────────
                y = drawTitleRow(cs, work, bold, y);

                // ── Row 2: Floors | Work Order No | Project Code ──────────────
                y = drawRow2(cs, work, bold, reg, y);

                // ── Row 3: Floors label | 249 NOS 15417 SQFT ─────────────────
                y = drawRow3(cs, work, bold, reg, y);

                // ── Blank gap row ─────────────────────────────────────────────
                y -= 4f;

                // ── Column header row ─────────────────────────────────────────
                y = drawColumnHeader(cs, bold, y);

                // ── Work Order Date row (special first data row) ──────────────
                y = drawWorkOrderDateRow(cs, work, reg, bold, y);

                // ── Data rows ─────────────────────────────────────────────────
                long totalDays = 0;
                // srNo uses item.getSrNo() if set, else sequential
                for (int i = 0; i < items.size(); i++) {
                    PlanningLineItem item = items.get(i);
                    long days = calcDays(item.getStartDate(), item.getEndDate());
                    totalDays += days;
                    boolean alt = (i % 2 == 0); // first row is white, second is alt
                    int srNo = item.getSrNo() != null ? item.getSrNo() : (i + 1);
                    y = drawDataRow(cs, reg, bold, item, srNo, days, alt, y);
                }

                // ── Footer: TOTAL DAYS ────────────────────────────────────────
                drawFooterRow(cs, bold, reg, totalDays, y);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    // ── ROW 1: Full-width orange title ────────────────────────────────────────

    private float drawTitleRow(PDPageContentStream cs,
                               PlanningWork work,
                               PDFont bold, float y) throws IOException {

        fillRect(cs, MARGIN_X, y - ROW_TITLE, TABLE_W, ROW_TITLE, CLR_ORANGE);
        drawHLine(cs, MARGIN_X, y,             TABLE_W, CLR_GRID);
        drawHLine(cs, MARGIN_X, y - ROW_TITLE, TABLE_W, CLR_GRID);
        drawVLine(cs, MARGIN_X,           y, ROW_TITLE, CLR_GRID);
        drawVLine(cs, MARGIN_X + TABLE_W, y, ROW_TITLE, CLR_GRID);

        String title = work.getProject() != null
                ? work.getProject().getProjectName().toUpperCase()
                : "PROJECT SCHEDULE";

        drawCentredText(cs, bold, FS_TITLE,
                MARGIN_X, y - ROW_TITLE, TABLE_W, ROW_TITLE,
                title, CLR_BLACK);

        return y - ROW_TITLE;
    }

    // ── ROW 2: [Floors/Work Name] | [Work Order No] | [Project Code] ─────────

    private float drawRow2(PDPageContentStream cs,
                           PlanningWork work,
                           PDFont bold, PDFont reg,
                           float y) throws IOException {

        // Split TABLE_W into 3 sections
        float col1W = TABLE_W * 0.30f;
        float col2W = TABLE_W * 0.42f;
        float col3W = TABLE_W - col1W - col2W;

        fillRect(cs, MARGIN_X,               y - ROW_HDR2, col1W, ROW_HDR2, CLR_HDR_LIGHT);
        fillRect(cs, MARGIN_X + col1W,       y - ROW_HDR2, col2W, ROW_HDR2, CLR_HDR_LIGHT);
        fillRect(cs, MARGIN_X + col1W + col2W, y - ROW_HDR2, col3W, ROW_HDR2, CLR_HDR_LIGHT);

        drawHLine(cs, MARGIN_X, y - ROW_HDR2, TABLE_W, CLR_GRID);
        drawVLine(cs, MARGIN_X,                   y, ROW_HDR2, CLR_GRID);
        drawVLine(cs, MARGIN_X + col1W,            y, ROW_HDR2, CLR_GRID);
        drawVLine(cs, MARGIN_X + col1W + col2W,    y, ROW_HDR2, CLR_GRID);
        drawVLine(cs, MARGIN_X + TABLE_W,          y, ROW_HDR2, CLR_GRID);

        String workName = work.getWorkName() != null
                ? work.getWorkName().toUpperCase() : "";

        String woNo = "WORK ORDER NO - "
                + (work.getWorkOrderNo() != null ? work.getWorkOrderNo().toUpperCase() : "");

        // projectCode – derive from workOrderNo or description if needed
        // In the image it shows "PROJECT CODE: ODL 1056"
        // We store it in description or derive; adapt as needed.
        String projCode = "PROJECT CODE: "
                + (work.getDescription() != null ? work.getDescription().toUpperCase() : "");

        // Col 1 – work name, centred
        drawCentredText(cs, bold, FS_HDR,
                MARGIN_X, y - ROW_HDR2, col1W, ROW_HDR2,
                workName, CLR_BLACK);

        // Col 2 – work order no, centred
        drawCentredText(cs, bold, FS_HDR,
                MARGIN_X + col1W, y - ROW_HDR2, col2W, ROW_HDR2,
                woNo, CLR_BLACK);

        // Col 3 – project code, centred
        drawCentredText(cs, bold, FS_HDR,
                MARGIN_X + col1W + col2W, y - ROW_HDR2, col3W, ROW_HDR2,
                projCode, CLR_BLACK);

        return y - ROW_HDR2;
    }

    // ── ROW 3: [Floors label] | [249] [NOS] [15417] [SQFT] ──────────────────
    // In the image: "30TH TO 35TH FLOORS" | 249 | NOS | 15417 | SQFT | (empty) | (empty)

    private float drawRow3(PDPageContentStream cs,
                           PlanningWork work,
                           PDFont bold, PDFont reg,
                           float y) throws IOException {

        // Section widths matching image proportions
        float s1 = TABLE_W * 0.30f;  // "30TH TO 35TH FLOORS"
        float s2 = TABLE_W * 0.08f;  // "249"
        float s3 = TABLE_W * 0.07f;  // "NOS"
        float s4 = TABLE_W * 0.08f;  // "15417"
        float s5 = TABLE_W * 0.07f;  // "SQFT"
        float s6 = TABLE_W - s1 - s2 - s3 - s4 - s5; // remainder

        float[] xs = {
                MARGIN_X,
                MARGIN_X + s1,
                MARGIN_X + s1 + s2,
                MARGIN_X + s1 + s2 + s3,
                MARGIN_X + s1 + s2 + s3 + s4,
                MARGIN_X + s1 + s2 + s3 + s4 + s5
        };
        float[] ws = { s1, s2, s3, s4, s5, s6 };

        for (int i = 0; i < xs.length; i++) {
            fillRect(cs, xs[i], y - ROW_HDR3, ws[i], ROW_HDR3, CLR_HDR_LIGHT);
            drawVLine(cs, xs[i], y, ROW_HDR3, CLR_GRID);
        }
        drawVLine(cs, MARGIN_X + TABLE_W, y, ROW_HDR3, CLR_GRID);
        drawHLine(cs, MARGIN_X, y - ROW_HDR3, TABLE_W, CLR_GRID);

        // Parse nos/sqft from workName or use placeholder fields
        // Image shows "249 NOS" and "15417 SQFT" as separate cells
        // We'll try to pull from work fields; adjust mapping as needed
        String floorsLabel = work.getWorkName() != null
                ? work.getWorkName().toUpperCase() : "";

        // If your entity has nos/sqft fields, replace these:
        String nos  = "249";   // replace with work.getNos() if field exists
        String sqft = "15417"; // replace with work.getSqft() if field exists

        drawCentredText(cs, reg, FS_HDR,
                xs[0], y - ROW_HDR3, ws[0], ROW_HDR3, floorsLabel, CLR_BLACK);
        drawCentredText(cs, bold, FS_HDR,
                xs[1], y - ROW_HDR3, ws[1], ROW_HDR3, nos, CLR_BLACK);
        drawCentredText(cs, bold, FS_HDR,
                xs[2], y - ROW_HDR3, ws[2], ROW_HDR3, "NOS", CLR_BLACK);
        drawCentredText(cs, bold, FS_HDR,
                xs[3], y - ROW_HDR3, ws[3], ROW_HDR3, sqft, CLR_BLACK);
        drawCentredText(cs, bold, FS_HDR,
                xs[4], y - ROW_HDR3, ws[4], ROW_HDR3, "SQFT", CLR_BLACK);
        // xs[5] left empty

        return y - ROW_HDR3;
    }

    // ── Column header row ─────────────────────────────────────────────────────

    private float drawColumnHeader(PDPageContentStream cs,
                                   PDFont bold, float y) throws IOException {

        String[] labels = {
                "SR NO.", "LINE ITEM", "START DATE", "END DATE",
                "DAYS", "DEPARTMENT", "ACTION PERSON", "STATUS", "REMARK"
        };

        fillRect(cs, MARGIN_X, y - ROW_COL_HDR, TABLE_W, ROW_COL_HDR, CLR_COL_HDR_BG);
        drawHLine(cs, MARGIN_X, y,              TABLE_W, CLR_GRID);
        drawHLine(cs, MARGIN_X, y - ROW_COL_HDR, TABLE_W, CLR_GRID);

        float x = MARGIN_X;
        for (int c = 0; c < labels.length; c++) {
            drawVLine(cs, x, y, ROW_COL_HDR, CLR_GRID);
            drawCentredText(cs, bold, FS_COL,
                    x, y - ROW_COL_HDR, COL_W[c], ROW_COL_HDR,
                    labels[c], CLR_BLACK);
            x += COL_W[c];
        }
        drawVLine(cs, x, y, ROW_COL_HDR, CLR_GRID);

        return y - ROW_COL_HDR;
    }

    // ── Special "WORK ORDER DATE" row (appears before SR 1 in the image) ──────

    private float drawWorkOrderDateRow(PDPageContentStream cs,
                                       PlanningWork work,
                                       PDFont reg, PDFont bold,
                                       float y) throws IOException {

        // White background, no SR no
        fillRect(cs, MARGIN_X, y - ROW_DATA, TABLE_W, ROW_DATA, CLR_ROW_WHITE);

        float x = MARGIN_X;
        for (int c = 0; c < COL_W.length; c++) {
            drawVLine(cs, x, y, ROW_DATA, CLR_GRID);
            if (c == 1) {
                // LINE ITEM column – "WORK ORDER DATE"
                drawLeftText(cs, reg, FS_DATA,
                        x + 4, y - ROW_DATA + (ROW_DATA - FS_DATA) / 2f + 1f,
                        "WORK ORDER DATE", CLR_BLACK);
            } else if (c == 2 && work.getStartDate() != null) {
                // START DATE column – show the work order date in bold
                drawCentredText(cs, bold, FS_DATA,
                        x, y - ROW_DATA, COL_W[c], ROW_DATA,
                        work.getStartDate().format(DATE_FMT), CLR_BLACK);
            } else if (c == 7) {
                // STATUS column – DONE
                drawCentredText(cs, reg, FS_DATA,
                        x, y - ROW_DATA, COL_W[c], ROW_DATA,
                        "DONE", CLR_DONE);
            }
            x += COL_W[c];
        }
        drawVLine(cs, x, y, ROW_DATA, CLR_GRID);
        drawHLine(cs, MARGIN_X, y - ROW_DATA, TABLE_W, CLR_GRID);

        return y - ROW_DATA;
    }

    // ── Draw one data row ─────────────────────────────────────────────────────

    private float drawDataRow(PDPageContentStream cs,
                              PDFont reg, PDFont bold,
                              PlanningLineItem item,
                              int srNo, long days,
                              boolean alt, float y) throws IOException {

        float[] bg = alt ? CLR_ROW_WHITE : CLR_ROW_ALT;
        fillRect(cs, MARGIN_X, y - ROW_DATA, TABLE_W, ROW_DATA, bg);

        String[] values = {
                String.valueOf(srNo),
                nvl(item.getLineItemName()),
                fmtDate(item.getStartDate()),
                fmtDate(item.getEndDate()),
                days >= 0 ? String.valueOf(days) : "0",
                nvl(item.getDepartment()),
                nvl(item.getActionPerson()),
                nvl(item.getStatus()),
                nvl(item.getRemark())
        };

        float x = MARGIN_X;
        for (int c = 0; c < values.length; c++) {
            drawVLine(cs, x, y, ROW_DATA, CLR_GRID);

            float textY = y - ROW_DATA + (ROW_DATA - FS_DATA) / 2f + 1f;

            switch (c) {
                case 0, 4 ->
                    // SR NO and DAYS – centred numeric
                        drawCentredText(cs, reg, FS_DATA,
                                x, y - ROW_DATA, COL_W[c], ROW_DATA,
                                values[c], CLR_BLACK);

                case 2, 3 ->
                    // Dates – centred
                        drawCentredText(cs, reg, FS_DATA,
                                x, y - ROW_DATA, COL_W[c], ROW_DATA,
                                values[c], CLR_BLACK);

                case 7 ->
                    // STATUS – coloured text, centred
                        drawStatusCell(cs, reg, x, y, COL_W[c], ROW_DATA, values[c]);

                default ->
                    // Line item, dept, action person, remark – left aligned
                        drawLeftText(cs, reg, FS_DATA,
                                x + 4, textY, values[c], CLR_BLACK);
            }
            x += COL_W[c];
        }
        drawVLine(cs, x, y, ROW_DATA, CLR_GRID);
        drawHLine(cs, MARGIN_X, y - ROW_DATA, TABLE_W, CLR_GRID);

        return y - ROW_DATA;
    }

    // ── Footer: TOTAL DAYS row ────────────────────────────────────────────────
    // In the image the "TOTAL DAYS" label spans up to the DAYS column,
    // and the number appears in the DAYS cell.

    private void drawFooterRow(PDPageContentStream cs,
                               PDFont bold, PDFont reg,
                               long totalDays, float y) throws IOException {

        fillRect(cs, MARGIN_X, y - ROW_FOOTER, TABLE_W, ROW_FOOTER, CLR_FOOTER_BG);
        drawHLine(cs, MARGIN_X, y,              TABLE_W, CLR_GRID);
        drawHLine(cs, MARGIN_X, y - ROW_FOOTER, TABLE_W, CLR_GRID);
        drawVLine(cs, MARGIN_X,           y, ROW_FOOTER, CLR_GRID);
        drawVLine(cs, MARGIN_X + TABLE_W, y, ROW_FOOTER, CLR_GRID);

        // "TOTAL DAYS" label – right-aligned into the column just before DAYS
        // DAYS column starts at: sum of COL_W[0..3]
        float daysColX = MARGIN_X + COL_W[0] + COL_W[1] + COL_W[2] + COL_W[3];
        float daysColW = COL_W[4];

        // Draw vertical separator before DAYS cell
        drawVLine(cs, daysColX, y, ROW_FOOTER, CLR_GRID);
        drawVLine(cs, daysColX + daysColW, y, ROW_FOOTER, CLR_GRID);

        float textY = y - ROW_FOOTER + (ROW_FOOTER - FS_COL) / 2f + 1f;

        // Label – right side of the block before DAYS
        drawRightText(cs, bold, FS_COL,
                MARGIN_X, textY, daysColX - MARGIN_X - 4f,
                "TOTAL DAYS", CLR_BLACK);

        // Value – centred in DAYS column
        drawCentredText(cs, bold, FS_COL,
                daysColX, y - ROW_FOOTER, daysColW, ROW_FOOTER,
                String.valueOf(totalDays), CLR_DONE);
    }

    // ── Status cell with colour ───────────────────────────────────────────────

    private void drawStatusCell(PDPageContentStream cs, PDFont font,
                                float x, float y,
                                float w, float h,
                                String status) throws IOException {
        float[] color;
        if (status == null || status.isBlank()) {
            color = CLR_NOT_START;
            status = "";
        } else {
            color = switch (status.trim().toUpperCase()) {
                case "DONE"         -> CLR_DONE;
                case "IN PROGRESS"  -> CLR_IN_PROG;
                case "ON HOLD"      -> CLR_ON_HOLD;
                case "CANCELLED"    -> CLR_CANCELLED;
                case "NOT STARTED"  -> CLR_NOT_START;
                default             -> CLR_NOT_START;
            };
        }
        if (!status.isBlank()) {
            drawCentredText(cs, font, FS_DATA,
                    x, y - h, w, h,
                    status.toUpperCase(), color);
        }
    }

    // ── Low-level drawing helpers ─────────────────────────────────────────────

    private void fillRect(PDPageContentStream cs,
                          float x, float y, float w, float h,
                          float[] rgb) throws IOException {
        cs.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
        cs.addRect(x, y, w, h);
        cs.fill();
        cs.setNonStrokingColor(0f, 0f, 0f);
    }

    private void drawHLine(PDPageContentStream cs,
                           float x, float y, float w,
                           float[] rgb) throws IOException {
        cs.setStrokingColor(rgb[0], rgb[1], rgb[2]);
        cs.setLineWidth(0.4f);
        cs.moveTo(x, y);
        cs.lineTo(x + w, y);
        cs.stroke();
    }

    private void drawVLine(PDPageContentStream cs,
                           float x, float y, float h,
                           float[] rgb) throws IOException {
        cs.setStrokingColor(rgb[0], rgb[1], rgb[2]);
        cs.setLineWidth(0.4f);
        cs.moveTo(x, y);
        cs.lineTo(x, y - h);
        cs.stroke();
    }

    private void drawCentredText(PDPageContentStream cs,
                                 PDFont font, float size,
                                 float cellX, float cellY,
                                 float cellW, float cellH,
                                 String text, float[] rgb) throws IOException {
        if (text == null || text.isBlank()) return;
        try {
            String t = truncate(font, size, text, cellW - 4f);
            float tw = font.getStringWidth(t) / 1000f * size;
            float tx = cellX + (cellW - tw) / 2f;
            float ty = cellY + (cellH - size) / 2f + 1f;
            drawText(cs, font, size, tx, ty, t, rgb);
        } catch (Exception ignored) {}
    }

    private void drawLeftText(PDPageContentStream cs,
                              PDFont font, float size,
                              float x, float y,
                              String text, float[] rgb) throws IOException {
        if (text == null || text.isBlank()) return;
        try {
            drawText(cs, font, size, x, y, truncate(font, size, text, 200f), rgb);
        } catch (Exception ignored) {}
    }

    private void drawRightText(PDPageContentStream cs,
                               PDFont font, float size,
                               float cellX, float y,
                               float cellW,
                               String text, float[] rgb) throws IOException {
        if (text == null || text.isBlank()) return;
        try {
            float tw = font.getStringWidth(text) / 1000f * size;
            float x  = cellX + cellW - tw;
            drawText(cs, font, size, x, y, text, rgb);
        } catch (Exception ignored) {}
    }

    private void drawText(PDPageContentStream cs,
                          PDFont font, float size,
                          float x, float y,
                          String text, float[] rgb) throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
        cs.setNonStrokingColor(0f, 0f, 0f);
    }

    private String truncate(PDFont font, float size,
                            String text, float maxW) throws IOException {
        if (text == null) return "";
        float w = font.getStringWidth(text) / 1000f * size;
        if (w <= maxW) return text;
        while (text.length() > 1) {
            text = text.substring(0, text.length() - 1);
            w = font.getStringWidth(text + "…") / 1000f * size;
            if (w <= maxW) return text + "…";
        }
        return text;
    }

    // ── Utilities ─────────────────────────────────────────────────────────────

    private long calcDays(LocalDate start, LocalDate end) {
        if (start == null || end == null) return 0;
        return Math.max(ChronoUnit.DAYS.between(start, end), 0);
    }

    private String fmtDate(LocalDate d) {
        return d != null ? d.format(DATE_FMT) : "";
    }

    private String nvl(String s) {
        return s != null ? s : "";
    }
}