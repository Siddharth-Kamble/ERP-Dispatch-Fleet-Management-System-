



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
                return (int) Double.parseDouble(value);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Invalid number format: " + cell.toString());
        }
        return null;
    }

    // ══════════════════════════════════════════════════════════════════
    //  isRowEmpty — scans ALL cells col 1..16 (Floor column removed)
    // ══════════════════════════════════════════════════════════════════
    private boolean isRowEmpty(Row row) {
        if (row == null) return true;

        for (int col = 1; col <= 16; col++) {
            Cell cell = row.getCell(col);
            if (cell == null)                          continue;
            if (cell.getCellType() == CellType.BLANK)  continue;
            if (cell.getCellType() == CellType.STRING) {
                if (!cell.getStringCellValue().trim().isEmpty()) return false;
                continue;
            }
            return false;
        }
        return true;
    }

    // ========== BULK UPLOAD — TWO-PASS ==========

    // EXCEL COLUMN LAYOUT (Floor column removed):
    // Col 0 = SR.NO
    // Col 1 = Window Series No.
    // Col 2 = Flat Number
    // Col 3 = Location
    // Col 4 = W-Code No
    // Col 5 = Job Card No
    // Col 6 = Series
    // Col 7 = Description
    // Col 8 = Width
    // Col 9 = Height
    // Col 10 = Track Outer
    // Col 11 = Bottom Fix
    // Col 12 = Glass Shutter
    // Col 13 = Mesh Shutter
    // Col 14 = Units
    // Col 15 = Sqft
    // Col 16 = Remark

    @Transactional
    public String bulkUpload(MultipartFile file, Long tripId, Long towerId) {
        try {
            System.out.println("=== BULK UPLOAD STARTED ===");
            System.out.println("tripId: " + tripId + " | towerId: " + towerId);

            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found"));
            System.out.println("✅ Trip found: " + trip.getId());

            Tower tower = towerRepository.findById(towerId)
                    .orElseThrow(() -> new RuntimeException("Tower not found: " + towerId));
            System.out.println("✅ Tower found: " + tower.getTowerName());

            Workbook workbook = new XSSFWorkbook(file.getInputStream());
            Sheet sheet       = workbook.getSheetAt(0);
            int lastRow       = sheet.getLastRowNum();
            System.out.println("✅ Total rows in sheet (including blanks): " + lastRow);

            // PASS 1 — VALIDATION SCAN
            for (int i = 1; i <= lastRow; i++) {
                Row row = sheet.getRow(i);
                if (isRowEmpty(row)) {
                    System.out.println("PASS1 ROW " + i + " → ⬜ completely blank, skipping");
                    continue;
                }
                String flatNumber = getString(row.getCell(2));
                if (flatNumber.isEmpty()) {
                    System.out.println("PASS1 ROW " + i + " → ⚠️ Flat missing (allowed)");
                }
            }
            System.out.println("=== PASS 1 COMPLETE ===");
            System.out.println("=== PASS 2 STARTING — saving rows to database ===");

            // PASS 2 — SAVE
            int savedCount   = 0;
            int skippedCount = 0;

            for (int i = 1; i <= lastRow; i++) {
                try {
                    Row row = sheet.getRow(i);

                    if (isRowEmpty(row)) {
                        System.out.println("PASS2 ROW " + i + " → ⬜ blank, skipping");
                        skippedCount++;
                        continue;
                    }

                    // ✅ Col 2 = Flat Number
                    String flatNumber = getString(row.getCell(2));
                    System.out.println("PASS2 ROW " + i + " → flat from Excel: '" + flatNumber + "'");

                    Flat flat = null;

                    if (flatNumber != null && !flatNumber.isEmpty()) {
                        // ✅ KEY FIX: Use flatRepository to find or create flat directly by flatNumber under tower
                        flat = getOrCreateFlatByTower(flatNumber, tower);
                        if (flat != null) {
                            System.out.println("PASS2 ROW " + i + " → ✅ flat resolved: ID="
                                    + flat.getFlatId() + " flatNumber='" + flat.getFlatNumber() + "'");
                        } else {
                            System.out.println("PASS2 ROW " + i + " → ⚠️ flat is null after getOrCreate");
                        }
                    } else {
                        System.out.println("PASS2 ROW " + i + " → ⚠️ Flat missing (allowed)");
                    }

                    Window window = new Window();
                    window.setWindowSeriesNumber(getString(row.getCell(1)));   // Col 1
                    // Col 2 = Flat → resolved above
                    window.setLocation(getString(row.getCell(3)));              // Col 3
                    window.setWCodeNo(getString(row.getCell(4)));               // Col 4
                    window.setJobCardNo(getString(row.getCell(5)));             // Col 5
                    window.setSeries(getString(row.getCell(6)));                // Col 6
                    window.setDescription(getString(row.getCell(7)));           // Col 7
                    window.setWidth(getString(row.getCell(8)));                 // Col 8
                    window.setHeight(getString(row.getCell(9)));                // Col 9
                    window.setTrackOuter(getInteger(row.getCell(10)));          // Col 10
                    window.setBottomFix(getInteger(row.getCell(11)));           // Col 11
                    window.setGlassShutter(getInteger(row.getCell(12)));        // Col 12
                    window.setMeshShutter(getInteger(row.getCell(13)));         // Col 13
                    window.setUnits(getInteger(row.getCell(14)));               // Col 14
                    window.setSqft(getDouble(row.getCell(15)));                 // Col 15
                    window.setRemark(getString(row.getCell(16)));               // Col 16

                    if (window.getBottomFix()    == null) window.setBottomFix(0);
                    if (window.getGlassShutter() == null) window.setGlassShutter(0);
                    if (window.getMeshShutter()  == null) window.setMeshShutter(0);
                    if (window.getTrackOuter()   == null) window.setTrackOuter(0);
                    if (window.getUnits()        == null) window.setUnits(0);

                    window.setTrip(trip);
                    window.setFloor(null);
                    window.setFlat(flat);   // ✅ flat correctly assigned

                    Window saved = windowRepository.save(window);
                    savedCount++;
                    System.out.println("PASS2 ROW " + i + " → ✅ WINDOW SAVED id=" + saved.getWindowId()
                            + " flat=" + (saved.getFlat() != null ? saved.getFlat().getFlatNumber() : "null"));

                } catch (Exception rowEx) {
                    System.out.println("PASS2 ROW " + i + " → ❌ FAILED: " + rowEx.getMessage());
                    rowEx.printStackTrace();
                }
            }

            workbook.close();

            String successMsg = "✅ Bulk Upload Successful."
                    + " Windows saved: " + savedCount + "."
                    + " Blank rows skipped: " + skippedCount + ".";
            System.out.println("=== BULK UPLOAD COMPLETED === " + successMsg);
            return successMsg;

        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            System.out.println("❌ ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Bulk upload failed: " + e.getMessage());
        }
    }

    // ── Get or Create Flat using flat number within tower's floors ──
    // ✅ FIX: Uses flatRepository.findByFlatNumber (tower-wide search) to avoid
    //         the previous bug where flat was never found/created correctly
    private Flat getOrCreateFlatByTower(String flatNumber, Tower tower) {
        if (flatNumber == null || flatNumber.isEmpty()) return null;

        // Step 1: Search all floors under this tower for an existing flat with this number
        List<Floor> towerFloors = floorRepository.findByTower_TowerId(tower.getTowerId());
        System.out.println("  Searching " + towerFloors.size() + " floor(s) under tower '"
                + tower.getTowerName() + "' for flat '" + flatNumber + "'");

        for (Floor floor : towerFloors) {
            java.util.Optional<Flat> existing =
                    flatRepository.findByFlatNumberAndFloor_FloorId(flatNumber, floor.getFloorId());
            if (existing.isPresent()) {
                System.out.println("  ✅ Found existing flat: '" + flatNumber
                        + "' in floor " + floor.getFloorNumber());
                return existing.get();
            }
        }

        // Step 2: Flat not found anywhere under this tower → create it
        // Use floor 0 as default anchor floor (or the first existing floor)
        Floor anchorFloor;
        if (towerFloors.isEmpty()) {
            System.out.println("  No floors found under tower — creating default floor 0");
            anchorFloor = getOrCreateFloor(0, tower);
        } else {
            anchorFloor = towerFloors.get(0);
            System.out.println("  Attaching new flat to existing floor " + anchorFloor.getFloorNumber());
        }

        Flat newFlat = new Flat();
        newFlat.setFlatNumber(flatNumber);   // ✅ flatNumber is set here
        newFlat.setFloor(anchorFloor);

        // ✅ CRITICAL: save and immediately re-fetch to ensure the persisted entity
        //    has its ID populated and is not a detached/proxy object
        Flat saved = flatRepository.save(newFlat);
        // Re-fetch to get the fully managed entity with all fields populated
        Flat reloaded = flatRepository.findById(saved.getFlatId())
                .orElse(saved);

        anchorFloor.setTotalFlats(
                anchorFloor.getTotalFlats() == null ? 1 : anchorFloor.getTotalFlats() + 1
        );
        floorRepository.save(anchorFloor);

        System.out.println("  ✅ New flat created: ID=" + reloaded.getFlatId()
                + " flatNumber='" + reloaded.getFlatNumber() + "'");
        return reloaded;
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
        return windowRepository.findAllWithDetails();
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