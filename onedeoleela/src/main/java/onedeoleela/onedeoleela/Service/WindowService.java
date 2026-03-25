

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

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trip not found")
                );

        Flat flat = flatRepository.findByFlatNumber(flatNumber)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Flat not found")
                );

        window.setTrip(trip);
        window.setFlat(flat);

        if (floorId != null) {
            Floor floor = floorRepository.findById(floorId)
                    .orElseThrow(() ->
                            new ResponseStatusException(HttpStatus.BAD_REQUEST, "Floor not found")
                    );
            window.setFloor(floor);
        }

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
            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found"));

            Workbook workbook = new XSSFWorkbook(file.getInputStream());
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null) continue;

                String flatNumber = getString(row.getCell(2));
                if (flatNumber.isEmpty()) continue;

                // STEP 1: Extract floor
                Integer floorNumber = extractFloorNumber(flatNumber);

                // STEP 2: Get/Create Floor
                Floor floor = getOrCreateFloor(floorNumber, projectId);

                // STEP 3: Get/Create Flat
                Flat flat = getOrCreateFlat(flatNumber, floor);

                // STEP 4: Create Window
                Window window = new Window();

                window.setWindowSeriesNumber(getString(row.getCell(1)));
                window.setLocation(getString(row.getCell(3)));
                window.setWCodeNo(getString(row.getCell(4)));
                window.setJobCardNo(getString(row.getCell(5)));
                window.setSeries(getString(row.getCell(6)));
                window.setDescription(getString(row.getCell(7)));

                window.setWidth(getDouble(row.getCell(8)));
                window.setHeight(getDouble(row.getCell(9)));

                Double trackOuterVal = getDouble(row.getCell(10));
                window.setTrackOuter(trackOuterVal != null ? trackOuterVal.intValue() : 0);

                Double unitsVal = getDouble(row.getCell(11));
                window.setUnits(unitsVal != null ? unitsVal.intValue() : 0);

                window.setSqft(getDouble(row.getCell(12)));
                window.setRemark(getString(row.getCell(13)));

                window.setTrip(trip);
                window.setFlat(flat);
                window.setFloor(floor);

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
}