



package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.PlanningHistory;
import onedeoleela.onedeoleela.Entity.PlanningLineItem;
import onedeoleela.onedeoleela.Entity.PlanningWork;
import onedeoleela.onedeoleela.Repository.PlanningHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.*;

/**
 * Generates a Project Schedule PDF.
 *
 * KEY CHANGES vs previous version:
 *
 *   1. REASON column is FULLY shown — text wraps across multiple lines.
 *      Row height expands dynamically to fit all wrapped lines.
 *      No more truncation with "...".
 *
 *   2. SEPARATOR LINE after each data row — drawn with a thicker (1.2pt),
 *      darker colour (#404040) line to give a professional, readable look.
 *
 *   3. Multi-page support — a new page is added automatically when the
 *      remaining vertical space cannot fit the next row.
 *
 * COLUMNS (11 total):
 *   SR NO | LINE ITEM | START DATE | END DATE | DAYS
 *   | DEPARTMENT | ACTION PERSON | STATUS | REASON | DELAY IN DAYS | REMARK
 */
@Service
public class PlanningReportService {

    @Autowired
    private PlanningHistoryRepository historyRepository;

    // ── Page: A4 Landscape ────────────────────────────────────────────────────
    private static final float PW = PDRectangle.A4.getHeight(); // 841.89
    private static final float PH = PDRectangle.A4.getWidth();  // 595.28
    private static final float MX = 14f;
    private static final float MY = 18f;
    private static final float TW = PW - 2 * MX;               // ≈ 813.89

    // ── Fixed row heights ─────────────────────────────────────────────────────
    private static final float H_TITLE   = 26f;
    private static final float H_SUB1    = 17f;
    private static final float H_SUB2    = 17f;
    private static final float H_GAP     =  4f;
    private static final float H_COLHDR  = 22f;
    private static final float H_DATA_MIN = 16f;  // minimum row height for data rows
    private static final float H_FOOTER  = 17f;

    // ── Font sizes ────────────────────────────────────────────────────────────
    private static final float FS_TITLE  = 11f;
    private static final float FS_SUB    =  8f;
    private static final float FS_COLHDR =  7f;
    private static final float FS_DATA   =  6.8f;
    private static final float LINE_LEAD =  8.5f; // line leading for wrapped text

    // ── 11 columns — must sum to TW ≈ 813.89 ─────────────────────────────────
    // SR | LINE ITEM | START | END | DAYS | DEPT | ACTION | STATUS | REASON | DELAY | REMARK
    private static final float[] CW = {
            22f,    // 0  SR NO.
            150f,   // 1  LINE ITEM
            54f,    // 2  START DATE
            54f,    // 3  END DATE
            26f,    // 4  DAYS
            85f,    // 5  DEPARTMENT
            88f,    // 6  ACTION PERSON
            56f,    // 7  STATUS
            118f,   // 8  REASON  ← wide enough to wrap nicely
            46f,    // 9  DELAY IN DAYS
            114.89f // 10 REMARK
    };

    // ── Colours ───────────────────────────────────────────────────────────────
    private static final float[] ORANGE    = c(245, 166,  35);
    private static final float[] TAN       = c(250, 215, 160);
    private static final float[] WHITE     = { 1f, 1f, 1f };
    private static final float[] CREAM     = c(254, 249, 240);
    private static final float[] GRID      = c(128, 128, 128);
    private static final float[] SEPARATOR = c( 64,  64,  64); // darker line between rows
    private static final float[] BLACK     = { 0f, 0f, 0f };
    private static final float[] RED       = c(204,   0,   0);
    private static final float[] GREEN     = c(  0, 102,   0);
    private static final float[] BLUE      = c( 25,  90, 200);
    private static final float[] AMBER     = c(160,  90,   0);

    private static float[] c(int r, int g, int b) {
        return new float[]{ r / 255f, g / 255f, b / 255f };
    }

    private static final DateTimeFormatter DF = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    // ─────────────────────────────────────────────────────────────────────────
    // ENTRY POINT
    // ─────────────────────────────────────────────────────────────────────────

    public byte[] generateScheduleReport(PlanningWork work,
                                         List<PlanningLineItem> items) {
        try (PDDocument doc = new PDDocument()) {

            PDFont bold = PDType1Font.HELVETICA_BOLD;
            PDFont reg  = PDType1Font.HELVETICA;

            Map<Long, Long>   delayMap  = buildDelayMap(items);
            Map<Long, String> reasonMap = buildReasonMap(items);

            // ── First page ────────────────────────────────────────────────────
            PDPage firstPage = new PDPage(new PDRectangle(PW, PH));
            doc.addPage(firstPage);

            // We'll hold a mutable reference so we can open new pages mid-loop
            PageContext ctx = new PageContext(doc, firstPage, bold, reg);

            float y = PH - MY;
            y = rowTitle(ctx.cs, bold, work, y);
            y = rowSub1(ctx.cs, bold, work, y);
            y = rowSub2(ctx.cs, bold, reg, work, y);
            y -= H_GAP;
            y = rowColHeader(ctx.cs, bold, y);
            y = rowWorkOrderDate(ctx.cs, reg, bold, work, y);

            long totalDays = 0;

            for (int i = 0; i < items.size(); i++) {
                PlanningLineItem item  = items.get(i);
                long days   = calcDays(item.getStartDate(), item.getEndDate());
                totalDays  += days;
                long   delay  = delayMap.getOrDefault(item.getId(), 0L);
                String reason = reasonMap.getOrDefault(item.getId(), "");
                int    sr     = item.getSrNo() != null ? item.getSrNo() : (i + 1);

                // Pre-calculate how tall this row needs to be (driven by reason wrapping)
                List<String> reasonLines = wrapText(reg, FS_DATA, reason, CW[8] - 6f);
                float rowH = Math.max(H_DATA_MIN,
                        reasonLines.size() * LINE_LEAD + 4f);

                // ── New page if not enough room ───────────────────────────────
                if (y - rowH - H_FOOTER < MY) {
                    // close current page stream
                    ctx.cs.close();

                    PDPage newPage = new PDPage(new PDRectangle(PW, PH));
                    doc.addPage(newPage);
                    ctx = new PageContext(doc, newPage, bold, reg);

                    y = PH - MY;
                    y = rowColHeader(ctx.cs, bold, y); // repeat headers on new page
                }

                y = rowData(ctx.cs, reg, bold, item, sr, days, delay,
                        reason, reasonLines, rowH, i % 2 == 1, y);
            }

            rowFooter(ctx.cs, bold, totalDays, y);
            ctx.cs.close();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    // ── Helper to manage page + content stream ────────────────────────────────
    private static class PageContext {
        PDPageContentStream cs;
        PageContext(PDDocument doc, PDPage page, PDFont bold, PDFont reg) throws IOException {
            cs = new PDPageContentStream(doc, page,
                    PDPageContentStream.AppendMode.OVERWRITE, true);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEXT WRAPPING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Breaks {@code text} into lines that each fit within {@code maxWidth} points
     * at font size {@code sz}. Splits on spaces; never splits mid-word unless the
     * word alone is wider than maxWidth.
     */
    private List<String> wrapText(PDFont font, float sz, String text, float maxWidth) {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isBlank()) {
            lines.add("");
            return lines;
        }
        String[] words = text.trim().split("\\s+");
        StringBuilder current = new StringBuilder();

        for (String word : words) {
            String candidate = current.length() == 0 ? word : current + " " + word;
            float w = textWidth(font, sz, candidate);
            if (w <= maxWidth) {
                current = new StringBuilder(candidate);
            } else {
                if (current.length() > 0) {
                    lines.add(current.toString());
                    current = new StringBuilder(word);
                } else {
                    // single word wider than column — force it
                    lines.add(word);
                }
            }
        }
        if (current.length() > 0) lines.add(current.toString());
        return lines;
    }

    private float textWidth(PDFont font, float sz, String text) {
        try { return font.getStringWidth(text) / 1000f * sz; }
        catch (Exception e) { return 0f; }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELAY MAP & REASON MAP
    // ─────────────────────────────────────────────────────────────────────────

    private Map<Long, Long> buildDelayMap(List<PlanningLineItem> items) {
        Map<Long, Long> map = new HashMap<>();
        for (PlanningLineItem item : items) {
            if (item.getId() == null) { map.put(null, 0L); continue; }
            List<PlanningHistory> hist =
                    historyRepository.findByLineItemIdOrderByChangedAtAsc(item.getId());
            Optional<PlanningHistory> firstStart = hist.stream()
                    .filter(h -> "startDate".equals(h.getField())
                            && h.getOldValue() != null && !h.getOldValue().isBlank())
                    .findFirst();
            if (firstStart.isPresent() && item.getStartDate() != null) {
                try {
                    LocalDate original = LocalDate.parse(firstStart.get().getOldValue());
                    map.put(item.getId(), ChronoUnit.DAYS.between(original, item.getStartDate()));
                } catch (Exception e) { map.put(item.getId(), 0L); }
            } else {
                map.put(item.getId(), 0L);
            }
        }
        return map;
    }

    /**
     * Returns the LATEST reason for each line item — full text, no truncation.
     * The PDF renderer handles wrapping.
     */
    private Map<Long, String> buildReasonMap(List<PlanningLineItem> items) {
        Map<Long, String> map = new HashMap<>();
        for (PlanningLineItem item : items) {
            if (item.getId() == null) { map.put(null, ""); continue; }
            List<PlanningHistory> hist =
                    historyRepository.findByLineItemIdOrderByChangedAtAsc(item.getId());
            if (hist.isEmpty()) {
                map.put(item.getId(), "");
            } else {
                PlanningHistory latest = hist.get(hist.size() - 1);
                // ✅ FULL reason — no substring / truncation here
                String reason = latest.getReason() != null ? latest.getReason().trim() : "";
                map.put(item.getId(), reason);
            }
        }
        return map;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ROW RENDERERS — header rows (fixed height)
    // ─────────────────────────────────────────────────────────────────────────

    private float rowTitle(PDPageContentStream cs, PDFont bold,
                           PlanningWork work, float y) throws IOException {
        fill(cs, MX, y - H_TITLE, TW, H_TITLE, ORANGE);
        box(cs, MX, y, TW, H_TITLE);
        String title = (work.getProject() != null && work.getProject().getProjectName() != null)
                ? work.getProject().getProjectName().toUpperCase()
                : "PROJECT SCHEDULE";
        cText(cs, bold, FS_TITLE, MX, y - H_TITLE, TW, H_TITLE, title, BLACK);
        return y - H_TITLE;
    }

    private float rowSub1(PDPageContentStream cs, PDFont bold,
                          PlanningWork work, float y) throws IOException {
        fill(cs, MX, y - H_SUB1, TW, H_SUB1, TAN);
        box(cs, MX, y, TW, H_SUB1);
        float c1 = TW * 0.285f, c2 = TW * 0.430f, c3 = TW - c1 - c2;
        vLine(cs, MX + c1,      y, H_SUB1);
        vLine(cs, MX + c1 + c2, y, H_SUB1);
        cText(cs, bold, FS_SUB, MX,           y - H_SUB1, c1, H_SUB1,
                nvl(work.getWorkName()).toUpperCase(), BLACK);
        cText(cs, bold, FS_SUB, MX + c1,      y - H_SUB1, c2, H_SUB1,
                "WORK ORDER NO - " + nvl(work.getWorkOrderNo()).toUpperCase(), BLACK);
        String projCode = work.getProject() != null
                ? "PROJECT CODE: " + nvl(work.getProject().getProjectCode()) : "";
        cText(cs, bold, FS_SUB, MX + c1 + c2, y - H_SUB1, c3, H_SUB1, projCode, BLACK);
        return y - H_SUB1;
    }

    private float rowSub2(PDPageContentStream cs, PDFont bold, PDFont reg,
                          PlanningWork work, float y) throws IOException {
        fill(cs, MX, y - H_SUB2, TW, H_SUB2, TAN);
        box(cs, MX, y, TW, H_SUB2);
        String[] p   = nvl(work.getDescription()).trim().split("\\s+");
        String nosV  = p.length > 0 ? p[0] : "";
        String sqftV = p.length > 2 ? p[2] : "";
        float c0 = TW * 0.285f, c1 = TW * 0.052f, c2 = TW * 0.055f,
                c3 = TW * 0.068f, c4 = TW * 0.055f;
        vLine(cs, MX + c0,                     y, H_SUB2);
        vLine(cs, MX + c0 + c1,                y, H_SUB2);
        vLine(cs, MX + c0 + c1 + c2,           y, H_SUB2);
        vLine(cs, MX + c0 + c1 + c2 + c3,      y, H_SUB2);
        vLine(cs, MX + c0 + c1 + c2 + c3 + c4, y, H_SUB2);
        cText(cs, bold, FS_SUB, MX + c0,                   y-H_SUB2, c1, H_SUB2, nosV,  BLACK);
        cText(cs, bold, FS_SUB, MX + c0 + c1,              y-H_SUB2, c2, H_SUB2, "NOS", BLACK);
        cText(cs, bold, FS_SUB, MX + c0 + c1 + c2,         y-H_SUB2, c3, H_SUB2, sqftV, BLACK);
        cText(cs, bold, FS_SUB, MX + c0 + c1 + c2 + c3,    y-H_SUB2, c4, H_SUB2, "SQFT",BLACK);
        return y - H_SUB2;
    }

    private float rowColHeader(PDPageContentStream cs, PDFont bold, float y) throws IOException {
        String[] labels = {
                "SR NO.", "LINE ITEM", "START DATE", "END DATE", "DAYS",
                "DEPARTMENT", "ACTION PERSON", "STATUS", "REASON", "DELAY IN\nDAYS", "REMARK"
        };
        fill(cs, MX, y - H_COLHDR, TW, H_COLHDR, TAN);
        box(cs, MX, y, TW, H_COLHDR);
        float x = MX;
        for (int col = 0; col < labels.length; col++) {
            vLine(cs, x, y, H_COLHDR);
            if (labels[col].contains("\n")) {
                String[] parts = labels[col].split("\n");
                float lineH = H_COLHDR / 2f;
                for (int li = 0; li < parts.length; li++) {
                    float lineY = y - H_COLHDR + (parts.length - li) * lineH;
                    cText(cs, bold, FS_COLHDR, x, lineY - lineH, CW[col], lineH, parts[li], BLACK);
                }
            } else {
                cText(cs, bold, FS_COLHDR, x, y - H_COLHDR, CW[col], H_COLHDR, labels[col], BLACK);
            }
            x += CW[col];
        }
        vLine(cs, x, y, H_COLHDR);
        return y - H_COLHDR;
    }

    private float rowWorkOrderDate(PDPageContentStream cs, PDFont reg, PDFont bold,
                                   PlanningWork work, float y) throws IOException {
        float rowH = H_DATA_MIN;
        fill(cs, MX, y - rowH, TW, rowH, WHITE);
        float x = MX;
        for (int col = 0; col < CW.length; col++) {
            vLine(cs, x, y, rowH);
            float ty = y - rowH + (rowH - FS_DATA) / 2f + 1.5f;
            if (col == 1) {
                lText(cs, reg, FS_DATA, x + 3f, ty, "WORK ORDER DATE", BLACK);
            } else if (col == 2 && work.getStartDate() != null) {
                cText(cs, bold, FS_DATA, x, y - rowH, CW[col], rowH,
                        work.getStartDate().format(DF), BLACK);
            } else if (col == 7) {
                cText(cs, reg, FS_DATA, x, y - rowH, CW[col], rowH, "DONE", GREEN);
            }
            x += CW[col];
        }
        vLine(cs, x, y, rowH);
        // separator after work order date row
        separatorLine(cs, MX, y - rowH, TW);
        return y - rowH;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DATA ROW — dynamic height, full reason wrapping
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Draws one data row with dynamic height.
     *
     * @param reasonLines pre-computed wrapped lines for the reason text
     * @param rowH        pre-computed row height (fits all reason lines)
     */
    private float rowData(PDPageContentStream cs, PDFont reg, PDFont bold,
                          PlanningLineItem item, int sr, long days, long delay,
                          String reason, List<String> reasonLines, float rowH,
                          boolean alt, float y) throws IOException {

        // ── Background fill ───────────────────────────────────────────────────
        fill(cs, MX, y - rowH, TW, rowH, alt ? CREAM : WHITE);

        String delayStr = delay > 0 ? "+" + delay : String.valueOf(delay);
        float[] delayClr = delay > 0 ? RED : GREEN;

        // ── Values for non-reason columns ─────────────────────────────────────
        String[] vals = {
                String.valueOf(sr),           // 0  SR NO.
                nvl(item.getLineItemName()),   // 1  LINE ITEM
                fmtD(item.getStartDate()),     // 2  START DATE
                fmtD(item.getEndDate()),       // 3  END DATE
                String.valueOf(days),          // 4  DAYS
                nvl(item.getDepartment()),     // 5  DEPARTMENT
                nvl(item.getActionPerson()),   // 6  ACTION PERSON
                nvl(item.getStatus()),         // 7  STATUS
                null,                          // 8  REASON — handled separately below
                delayStr,                      // 9  DELAY IN DAYS
                nvl(item.getRemark())          // 10 REMARK
        };

        float x = MX;
        for (int col = 0; col < CW.length; col++) {
            vLine(cs, x, y, rowH);

            if (col == 8) {
                // ── REASON: render each wrapped line ──────────────────────────
                // Start from top of cell with a small top-padding
                float topPad = 3f;
                float lineY  = y - topPad - FS_DATA; // baseline of first line

                for (String line : reasonLines) {
                    if (lineY < y - rowH + 2f) break; // safety — don't draw outside cell
                    lText(cs, reg, FS_DATA, x + 3f, lineY, line, BLACK);
                    lineY -= LINE_LEAD;
                }

            } else {
                // ── All other columns ─────────────────────────────────────────
                String v = vals[col] != null ? vals[col] : "";
                switch (col) {
                    case 0, 2, 3, 4 ->
                            cText(cs, reg, FS_DATA, x, y - rowH, CW[col], rowH, v, BLACK);
                    case 7 ->
                            cText(cs, reg, FS_DATA, x, y - rowH, CW[col], rowH,
                                    v, statusClr(v));
                    case 9 ->
                            cText(cs, bold, FS_DATA, x, y - rowH, CW[col], rowH,
                                    v, delayClr);
                    default -> {
                        // Wrap LINE ITEM, DEPARTMENT, ACTION PERSON, REMARK too
                        List<String> wrapped = wrapText(reg, FS_DATA, v, CW[col] - 5f);
                        float topPad = 3f;
                        float lineY  = y - topPad - FS_DATA;
                        for (String line : wrapped) {
                            if (lineY < y - rowH + 2f) break;
                            lText(cs, reg, FS_DATA, x + 3f, lineY, line, BLACK);
                            lineY -= LINE_LEAD;
                        }
                    }
                }
            }
            x += CW[col];
        }

        // ── Right border ──────────────────────────────────────────────────────
        vLine(cs, x, y, rowH);

        // ── Professional separator line after every row ───────────────────────
        separatorLine(cs, MX, y - rowH, TW);

        return y - rowH;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FOOTER
    // ─────────────────────────────────────────────────────────────────────────

    private void rowFooter(PDPageContentStream cs, PDFont bold,
                           long totalDays, float y) throws IOException {
        fill(cs, MX, y - H_FOOTER, TW, H_FOOTER, TAN);
        box(cs, MX, y, TW, H_FOOTER);
        float labelW = CW[0] + CW[1] + CW[2] + CW[3];
        float valX   = MX + labelW;
        vLine(cs, valX,         y, H_FOOTER);
        vLine(cs, valX + CW[4], y, H_FOOTER);
        cText(cs, bold, FS_COLHDR, MX,   y - H_FOOTER, labelW, H_FOOTER, "TOTAL DAYS", BLACK);
        cText(cs, bold, FS_COLHDR, valX, y - H_FOOTER, CW[4],  H_FOOTER,
                String.valueOf(totalDays), BLACK);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DRAWING PRIMITIVES
    // ─────────────────────────────────────────────────────────────────────────

    /** Solid fill rectangle. */
    private void fill(PDPageContentStream cs, float x, float y,
                      float w, float h, float[] rgb) throws IOException {
        cs.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
        cs.addRect(x, y, w, h);
        cs.fill();
        cs.setNonStrokingColor(0f, 0f, 0f);
    }

    /** Outer border rectangle (stroke only). */
    private void box(PDPageContentStream cs, float x, float topY,
                     float w, float h) throws IOException {
        cs.setStrokingColor(GRID[0], GRID[1], GRID[2]);
        cs.setLineWidth(0.5f);
        cs.addRect(x, topY - h, w, h);
        cs.stroke();
    }

    /** Thin vertical divider between columns. */
    private void vLine(PDPageContentStream cs, float x, float topY, float h) throws IOException {
        cs.setStrokingColor(GRID[0], GRID[1], GRID[2]);
        cs.setLineWidth(0.4f);
        cs.moveTo(x, topY);
        cs.lineTo(x, topY - h);
        cs.stroke();
    }

    /**
     * Professional separator line drawn at the BOTTOM of each data row.
     * Uses a thicker line (1.2pt) and a darker colour (#404040 = SEPARATOR)
     * to give a clean, grid-like appearance in the printed PDF.
     */
    private void separatorLine(PDPageContentStream cs, float x, float y, float w)
            throws IOException {
        cs.setStrokingColor(SEPARATOR[0], SEPARATOR[1], SEPARATOR[2]);
        cs.setLineWidth(1.2f);
        cs.moveTo(x, y);
        cs.lineTo(x + w, y);
        cs.stroke();
        // reset to default thin line for subsequent drawing
        cs.setStrokingColor(GRID[0], GRID[1], GRID[2]);
        cs.setLineWidth(0.4f);
    }

    /** Centred text inside a cell rectangle. */
    private void cText(PDPageContentStream cs, PDFont font, float sz,
                       float cx, float cy, float cw, float ch,
                       String text, float[] rgb) throws IOException {
        if (text == null || text.isBlank()) return;
        try {
            String t = trunc(font, sz, text, cw - 3f);
            float tw = font.getStringWidth(t) / 1000f * sz;
            float tx = cx + (cw - tw) / 2f;
            float ty = cy + (ch - sz) / 2f + 1.5f;
            dText(cs, font, sz, tx, ty, t, rgb);
        } catch (Exception ignored) {}
    }

    /** Left-aligned text at absolute (x, y). */
    private void lText(PDPageContentStream cs, PDFont font, float sz,
                       float x, float y, String text, float[] rgb) throws IOException {
        if (text == null || text.isBlank()) return;
        try { dText(cs, font, sz, x, y, text, rgb); }
        catch (Exception ignored) {}
    }

    /** Emit one text string at exact coordinates. */
    private void dText(PDPageContentStream cs, PDFont font, float sz,
                       float x, float y, String text, float[] rgb) throws IOException {
        if (text == null || text.isBlank()) return;
        try {
            cs.beginText();
            cs.setFont(font, sz);
            cs.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
            cs.newLineAtOffset(x, y);
            cs.showText(text);
            cs.endText();
            cs.setNonStrokingColor(0f, 0f, 0f);
        } catch (Exception ignored) {}
    }

    /**
     * Truncate text so it fits within maxW — used only for single-line centred
     * columns where wrapping is not appropriate (SR NO, dates, days, delay).
     */
    private String trunc(PDFont font, float sz, String text, float maxW) {
        if (text == null || text.isBlank()) return "";
        try {
            if (font.getStringWidth(text) / 1000f * sz <= maxW) return text;
            while (text.length() > 1) {
                text = text.substring(0, text.length() - 1);
                if (font.getStringWidth(text + ".") / 1000f * sz <= maxW) return text + ".";
            }
        } catch (Exception ignored) {}
        return text;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────

    private float[] statusClr(String s) {
        if (s == null) return BLACK;
        return switch (s.trim().toUpperCase()) {
            case "DONE"        -> GREEN;
            case "IN PROGRESS" -> BLUE;
            case "ON HOLD"     -> AMBER;
            case "CANCELLED"   -> RED;
            default            -> BLACK;
        };
    }

    private long calcDays(LocalDate s, LocalDate e) {
        if (s == null || e == null) return 0;
        return Math.max(0, ChronoUnit.DAYS.between(s, e));
    }

    private String fmtD(LocalDate d) { return d != null ? d.format(DF) : ""; }
    private String nvl(String s)     { return s != null ? s : ""; }
}