package onedeoleela.onedeoleela.Service;


import onedeoleela.onedeoleela.Entity.*;
import onedeoleela.onedeoleela.Repository.*;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ItemService {


    private final ItemRepository itemRepository;
    private final FloorRepository floorRepository;
    private final FlatRepository flatRepository;
    private final TripRepository tripRepository;
    private final ProjectRepository projectRepository;
    private final TowerRepository towerRepository;
    public ItemService(ItemRepository itemRepository, FloorRepository floorRepository, FlatRepository flatRepository, TripRepository tripRepository, ProjectRepository projectRepository, TowerRepository towerRepository) {
        this.itemRepository = itemRepository;
        this.floorRepository = floorRepository;
        this.flatRepository = flatRepository;
        this.tripRepository = tripRepository;
        this.projectRepository = projectRepository;

        this.towerRepository = towerRepository;
    }

    // Create or Update an Item
    public Item saveItem(Item item) {
        return itemRepository.save(item);
    }

    // Get all Items
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    // Get Item by ID
    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }

    // Delete Item
    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }
//
//    public String bulkUpload(MultipartFile file, Long tripId, Long projectId, Long towerId) {
//        try {
//            // 1️⃣ Fetch Trip
//            Trip trip = tripRepository.findById(tripId)
//                    .orElseThrow(() -> new RuntimeException("Trip not found"));
//
//            // 2️⃣ Fetch Tower
//            Tower tower = towerRepository.findById(towerId)
//                    .orElseThrow(() -> new RuntimeException("Tower not found"));
//
//            Workbook workbook = new XSSFWorkbook(file.getInputStream());
//            Sheet sheet = workbook.getSheetAt(0);
//
//            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
//                Row row = sheet.getRow(i);
//                if (row == null) continue;
//
//                String flatNumber = getString(row.getCell(2));
//                if (flatNumber.isEmpty()) continue;
//
//                Integer floorNumber = extractFloorNumber(flatNumber);
//
//                // ✅ Pass towerId instead of projectId
//                Floor floor = getOrCreateFloor(floorNumber, towerId);
//
//                Flat flat = getOrCreateFlat(flatNumber, floor);
//
//                Item item = new Item();
//                item.setSrNo(getInteger(row.getCell(0)));
//                item.setWinSrNo(getString(row.getCell(1)));
//                item.setFlatNo(flatNumber);
//                item.setLocation(getString(row.getCell(3)));
//                item.setJobCardNo(getString(row.getCell(4)));
//                item.setDescription(getString(row.getCell(5)));
//                item.setWidth(getDouble(row.getCell(6)));
//                item.setHeight(getDouble(row.getCell(7)));
//                item.setQty(getInteger(row.getCell(8)));
//                item.setUnit(getString(row.getCell(9)));
//                item.setSqFt(getDouble(row.getCell(10)));
//                item.setRemarks(getString(row.getCell(11)));
//
//                // ✅ SET RELATIONS
//                item.setTrip(trip);
//                item.setFlat(flat);
//                item.setFloor(floor);
//                item.setTower(tower);   // ✅ NEW
//
//                itemRepository.save(item);
//            }
//
//            workbook.close();
//            return "Bulk Upload Successful";
//
//        } catch (Exception e) {
//            throw new RuntimeException("Bulk upload failed: " + e.getMessage());
//        }
//    }

    public String bulkUpload(MultipartFile file, Long tripId, Long projectId, Long towerId) throws Exception {

        // 1. Find Trip
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));

        // 2. Find Project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));

        // 3. Find Tower
        Tower tower = towerRepository.findById(towerId)
                .orElseThrow(() -> new RuntimeException("Tower not found with ID: " + towerId));

        // 4. Read Excel File
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<Item> itemsToSave = new ArrayList<>();

        // 5. Loop through rows (skip header row at index 0)
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            Item item = new Item();

            item.setSrNo(getCellIntValue(row, 0));
            item.setWinSrNo(getCellStringValue(row, 1));
            item.setFlatNo(getCellStringValue(row, 2));
            item.setLocation(getCellStringValue(row, 3));
            item.setJobCardNo(getCellStringValue(row, 4));
            item.setDescription(getCellStringValue(row, 5));
            item.setWidth(getCellDoubleValue(row, 6));
            item.setHeight(getCellDoubleValue(row, 7));
            item.setQty(getCellIntValue(row, 8));
            item.setUnit(getCellStringValue(row, 9));
            item.setSqFt(getCellDoubleValue(row, 10));
            item.setRemarks(getCellStringValue(row, 11));

            // 6. Set relationships
            item.setTrip(trip);
            item.setTower(tower);

            itemsToSave.add(item);
        }

        workbook.close();

        // 7. Save all items
        itemRepository.saveAll(itemsToSave);

        return "Bulk upload successful! " + itemsToSave.size() + " items uploaded.";
    }

// ─── Helper Methods ───────────────────────────────────────────

    private String getCellStringValue(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }

    private Double getCellDoubleValue(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return 0.0;
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING -> {
                try { yield Double.parseDouble(cell.getStringCellValue().trim()); }
                catch (NumberFormatException e) { yield 0.0; }
            }
            default -> 0.0;
        };
    }

    private Integer getCellIntValue(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return 0;
        return switch (cell.getCellType()) {
            case NUMERIC -> (int) cell.getNumericCellValue();
            case STRING -> {
                try { yield Integer.parseInt(cell.getStringCellValue().trim()); }
                catch (NumberFormatException e) { yield 0; }
            }
            default -> 0;
        };
    }

//    public String bulkUpload(MultipartFile file, Long tripId, Long projectId) {
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
//                // 4️⃣ Get Flat Number
//                String flatNumber = getString(row.getCell(2));
//                if (flatNumber.isEmpty()) continue;
//
//                // 5️⃣ Extract Floor number from flat (custom logic)
//                Integer floorNumber = extractFloorNumber(flatNumber);
//
//                // 6️⃣ Get or create Floor
//                Floor floor = getOrCreateFloor(floorNumber, projectId);
//
//                // 7️⃣ Get or create Flat
//                Flat flat = getOrCreateFlat(flatNumber, floor);
//
//                // 8️⃣ Create Item object
//                Item item = new Item();
//                item.setSrNo(getInteger(row.getCell(0)));
//                item.setWinSrNo(getString(row.getCell(1)));
//                item.setFlatNo(flatNumber);
//                item.setLocation(getString(row.getCell(3)));
//                item.setJobCardNo(getString(row.getCell(4)));
//                item.setDescription(getString(row.getCell(5)));
//                item.setWidth(getDouble(row.getCell(6)));
//                item.setHeight(getDouble(row.getCell(7)));
//                item.setQty(getInteger(row.getCell(8)));
//                item.setUnit(getString(row.getCell(9)));
//                item.setSqFt(getDouble(row.getCell(10)));
//                item.setRemarks(getString(row.getCell(11)));
//
//                // 9️⃣ Set relations
//                item.setTrip(trip);
//                item.setFlat(flat);
//                item.setFloor(floor);
//
//                // 10️⃣ Save Item
//                itemRepository.save(item);
//            }
//
//            workbook.close();
//            return "Bulk Upload Successful";
//
//        } catch (Exception e) {
//            throw new RuntimeException("Bulk upload failed: " + e.getMessage());
//        }
//    }

    // Helper methods to read cell values safely
    private String getString(Cell cell) {
        return cell == null ? "" : cell.toString().trim();
    }

    private Integer getInteger(Cell cell) {
        if (cell == null) return 0;
        if (cell.getCellType() == CellType.NUMERIC) return (int) cell.getNumericCellValue();
        try { return Integer.parseInt(cell.getStringCellValue()); }
        catch (Exception e) { return 0; }
    }

    private Double getDouble(Cell cell) {
        if (cell == null) return 0.0;
        if (cell.getCellType() == CellType.NUMERIC) return cell.getNumericCellValue();
        try { return Double.parseDouble(cell.getStringCellValue()); }
        catch (Exception e) { return 0.0; }
    }

    // You need to implement these according to your logic
    private Integer extractFloorNumber(String flatNumber) {
        // Example: If flatNumber="F203", floor=2
        try {
            return Integer.parseInt(flatNumber.replaceAll("[^0-9]", "").substring(0,1));
        } catch (Exception e) {
            return 0; // default floor
        }
    }

//    private Floor getOrCreateFloor(Integer floorNumber, Long projectId) {
//        // Fetch floor by number and project, or create if not exists
//        return floorRepository.findByFloorNumberAndProject_ProjectId(floorNumber, projectId)
//                .orElseGet(() -> {
//                    Floor floor = new Floor();
//                    floor.setFloorNumber(floorNumber);
//                    floor.setProject(projectRepository.findById(projectId).orElseThrow());
//                    return floorRepository.save(floor);
//                });
//    }
private Floor getOrCreateFloor(Integer floorNumber, Long towerId) {

    return floorRepository
            .findByFloorNumberAndTower_TowerId(floorNumber, towerId)
            .orElseGet(() -> {
                Floor floor = new Floor();
                floor.setFloorNumber(floorNumber);

                Tower tower = towerRepository.findById(towerId)
                        .orElseThrow(() -> new RuntimeException("Tower not found"));

                floor.setTower(tower);

                return floorRepository.save(floor);
            });
}
    private Flat getOrCreateFlat(String flatNumber, Floor floor) {
        // Fetch flat by number and floor, or create if not exists
        return flatRepository.findByFlatNumberAndFloor_FloorId(flatNumber, floor.getFloorId())
                .orElseGet(() -> {
                    Flat flat = new Flat();
                    flat.setFlatNumber(flatNumber);
                    flat.setFloor(floor);
                    return flatRepository.save(flat);
                });
    }

    public Item createSingleItem(Item item, Long tripId, Long projectId, Long towerId) {

        // 1️⃣ Trip
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // 2️⃣ Tower
        Tower tower = towerRepository.findById(towerId)
                .orElseThrow(() -> new RuntimeException("Tower not found"));

        // 3️⃣ Floor
        Integer floorNumber = extractFloorNumber(item.getFlatNo());
        Floor floor = getOrCreateFloor(floorNumber, towerId);

        // 4️⃣ Flat
        Flat flat = getOrCreateFlat(item.getFlatNo(), floor);

        // 5️⃣ Calculation
        Double width = item.getWidth() != null ? item.getWidth() : 0;
        Double height = item.getHeight() != null ? item.getHeight() : 0;
        Integer qty = item.getQty() != null ? item.getQty() : 0;

        Double calculated = ((width * height * qty) / 1000000) * 10.764;
        item.setSqFt(calculated);

        // 6️⃣ Relations
        item.setTrip(trip);
        item.setFloor(floor);
        item.setFlat(flat);
        item.setTower(tower);   // ✅ NEW

        return itemRepository.save(item);
    }

    public Item updateItem(Long itemId, Item updatedItem) {

        // 1️⃣ Fetch existing item
        Item existingItem = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // 2️⃣ Update basic fields
        existingItem.setSrNo(updatedItem.getSrNo());
        existingItem.setWinSrNo(updatedItem.getWinSrNo());
        existingItem.setFlatNo(updatedItem.getFlatNo());
        existingItem.setLocation(updatedItem.getLocation());
        existingItem.setJobCardNo(updatedItem.getJobCardNo());
        existingItem.setDescription(updatedItem.getDescription());
        existingItem.setWidth(updatedItem.getWidth());
        existingItem.setHeight(updatedItem.getHeight());
        existingItem.setQty(updatedItem.getQty());
        existingItem.setUnit(updatedItem.getUnit());
        existingItem.setSqFt(updatedItem.getSqFt());
        existingItem.setRemarks(updatedItem.getRemarks());

        // 3️⃣ Optional relationship updates (same as your Window logic)
        if (updatedItem.getFlat() != null) {
            existingItem.setFlat(updatedItem.getFlat());
        }

        if (updatedItem.getFloor() != null) {
            existingItem.setFloor(updatedItem.getFloor());
        }

        if (updatedItem.getTrip() != null) {
            existingItem.setTrip(updatedItem.getTrip());
        }

        // 4️⃣ Save and return
        return itemRepository.save(existingItem);
    }

}