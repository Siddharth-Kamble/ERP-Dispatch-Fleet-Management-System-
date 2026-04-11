
package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.*;
import onedeoleela.onedeoleela.Repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  EXPECTED EXCEL FORMAT  (Row 0 = header, data starts from Row 1)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Col Index │ Column Letter │ Field
 *  ──────────┼───────────────┼──────────────────────────────────────────
 *     0      │      A        │  SR. NO          (ignored / skipped)
 *     1      │      B        │  Window Series Number
 *     2      │      C        │  Floor Number    ← REQUIRED (Integer)
 *     3      │      D        │  Flat Number     ← REQUIRED (String)
 *     4      │      E        │  Location
 *     5      │      F        │  W-Code No
 *     6      │      G        │  Job Card No
 *     7      │      H        │  Series
 *     8      │      I        │  Description
 *     9      │      J        │  Width           (Double)
 *    10      │      K        │  Height          (Double)
 *    11      │      L        │  Track Outer     (Integer)
 *    12      │      M        │  Bottom Fix      (Integer)
 *    13      │      N        │  Glass Shutter   (Integer)
 *    14      │      O        │  Mesh Shutter    (Integer)
 *    15      │      P        │  Units           (Integer)
 *    16      │      Q        │  Sqft            (Double)
 *    17      │      R        │  Remark
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  UPLOAD RULES
 * ═══════════════════════════════════════════════════════════════════════
 *  RULE 1 — Completely blank row (all cells col 1-17 empty)
 *           → silently skipped, no DB entry, no alert
 *
 *  RULE 2 — Non-empty row where Floor OR Flat (or both) is missing
 *           → ENTIRE FILE rejected, NOTHING saved to the database
 *           → Response lists every row number that has the problem
 *           → User must fix the file and re-upload
 *
 *  RULE 3 — Non-empty row where Floor AND Flat are both present
 *           → saved normally; other empty cells default to 0 / ""
 *
 *  Upload is a TWO-PASS process:
 *    Pass 1 — scan every row, collect all validation errors, zero DB writes
 *    Pass 2 — only runs if Pass 1 found zero errors, then saves all rows
 * ═══════════════════════════════════════════════════════════════════════
 */
@Service
public class WindowService {

    private final WindowRepository windowRepository;
    private final TripRepository   tripRepository;
    private final FlatRepository   flatRepository;
    private final FloorRepository  floorRepository;
    private final TowerRepository  towerRepository;

    public WindowService(WindowRepository windowRepository,
                         TripRepository   tripRepository,
                         FlatRepository   flatRepository,
                         FloorRepository  floorRepository,
                         TowerRepository  towerRepository) {
        this.windowRepository = windowRepository;
        this.tripRepository   = tripRepository;
        this.flatRepository   = flatRepository;
        this.floorRepository  = floorRepository;
        this.towerRepository  = towerRepository;
    }

    public Trip getTripDetails(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    // ========== HELPER METHODS ==========

    private String getString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:  return cell.getStringCellValue().trim();
            case NUMERIC: return String.valueOf((long) cell.getNumericCellValue());
            default:      return "";
        }
    }

    private Double getDouble(Cell cell) {
        if (cell == null) return 0.0;
        switch (cell.getCellType()) {
            case NUMERIC: return cell.getNumericCellValue();
            case STRING:
                try { return Double.parseDouble(cell.getStringCellValue().trim()); }
                catch (Exception e) { return 0.0; }
            default: return 0.0;
        }
    }

    private Integer getInteger(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC)
                return (int) cell.getNumericCellValue();
            if (cell.getCellType() == CellType.STRING) {
                String value = cell.getStringCellValue().trim();
                if (value.isEmpty()) return null;
                return (int) Double.parseDouble(value); // handles "8.0"
            }
        } catch (Exception e) {
            System.out.println("⚠️ Invalid number format: " + cell.toString());
        }
        return null;
    }

    // ══════════════════════════════════════════════════════════════════
    //  isRowEmpty — scans ALL cells col 1..17
    //
    //  Returns true  → every cell is null / blank / whitespace
    //                  → row is completely empty → SKIP silently
    //
    //  Returns false → at least ONE cell has a real value
    //                  → row has data → must be validated and saved
    //
    //  Col 0 (SR.NO) is excluded — Excel sometimes auto-fills it
    //  even on rows that are otherwise completely blank.
    // ══════════════════════════════════════════════════════════════════
    private boolean isRowEmpty(Row row) {
        if (row == null) return true;

        for (int col = 1; col <= 17; col++) {
            Cell cell = row.getCell(col);

            if (cell == null)                          continue; // cell does not exist
            if (cell.getCellType() == CellType.BLANK)  continue; // explicitly blank

            // String cell: whitespace-only still counts as empty
            if (cell.getCellType() == CellType.STRING) {
                if (!cell.getStringCellValue().trim().isEmpty())
                    return false; // real text found → row is NOT empty
                continue;
            }

            // Any numeric value (including 0), boolean, formula → real data
            return false;
        }

        // All 17 columns were empty/null/blank → row is fully empty
        return true;
    }

    // ========== BULK UPLOAD — TWO-PASS ==========

    @Transactional
    public String bulkUpload(MultipartFile file, Long tripId, Long towerId) {
        try {
            System.out.println("=== BULK UPLOAD STARTED ===");
            System.out.println("tripId: " + tripId + " | towerId: " + towerId);

            // ── Fetch Trip ──
            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found"));
            System.out.println("✅ Trip found: " + trip.getId());

            // ── Fetch Tower ──
            Tower tower = towerRepository.findById(towerId)
                    .orElseThrow(() -> new RuntimeException("Tower not found: " + towerId));
            System.out.println("✅ Tower found: " + tower.getTowerName());

            // ── Open Excel ──
            Workbook workbook = new XSSFWorkbook(file.getInputStream());
            Sheet sheet       = workbook.getSheetAt(0);
            int lastRow       = sheet.getLastRowNum();
            System.out.println("✅ Total rows in sheet (including blanks): " + lastRow);

            // ════════════════════════════════════════════════════════════
            //  PASS 1 — VALIDATION SCAN — ZERO DB WRITES
            //
            //  Goal: collect ALL rows that have data but are missing
            //        Floor or Flat. If even one such row exists, the
            //        entire file is rejected and nothing is saved.
            // ════════════════════════════════════════════════════════════
            List<String> validationErrors = new ArrayList<>();

            for (int i = 1; i <= lastRow; i++) {
                Row row = sheet.getRow(i);

                // Completely blank row → skip silently, no validation needed
                if (isRowEmpty(row)) {
                    System.out.println("PASS1 ROW " + i + " → ⬜ completely blank, skipping");
                    continue;
                }

                // Row has data → Floor AND Flat are both mandatory
                Integer floorNumber = getInteger(row.getCell(2));
                String  flatNumber  = getString(row.getCell(3));

                // OPTIONAL: No validation error if floor/flat missing
// Only log for debugging (optional)
                if ((floorNumber == null || floorNumber == 0) && flatNumber.isEmpty()) {
                    System.out.println("PASS1 ROW " + i + " → ⚠️ Floor & Flat both missing (allowed)");
                }

//                boolean floorMissing = (floorNumber == null || floorNumber == 0);
//                boolean flatMissing  = flatNumber.isEmpty();
//
//                if (floorMissing || flatMissing) {
//                    // Build a specific, human-readable problem description
//                    String problem;
//                    if (floorMissing && flatMissing) {
//                        problem = "Both Floor Number and Flat Number are missing";
//                    } else if (floorMissing) {
//                        problem = "Floor Number is missing  (Flat present: '" + flatNumber + "')";
//                    } else {
//                        problem = "Flat Number is missing  (Floor present: " + floorNumber + ")";
//                    }
//
//                    validationErrors.add("Row " + i + "  →  " + problem);
//                    System.out.println("PASS1 ROW " + i + " → ❌ " + problem);
//                }
            }

            // ── If any errors found → reject the ENTIRE file ──
            System.out.println("=== PASS 1 COMPLETE — validation skipped (Floor/Flat optional) ===");
//            if (!validationErrors.isEmpty()) {
//                workbook.close();
//
//                StringBuilder alert = new StringBuilder();
//                alert.append("❌ UPLOAD REJECTED — Nothing has been saved to the database.\n\n");
//                alert.append("The following rows have missing Floor or Flat data:\n\n");
//                for (String err : validationErrors) {
//                    alert.append("  ⚠️  ").append(err).append("\n");
//                }
//                alert.append("\nTotal problem rows : ").append(validationErrors.size()).append("\n");
//                alert.append("Action required    : Fix the above rows in your Excel file and re-upload.");
//
//                System.out.println("=== UPLOAD REJECTED — " + validationErrors.size() + " error(s) found ===");
//
//                // HTTP 400 so the frontend receives the full alert text
//                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, alert.toString());
//            }

            System.out.println("=== PASS 1 COMPLETE — all non-empty rows are valid ===");
            System.out.println("=== PASS 2 STARTING — saving rows to database ===");

            // ════════════════════════════════════════════════════════════
            //  PASS 2 — SAVE
            //  Reached only when ZERO validation errors were found.
            //  Every non-empty row is now safe to persist.
            // ════════════════════════════════════════════════════════════
            int savedCount   = 0;
            int skippedCount = 0;

            for (int i = 1; i <= lastRow; i++) {
                try {
                    Row row = sheet.getRow(i);

                    // Completely blank row → skip silently
                    if (isRowEmpty(row)) {
                        System.out.println("PASS2 ROW " + i + " → ⬜ blank, skipping");
                        skippedCount++;
                        continue;
                    }

//                    Integer floorNumber = getInteger(row.getCell(2));
//                    String  flatNumber  = getString(row.getCell(3));
//
//                    System.out.println("PASS2 ROW " + i
//                            + " → floor: " + floorNumber
//                            + " | flat: "  + flatNumber);
//
//                    // Get or create Floor linked to tower
//                    Floor floor = getOrCreateFloor(floorNumber, tower);
//                    System.out.println("PASS2 ROW " + i + " → floor ID: " + floor.getFloorId());
//
//                    // Get or create Flat linked to floor
//                    Flat flat = getOrCreateFlat(flatNumber, floor);
//                    System.out.println("PASS2 ROW " + i + " → flat ID: " + flat.getFlatId());

                    Integer floorNumber = getInteger(row.getCell(2));
                    String  flatNumber  = getString(row.getCell(3));

                    System.out.println("PASS2 ROW " + i
                            + " → floor: " + floorNumber
                            + " | flat: "  + flatNumber);

                    Floor floor = null;
                    Flat flat = null;

// ✅ Create Floor ONLY if provided
                    if (floorNumber != null && floorNumber != 0) {
                        floor = getOrCreateFloor(floorNumber, tower);
                        System.out.println("PASS2 ROW " + i + " → floor ID: " + floor.getFloorId());

                        // ✅ Create Flat ONLY if provided AND floor exists
                        if (flatNumber != null && !flatNumber.isEmpty()) {
                            flat = getOrCreateFlat(flatNumber, floor);
                            System.out.println("PASS2 ROW " + i + " → flat ID: " + flat.getFlatId());
                        } else {
                            System.out.println("PASS2 ROW " + i + " → ⚠️ Flat missing (allowed)");
                        }

                    } else {
                        System.out.println("PASS2 ROW " + i + " → ⚠️ Floor missing (allowed)");
                    }
                    // Build Window — other empty cells default to 0 / ""
                    Window window = new Window();
                    window.setWindowSeriesNumber(getString(row.getCell(1)));   // Col 1
                    // Col 2 = Floor  → resolved above
                    // Col 3 = Flat   → resolved above
                    window.setLocation(getString(row.getCell(4)));              // Col 4
                    window.setWCodeNo(getString(row.getCell(5)));               // Col 5
                    window.setJobCardNo(getString(row.getCell(6)));             // Col 6
                    window.setSeries(getString(row.getCell(7)));                // Col 7
                    window.setDescription(getString(row.getCell(8)));           // Col 8
                    window.setWidth(getDouble(row.getCell(9)));                 // Col 9
                    window.setHeight(getDouble(row.getCell(10)));               // Col 10
                    window.setTrackOuter(getInteger(row.getCell(11)));          // Col 11
                    window.setBottomFix(getInteger(row.getCell(12)));           // Col 12
                    window.setGlassShutter(getInteger(row.getCell(13)));        // Col 13
                    window.setMeshShutter(getInteger(row.getCell(14)));         // Col 14
                    window.setUnits(getInteger(row.getCell(15)));               // Col 15
                    window.setSqft(getDouble(row.getCell(16)));                 // Col 16
                    window.setRemark(getString(row.getCell(17)));               // Col 17

                    // Null-safe defaults for optional Integer fields
                    if (window.getBottomFix()    == null) window.setBottomFix(0);
                    if (window.getGlassShutter() == null) window.setGlassShutter(0);
                    if (window.getMeshShutter()  == null) window.setMeshShutter(0);
                    if (window.getTrackOuter()   == null) window.setTrackOuter(0);
                    if (window.getUnits()        == null) window.setUnits(0);

                    // Set relations
                    window.setTrip(trip);
                    window.setFloor(floor);
                    window.setFlat(flat);

                    windowRepository.save(window);
                    savedCount++;
                    System.out.println("PASS2 ROW " + i + " → ✅ WINDOW SAVED");

                } catch (Exception rowEx) {
                    System.out.println("PASS2 ROW " + i + " → ❌ FAILED: " + rowEx.getMessage());
                    rowEx.printStackTrace();
                }
            }

            // Update tower.totalFloors after all rows saved
            updateTowerTotalFloors(tower);

            workbook.close();

            String successMsg = "✅ Bulk Upload Successful."
                    + " Windows saved: " + savedCount + "."
                    + " Blank rows skipped: " + skippedCount + ".";

            System.out.println("=== BULK UPLOAD COMPLETED === " + successMsg);
            return successMsg;

        } catch (ResponseStatusException rse) {
            throw rse; // re-throw validation rejections unchanged (already HTTP 400)
        } catch (Exception e) {
            System.out.println("❌ ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Bulk upload failed: " + e.getMessage());
        }
    }

    // ── Get or Create Floor linked to tower ──
    private Floor getOrCreateFloor(Integer floorNumber, Tower tower) {
        return floorRepository
                .findByFloorNumberAndTower_TowerId(floorNumber, tower.getTowerId())
                .orElseGet(() -> {
                    System.out.println("Creating new floor: " + floorNumber
                            + " under tower: " + tower.getTowerName());
                    Floor newFloor = new Floor();
                    newFloor.setFloorNumber(floorNumber);
                    newFloor.setTower(tower);
                    newFloor.setTotalFlats(0);
                    Floor saved = floorRepository.save(newFloor);
                    System.out.println("✅ New floor saved ID: " + saved.getFloorId());
                    return saved;
                });
    }


    private Flat getOrCreateFlat(String flatNumber, Floor floor) {

        // ✅ IMPORTANT: prevent crash if floor is null
        if (floor == null) {
            System.out.println("⚠️ Cannot create flat without floor");
            return null;
        }

        return flatRepository
                .findByFlatNumberAndFloor_FloorId(flatNumber, floor.getFloorId())
                .orElseGet(() -> {
                    System.out.println("Creating new flat: " + flatNumber
                            + " under floor: " + floor.getFloorNumber());

                    Flat flat = new Flat();
                    flat.setFlatNumber(flatNumber);
                    flat.setFloor(floor);

                    Flat saved = flatRepository.save(flat);

                    floor.setTotalFlats(
                            floor.getTotalFlats() == null ? 1 : floor.getTotalFlats() + 1
                    );
                    floorRepository.save(floor);

                    return saved;
                });
    }
//    // ── Get or Create Flat linked to floor, increments floor.totalFlats ──
//    private Flat getOrCreateFlat(String flatNumber, Floor floor) {
//        return flatRepository
//                .findByFlatNumberAndFloor_FloorId(flatNumber, floor.getFloorId())
//                .orElseGet(() -> {
//                    System.out.println("Creating new flat: " + flatNumber
//                            + " under floor: " + floor.getFloorNumber());
//                    Flat flat = new Flat();
//                    flat.setFlatNumber(flatNumber);
//                    flat.setFloor(floor);
//                    Flat saved = flatRepository.save(flat);
//                    floor.setTotalFlats(
//                            floor.getTotalFlats() == null ? 1 : floor.getTotalFlats() + 1
//                    );
//                    floorRepository.save(floor);
//                    System.out.println("✅ floor.totalFlats updated to: " + floor.getTotalFlats());
//                    return saved;
//                });
//    }

    // ── Update tower.totalFloors count after all rows saved ──
    private void updateTowerTotalFloors(Tower tower) {
        List<Floor> allFloors = floorRepository.findByTower_TowerId(tower.getTowerId());
        tower.setTotalFloors(allFloors.size());
        towerRepository.save(tower);
        System.out.println("✅ tower.totalFloors updated to: " + allFloors.size());
    }

    // ========== CREATE SINGLE WINDOW ==========

    public Window createWindow(Long tripId, String flatNumber, Long floorId, Window window) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trip not found"));

        if (floorId == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "FloorId is required");

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Floor not found"));

        Flat flat = flatRepository.findByFlatNumberAndFloor_FloorId(flatNumber, floorId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Flat not found"));

        window.setTrip(trip);
        window.setFloor(floor);
        window.setFlat(flat);

        if (window.getBottomFix()    == null) window.setBottomFix(0);
        if (window.getGlassShutter() == null) window.setGlassShutter(0);
        if (window.getMeshShutter()  == null) window.setMeshShutter(0);

        return windowRepository.save(window);
    }

    public List<Window> getWindowsByTrip(Long tripId) {
        return windowRepository.findByTrip_Id(tripId);
    }

    public List<Window> getAllWindows() {
        return windowRepository.findAll();
    }

    // ========== UPDATE WINDOW ==========

    public Window updateWindow(Long windowId, Window updatedWindow) {
        Window existing = windowRepository.findById(windowId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Window not found"));

        existing.setWindowSeriesNumber(updatedWindow.getWindowSeriesNumber());
        existing.setLocation(updatedWindow.getLocation());
        existing.setWCodeNo(updatedWindow.getWCodeNo());
        existing.setJobCardNo(updatedWindow.getJobCardNo());
        existing.setSeries(updatedWindow.getSeries());
        existing.setDescription(updatedWindow.getDescription());
        existing.setWidth(updatedWindow.getWidth());
        existing.setHeight(updatedWindow.getHeight());
        existing.setTrackOuter(updatedWindow.getTrackOuter());
        existing.setBottomFix(updatedWindow.getBottomFix()       != null ? updatedWindow.getBottomFix()     : 0);
        existing.setGlassShutter(updatedWindow.getGlassShutter() != null ? updatedWindow.getGlassShutter()  : 0);
        existing.setMeshShutter(updatedWindow.getMeshShutter()   != null ? updatedWindow.getMeshShutter()   : 0);
        existing.setUnits(updatedWindow.getUnits());
        existing.setSqft(updatedWindow.getSqft());
        existing.setRemark(updatedWindow.getRemark());

        if (updatedWindow.getFlat()  != null) existing.setFlat(updatedWindow.getFlat());
        if (updatedWindow.getFloor() != null) existing.setFloor(updatedWindow.getFloor());

        return windowRepository.save(existing);
    }
}