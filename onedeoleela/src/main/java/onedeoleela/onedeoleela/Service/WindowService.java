//
//
//package onedeoleela.onedeoleela.Service;
//
//import onedeoleela.onedeoleela.Entity.*;
//
//import onedeoleela.onedeoleela.Repository.*;
//
//import org.apache.poi.ss.usermodel.*;
//import org.apache.poi.xssf.usermodel.XSSFWorkbook;
//import org.springframework.http.HttpStatus;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//import org.springframework.web.server.ResponseStatusException;
//
//
//import java.util.List;
//
//@Service
//public class WindowService {
//
//    private final WindowRepository windowRepository;
//    private final TripRepository tripRepository;
//    private final FlatRepository flatRepository;
//    private final FloorRepository floorRepository; // added for floor
//    private final TowerRepository towerRepository;
//
//    public WindowService(WindowRepository windowRepository,
//                         TripRepository tripRepository,
//                         FlatRepository flatRepository,
//                         FloorRepository floorRepository,  TowerRepository towerRepository) {
//        this.windowRepository = windowRepository;
//        this.tripRepository = tripRepository;
//        this.flatRepository = flatRepository;
//        this.floorRepository = floorRepository;
//        this.towerRepository = towerRepository;
//
//    }
//
//    public Trip getTripDetails(Long tripId) {
//        return tripRepository.findById(tripId)
//                .orElseThrow(() -> new RuntimeException("Trip not found"));
//    }
//
//
//    // Helper methods
//    private String getString(Cell cell) {
//        if (cell == null) return "";
//
//        switch (cell.getCellType()) {
//            case STRING:
//                return cell.getStringCellValue().trim();
//
//            case NUMERIC:
//                return String.valueOf((long) cell.getNumericCellValue()); // removes .0
//
//            default:
//                return "";
//        }
//    }
//
//    private Double getDouble(Cell cell) {
//        if (cell == null) return 0.0;
//
//        switch (cell.getCellType()) {
//            case NUMERIC:
//                return cell.getNumericCellValue();
//
//            case STRING:
//                try {
//                    return Double.parseDouble(cell.getStringCellValue());
//                } catch (Exception e) {
//                    return 0.0;
//                }
//
//            default:
//                return 0.0;
//        }
//    }
//
//    private Integer getInteger(Cell cell) {
//        if (cell == null) return 0;
//        if (cell.getCellType() == CellType.NUMERIC) return (int) cell.getNumericCellValue();
//        try { return Integer.parseInt(cell.toString()); }
//        catch (NumberFormatException e) { return 0; }
//    }
//
//
//
//
//
//    public Window createWindow(Long tripId, String flatNumber, Long floorId, Window window) {
//
//        // 1️⃣ Fetch the Trip
//        Trip trip = tripRepository.findById(tripId)
//                .orElseThrow(() ->
//                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trip not found")
//                );
//
//        // 2️⃣ Floor must be provided to uniquely identify the flat
//        if (floorId == null) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "FloorId is required to identify the flat");
//        }
//
//        Floor floor = floorRepository.findById(floorId)
//                .orElseThrow(() ->
//                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Floor not found")
//                );
//
//        // 3️⃣ Fetch the Flat using flatNumber + floorId
//        Flat flat = flatRepository.findByFlatNumberAndFloor_FloorId(flatNumber, floorId)
//                .orElseThrow(() ->
//                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Flat not found")
//                );
//
//        // 4️⃣ Set relations
//        window.setTrip(trip);
//        window.setFloor(floor);
//        window.setFlat(flat);
//
//        // 5️⃣ Set technical specs (optional: ensure null safety)
//        if (window.getBottomFix() == null) window.setBottomFix(0);
//        if (window.getGlassShutter() == null) window.setGlassShutter(0);
//        if (window.getMeshShutter() == null) window.setMeshShutter(0);
//
//        // 6️⃣ Save the Window
//        return windowRepository.save(window);
//    }
//    public List<Window> getWindowsByTrip(Long tripId) {
//        return windowRepository.findByTrip_Id(tripId);
//    }
//
//    public List<Window> getAllWindows() {
//        return windowRepository.findAll();
//    }
//
//
//
//
//    public String bulkUpload(MultipartFile file, Long tripId, Long towerId) {
//
//        try {
//            // 1️⃣ Fetch the Trip
//            Trip trip = tripRepository.findById(tripId)
//                    .orElseThrow(() -> new RuntimeException("Trip not found"));
//
//            // 2️⃣ Open Excel workbook
//            Workbook workbook = new XSSFWorkbook(file.getInputStream());
//            Sheet sheet = workbook.getSheetAt(0);
//
//            // 3️⃣ Iterate rows (skip header)
//            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
//                Row row = sheet.getRow(i);
//                if (row == null) continue;
//
//                // 4️⃣ Get Flat Number directly — no extraction needed
//                String flatNumber = getString(row.getCell(2));
//                if (flatNumber.isEmpty()) continue;
//
//                // 5️⃣ Get or create Floor using towerId
//                Floor floor = getOrCreateFloor(towerId);
//
//                // 6️⃣ Get or create Flat
//                Flat flat = getOrCreateFlat(flatNumber, floor);
//
//                // 7️⃣ Create Window object
//                Window window = new Window();
//                window.setWindowSeriesNumber(getString(row.getCell(1)));
//                window.setLocation(getString(row.getCell(3)));
//                window.setWCodeNo(getString(row.getCell(4)));
//                window.setJobCardNo(getString(row.getCell(5)));
//                window.setSeries(getString(row.getCell(6)));
//                window.setDescription(getString(row.getCell(7)));
//
//                // 8️⃣ Set dimensions
//                window.setWidth(getDouble(row.getCell(8)));
//                window.setHeight(getDouble(row.getCell(9)));
//
//                // 9️⃣ Set technical specs
//                window.setTrackOuter(getInteger(row.getCell(10)));
//                window.setBottomFix(getInteger(row.getCell(11)));
//                window.setGlassShutter(getInteger(row.getCell(12)));
//                window.setMeshShutter(getInteger(row.getCell(13)));
//                window.setUnits(getInteger(row.getCell(14)));
//                window.setSqft(getDouble(row.getCell(15)));
//                window.setRemark(getString(row.getCell(16)));
//
//                // 10️⃣ Set relations
//                window.setTrip(trip);
//                window.setFlat(flat);
//                window.setFloor(floor);
//
//                // 11️⃣ Save window
//                windowRepository.saveAndFlush(window);
//            }
//
//            workbook.close();
//            return "Bulk Upload Successful";
//
//        } catch (Exception e) {
//            throw new RuntimeException("Bulk upload failed: " + e.getMessage());
//        }
//    }
//
//    private Floor getOrCreateFloor(Long towerId) {
//        List<Floor> floors = floorRepository.findByTower_TowerId(towerId);
//
//        if (!floors.isEmpty()) {
//            return floors.get(0); // ← use existing floor
//        }
//
//        // Create new floor if not found
//        Tower tower = towerRepository.findById(towerId)
//                .orElseThrow(() -> new RuntimeException("Tower not found: " + towerId));
//
//        Floor newFloor = new Floor();
//        newFloor.setTower(tower);
//        newFloor.setTotalFlats(0);
//
//        return floorRepository.save(newFloor);
//    }
//    private Flat getOrCreateFlat(String flatNumber, Floor floor) {
//        return flatRepository
//                .findByFlatNumberAndFloor_FloorId(flatNumber, floor.getFloorId())
//                .orElseGet(() -> {
//                    Flat flat = new Flat();
//                    flat.setFlatNumber(flatNumber);
//                    flat.setFloor(floor);
//
//                    return flatRepository.save(flat);
//                });
//    }
//
//
//
//
//
//
//
//
//
//
////    public String bulkUpload(MultipartFile file, Long tripId, Long projectId) {
////
////        try {
////            // 1️⃣ Fetch the Trip
////            Trip trip = tripRepository.findById(tripId)
////                    .orElseThrow(() -> new RuntimeException("Trip not found"));
////
////            // 2️⃣ Open Excel workbook
////            Workbook workbook = new XSSFWorkbook(file.getInputStream());
////            Sheet sheet = workbook.getSheetAt(0);
////
////            // 3️⃣ Iterate rows (skip header)
////            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
////                Row row = sheet.getRow(i);
////                if (row == null) continue;
////
////                // 4️⃣ Get Flat Number
////                String flatNumber = getString(row.getCell(2));
////                if (flatNumber.isEmpty()) continue;
////
////                // 5️⃣ Extract Floor
////                Integer floorNumber = extractFloorNumber(flatNumber);
////
////                // 6️⃣ Get or create Floor
////                Floor floor = getOrCreateFloor(floorNumber, projectId);
////
////                // 7️⃣ Get or create Flat
////                Flat flat = getOrCreateFlat(flatNumber, floor);
////
////                // 8️⃣ Create Window object
////                Window window = new Window();
////                window.setWindowSeriesNumber(getString(row.getCell(1)));
////                window.setLocation(getString(row.getCell(3)));
////                window.setWCodeNo(getString(row.getCell(4)));
////                window.setJobCardNo(getString(row.getCell(5)));
////                window.setSeries(getString(row.getCell(6)));
////                window.setDescription(getString(row.getCell(7)));
////
////                // 9️⃣ Set dimensions
////                window.setWidth(getDouble(row.getCell(8)));
////                window.setHeight(getDouble(row.getCell(9)));
////
////                // 10️⃣ Set technical specs
////                window.setTrackOuter(getInteger(row.getCell(10)));       // Track Outer
////                window.setBottomFix(getInteger(row.getCell(11)));       // Bottom Fix ✅
////                window.setGlassShutter(getInteger(row.getCell(12)));    // Glass Shutter ✅
////                window.setMeshShutter(getInteger(row.getCell(13)));     // Mesh Shutter ✅
////                window.setUnits(getInteger(row.getCell(14)));           // Units
////                window.setSqft(getDouble(row.getCell(15)));             // SqFt
////                window.setRemark(getString(row.getCell(16)));           // Remark
////
////                // 11️⃣ Set relations
////                window.setTrip(trip);
////                window.setFlat(flat);
////                window.setFloor(floor);
////
////                // 12️⃣ Save window
////                windowRepository.save(window);
////            }
////
////            workbook.close();
////            return "Bulk Upload Successful";
////
////        } catch (Exception e) {
////            throw new RuntimeException("Bulk upload failed: " + e.getMessage());
////        }
////    }
////
////
////
////
////    private Floor getOrCreateFloor(Integer floorNumber, Long projectId) {
////
////        return floorRepository
////                .findByFloorNumberAndProject_ProjectId(floorNumber, projectId)
////                .orElseGet(() -> {
////                    Floor newFloor = new Floor();
////                    newFloor.setFloorNumber(floorNumber);
////
////                    Project project = projectRepository.findById(projectId)
////                            .orElseThrow(() -> new RuntimeException("Project not found"));
////
////                    newFloor.setProject(project);
////                    newFloor.setTotalFlats(0);
////
////                    return floorRepository.save(newFloor);
////                });
////    }
//
//
//
//
//    public Window updateWindow(Long windowId, Window updatedWindow) {
//        // 1️⃣ Fetch existing window
//        Window existingWindow = windowRepository.findById(windowId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Window not found"));
//
//        // 2️⃣ Update technical details
//        existingWindow.setWindowSeriesNumber(updatedWindow.getWindowSeriesNumber());
//        existingWindow.setLocation(updatedWindow.getLocation());
//        existingWindow.setWCodeNo(updatedWindow.getWCodeNo());
//        existingWindow.setJobCardNo(updatedWindow.getJobCardNo());
//        existingWindow.setSeries(updatedWindow.getSeries());
//        existingWindow.setDescription(updatedWindow.getDescription());
//        existingWindow.setWidth(updatedWindow.getWidth());
//        existingWindow.setHeight(updatedWindow.getHeight());
//        existingWindow.setTrackOuter(updatedWindow.getTrackOuter());
//        existingWindow.setBottomFix(updatedWindow.getBottomFix() != null ? updatedWindow.getBottomFix() : 0);
//        existingWindow.setGlassShutter(updatedWindow.getGlassShutter() != null ? updatedWindow.getGlassShutter() : 0);
//        existingWindow.setMeshShutter(updatedWindow.getMeshShutter() != null ? updatedWindow.getMeshShutter() : 0);
//        existingWindow.setUnits(updatedWindow.getUnits());
//        existingWindow.setSqft(updatedWindow.getSqft());
//        existingWindow.setRemark(updatedWindow.getRemark());
//
//        // 3️⃣ Optionally update Flat/Floor relationships
//        if (updatedWindow.getFlat() != null) {
//            existingWindow.setFlat(updatedWindow.getFlat());
//        }
//        if (updatedWindow.getFloor() != null) {
//            existingWindow.setFloor(updatedWindow.getFloor());
//        }
//
//        // 4️⃣ Save and return
//        return windowRepository.save(existingWindow);
//    }
//
//}


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

import java.util.List;

@Service
public class WindowService {

    private final WindowRepository windowRepository;
    private final TripRepository tripRepository;
    private final FlatRepository flatRepository;
    private final FloorRepository floorRepository;
    private final TowerRepository towerRepository;

    public WindowService(WindowRepository windowRepository,
                         TripRepository tripRepository,
                         FlatRepository flatRepository,
                         FloorRepository floorRepository,
                         TowerRepository towerRepository) {
        this.windowRepository = windowRepository;
        this.tripRepository = tripRepository;
        this.flatRepository = flatRepository;
        this.floorRepository = floorRepository;
        this.towerRepository = towerRepository;
    }

    public Trip getTripDetails(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    // ========== HELPER METHODS ==========

    private String getString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            default:
                return "";
        }
    }

    private Double getDouble(Cell cell) {
        if (cell == null) return 0.0;
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    return Double.parseDouble(cell.getStringCellValue());
                } catch (Exception e) {
                    return 0.0;
                }
            default:
                return 0.0;
        }
    }



    private Integer getInteger(Cell cell) {
        if (cell == null) return null;

        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (int) cell.getNumericCellValue();
            }

            if (cell.getCellType() == CellType.STRING) {
                String value = cell.getStringCellValue().trim();
                if (value.isEmpty()) return null;

                // Handle decimal like "8.0"
                return (int) Double.parseDouble(value);
            }

        } catch (Exception e) {
            System.out.println("⚠️ Invalid number format: " + cell.toString());
        }

        return null;
    }
//    private Integer getInteger(Cell cell) {
//        if (cell == null) return 0;
//        if (cell.getCellType() == CellType.NUMERIC) return (int) cell.getNumericCellValue();
//        try {
//            return Integer.parseInt(cell.toString());
//        } catch (NumberFormatException e) {
//            return 0;
//        }
//    }

    // ========== BULK UPLOAD ==========

    @Transactional
    public String bulkUpload(MultipartFile file, Long tripId, Long towerId) {
        try {
            System.out.println("=== BULK UPLOAD STARTED ===");
            System.out.println("tripId: " + tripId + " | towerId: " + towerId);

            // 1️⃣ Fetch Trip
            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found"));
            System.out.println("✅ Trip found: " + trip.getId());

            // 2️⃣ Fetch Tower once — reuse for all rows
            Tower tower = towerRepository.findById(towerId)
                    .orElseThrow(() -> new RuntimeException("Tower not found: " + towerId));
            System.out.println("✅ Tower found: " + tower.getTowerName());

            // 3️⃣ Open Excel
            Workbook workbook = new XSSFWorkbook(file.getInputStream());
            Sheet sheet = workbook.getSheetAt(0);
            System.out.println("✅ Total rows in Excel: " + sheet.getLastRowNum());

            // 4️⃣ Iterate rows (skip header row 0)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                try {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;

                    // Col 2 → Floor Number from Excel
                    Integer floorNumber = getInteger(row.getCell(2));
                    System.out.println("ROW " + i + " → floorNumber: " + floorNumber);
                    if (floorNumber == null || floorNumber == 0) {
                        System.out.println("ROW " + i + " → floorNumber empty, skipping");
                        continue;
                    }

                    // Col 3 → Flat Number from Excel
                    String flatNumber = getString(row.getCell(3));
                    System.out.println("ROW " + i + " → flatNumber: " + flatNumber);
                    if (flatNumber.isEmpty()) {
                        System.out.println("ROW " + i + " → flatNumber empty, skipping");
                        continue;
                    }

                    // ✅ Get or Create Floor → linked to tower
                    Floor floor = getOrCreateFloor(floorNumber, tower);
                    System.out.println("ROW " + i + " → floor ID: " + floor.getFloorId());

                    // ✅ Get or Create Flat → linked to floor
                    Flat flat = getOrCreateFlat(flatNumber, floor);
                    System.out.println("ROW " + i + " → flat ID: " + flat.getFlatId());

                    // Build Window
                    Window window = new Window();
                    window.setWindowSeriesNumber(getString(row.getCell(1)));  // Col 1
                    // Col 2 = Floor  → used above
                    // Col 3 = Flat   → used above
                    window.setLocation(getString(row.getCell(4)));             // Col 4
                    window.setWCodeNo(getString(row.getCell(5)));              // Col 5
                    window.setJobCardNo(getString(row.getCell(6)));            // Col 6
                    window.setSeries(getString(row.getCell(7)));               // Col 7
                    window.setDescription(getString(row.getCell(8)));          // Col 8
                    window.setWidth(getDouble(row.getCell(9)));                // Col 9
                    window.setHeight(getDouble(row.getCell(10)));              // Col 10
                    window.setTrackOuter(getInteger(row.getCell(11)));         // Col 11
                    window.setBottomFix(getInteger(row.getCell(12)));          // Col 12
                    window.setGlassShutter(getInteger(row.getCell(13)));       // Col 13
                    window.setMeshShutter(getInteger(row.getCell(14)));        // Col 14
                    window.setUnits(getInteger(row.getCell(15)));              // Col 15
                    window.setSqft(getDouble(row.getCell(16)));                // Col 16
                    window.setRemark(getString(row.getCell(17)));              // Col 17

                    // Set relations
                    window.setTrip(trip);
                    window.setFloor(floor);
                    window.setFlat(flat);

                    windowRepository.save(window);
                    System.out.println("ROW " + i + " → ✅ WINDOW SAVED");

                } catch (Exception rowEx) {
                    System.out.println("ROW " + i + " → ❌ FAILED: " + rowEx.getMessage());
                    rowEx.printStackTrace();
                }
            }

            // ✅ Update tower.totalFloors after all rows processed
            updateTowerTotalFloors(tower);

            workbook.close();
            System.out.println("=== BULK UPLOAD COMPLETED ===");
            return "Bulk Upload Successful";

        } catch (Exception e) {
            System.out.println("❌ ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Bulk upload failed: " + e.getMessage());
        }
    }

    // ✅ Floor: find by floorNumber + towerId
    // If not exists → create new floor linked to tower
    private Floor getOrCreateFloor(Integer floorNumber, Tower tower) {
        return floorRepository
                .findByFloorNumberAndTower_TowerId(floorNumber, tower.getTowerId())
                .orElseGet(() -> {
                    System.out.println("Creating new floor: " + floorNumber
                            + " under tower: " + tower.getTowerName());

                    Floor newFloor = new Floor();
                    newFloor.setFloorNumber(floorNumber);  // ✅ from Excel
                    newFloor.setTower(tower);               // ✅ linked to tower
                    newFloor.setTotalFlats(0);              // ✅ starts at 0

                    Floor savedFloor = floorRepository.save(newFloor);
                    System.out.println("✅ New floor saved ID: " + savedFloor.getFloorId());
                    return savedFloor;
                });
    }

    // ✅ Flat: find by flatNumber + floorId
    // If not exists → create new flat linked to floor
    // Also increments floor.totalFlats
    private Flat getOrCreateFlat(String flatNumber, Floor floor) {
        return flatRepository
                .findByFlatNumberAndFloor_FloorId(flatNumber, floor.getFloorId())
                .orElseGet(() -> {
                    System.out.println("Creating new flat: " + flatNumber
                            + " under floor: " + floor.getFloorNumber());

                    Flat flat = new Flat();
                    flat.setFlatNumber(flatNumber);
                    flat.setFloor(floor);

                    Flat savedFlat = flatRepository.save(flat);

                    // ✅ Increment floor.totalFlats
                    floor.setTotalFlats(
                            floor.getTotalFlats() == null ? 1 : floor.getTotalFlats() + 1
                    );
                    floorRepository.save(floor);
                    System.out.println("✅ floor.totalFlats updated to: " + floor.getTotalFlats());

                    return savedFlat;
                });
    }

    // ✅ Update tower.totalFloors count after upload
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

        if (floorId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "FloorId is required");
        }

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Floor not found"));

        Flat flat = flatRepository.findByFlatNumberAndFloor_FloorId(flatNumber, floorId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Flat not found"));

        window.setTrip(trip);
        window.setFloor(floor);
        window.setFlat(flat);

        if (window.getBottomFix() == null) window.setBottomFix(0);
        if (window.getGlassShutter() == null) window.setGlassShutter(0);
        if (window.getMeshShutter() == null) window.setMeshShutter(0);

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
        Window existingWindow = windowRepository.findById(windowId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Window not found"));

        existingWindow.setWindowSeriesNumber(updatedWindow.getWindowSeriesNumber());
        existingWindow.setLocation(updatedWindow.getLocation());
        existingWindow.setWCodeNo(updatedWindow.getWCodeNo());
        existingWindow.setJobCardNo(updatedWindow.getJobCardNo());
        existingWindow.setSeries(updatedWindow.getSeries());
        existingWindow.setDescription(updatedWindow.getDescription());
        existingWindow.setWidth(updatedWindow.getWidth());
        existingWindow.setHeight(updatedWindow.getHeight());
        existingWindow.setTrackOuter(updatedWindow.getTrackOuter());
        existingWindow.setBottomFix(updatedWindow.getBottomFix() != null ? updatedWindow.getBottomFix() : 0);
        existingWindow.setGlassShutter(updatedWindow.getGlassShutter() != null ? updatedWindow.getGlassShutter() : 0);
        existingWindow.setMeshShutter(updatedWindow.getMeshShutter() != null ? updatedWindow.getMeshShutter() : 0);
        existingWindow.setUnits(updatedWindow.getUnits());
        existingWindow.setSqft(updatedWindow.getSqft());
        existingWindow.setRemark(updatedWindow.getRemark());

        if (updatedWindow.getFlat() != null) existingWindow.setFlat(updatedWindow.getFlat());
        if (updatedWindow.getFloor() != null) existingWindow.setFloor(updatedWindow.getFloor());

        return windowRepository.save(existingWindow);
    }
}