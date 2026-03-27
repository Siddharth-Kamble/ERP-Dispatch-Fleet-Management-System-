

package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.*;

import onedeoleela.onedeoleela.Repository.*;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;


import java.util.List;

@Service
public class WindowService {

    private final WindowRepository windowRepository;
    private final TripRepository tripRepository;
    private final FlatRepository flatRepository;
    private final FloorRepository floorRepository; // added for floor
    private final ProjectRepository projectRepository;
    public WindowService(WindowRepository windowRepository,
                         TripRepository tripRepository,
                         FlatRepository flatRepository,
                         FloorRepository floorRepository, ProjectRepository projectRepository) {
        this.windowRepository = windowRepository;
        this.tripRepository = tripRepository;
        this.flatRepository = flatRepository;
        this.floorRepository = floorRepository;

        this.projectRepository = projectRepository;
    }

    public Trip getTripDetails(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }


    // Helper methods
    private String getString(Cell cell) {
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();

            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue()); // removes .0

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
        if (cell == null) return 0;
        if (cell.getCellType() == CellType.NUMERIC) return (int) cell.getNumericCellValue();
        try { return Integer.parseInt(cell.toString()); }
        catch (NumberFormatException e) { return 0; }
    }





    public Window createWindow(Long tripId, String flatNumber, Long floorId, Window window) {

        // 1️⃣ Fetch the Trip
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trip not found")
                );

        // 2️⃣ Floor must be provided to uniquely identify the flat
        if (floorId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "FloorId is required to identify the flat");
        }

        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Floor not found")
                );

        // 3️⃣ Fetch the Flat using flatNumber + floorId
        Flat flat = flatRepository.findByFlatNumberAndFloor_FloorId(flatNumber, floorId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Flat not found")
                );

        // 4️⃣ Set relations
        window.setTrip(trip);
        window.setFloor(floor);
        window.setFlat(flat);

        // 5️⃣ Set technical specs (optional: ensure null safety)
        if (window.getBottomFix() == null) window.setBottomFix(0);
        if (window.getGlassShutter() == null) window.setGlassShutter(0);
        if (window.getMeshShutter() == null) window.setMeshShutter(0);

        // 6️⃣ Save the Window
        return windowRepository.save(window);
    }
    public List<Window> getWindowsByTrip(Long tripId) {
        return windowRepository.findByTrip_Id(tripId);
    }

    public List<Window> getAllWindows() {
        return windowRepository.findAll();
    }

    public String bulkUpload(MultipartFile file, Long tripId, Long projectId) {

        try {
            // 1️⃣ Fetch the Trip
            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found"));

            // 2️⃣ Open Excel workbook
            Workbook workbook = new XSSFWorkbook(file.getInputStream());
            Sheet sheet = workbook.getSheetAt(0);

            // 3️⃣ Iterate rows (skip header)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // 4️⃣ Get Flat Number
                String flatNumber = getString(row.getCell(2));
                if (flatNumber.isEmpty()) continue;

                // 5️⃣ Extract Floor
                Integer floorNumber = extractFloorNumber(flatNumber);

                // 6️⃣ Get or create Floor
                Floor floor = getOrCreateFloor(floorNumber, projectId);

                // 7️⃣ Get or create Flat
                Flat flat = getOrCreateFlat(flatNumber, floor);

                // 8️⃣ Create Window object
                Window window = new Window();
                window.setWindowSeriesNumber(getString(row.getCell(1)));
                window.setLocation(getString(row.getCell(3)));
                window.setWCodeNo(getString(row.getCell(4)));
                window.setJobCardNo(getString(row.getCell(5)));
                window.setSeries(getString(row.getCell(6)));
                window.setDescription(getString(row.getCell(7)));

                // 9️⃣ Set dimensions
                window.setWidth(getDouble(row.getCell(8)));
                window.setHeight(getDouble(row.getCell(9)));

                // 10️⃣ Set technical specs
                window.setTrackOuter(getInteger(row.getCell(10)));       // Track Outer
                window.setBottomFix(getInteger(row.getCell(11)));       // Bottom Fix ✅
                window.setGlassShutter(getInteger(row.getCell(12)));    // Glass Shutter ✅
                window.setMeshShutter(getInteger(row.getCell(13)));     // Mesh Shutter ✅
                window.setUnits(getInteger(row.getCell(14)));           // Units
                window.setSqft(getDouble(row.getCell(15)));             // SqFt
                window.setRemark(getString(row.getCell(16)));           // Remark

                // 11️⃣ Set relations
                window.setTrip(trip);
                window.setFlat(flat);
                window.setFloor(floor);

                // 12️⃣ Save window
                windowRepository.save(window);
            }

            workbook.close();
            return "Bulk Upload Successful";

        } catch (Exception e) {
            throw new RuntimeException("Bulk upload failed: " + e.getMessage());
        }
    }




    private Floor getOrCreateFloor(Integer floorNumber, Long projectId) {

        return floorRepository
                .findByFloorNumberAndProject_ProjectId(floorNumber, projectId)
                .orElseGet(() -> {
                    Floor newFloor = new Floor();
                    newFloor.setFloorNumber(floorNumber);

                    Project project = projectRepository.findById(projectId)
                            .orElseThrow(() -> new RuntimeException("Project not found"));

                    newFloor.setProject(project);
                    newFloor.setTotalFlats(0);

                    return floorRepository.save(newFloor);
                });
    }

    private Flat getOrCreateFlat(String flatNumber, Floor floor) {

        return flatRepository
                .findByFlatNumberAndFloor_FloorId(flatNumber, floor.getFloorId())
                .orElseGet(() -> {
                    Flat flat = new Flat();
                    flat.setFlatNumber(flatNumber);
                    flat.setFloor(floor);

                    return flatRepository.save(flat);
                });
    }
    private Integer extractFloorNumber(String flatNumber) {
        try {
            return Integer.parseInt(flatNumber.substring(0, 2)); // 1902 → 19
        } catch (Exception e) {
            return 0;
        }
    }

    public Window updateWindow(Long windowId, Window updatedWindow) {
        // 1️⃣ Fetch existing window
        Window existingWindow = windowRepository.findById(windowId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Window not found"));

        // 2️⃣ Update technical details
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

        // 3️⃣ Optionally update Flat/Floor relationships
        if (updatedWindow.getFlat() != null) {
            existingWindow.setFlat(updatedWindow.getFlat());
        }
        if (updatedWindow.getFloor() != null) {
            existingWindow.setFloor(updatedWindow.getFloor());
        }

        // 4️⃣ Save and return
        return windowRepository.save(existingWindow);
    }
}