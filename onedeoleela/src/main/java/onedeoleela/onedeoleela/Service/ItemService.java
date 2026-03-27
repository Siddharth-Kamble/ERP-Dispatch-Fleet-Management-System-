package onedeoleela.onedeoleela.Service;


import onedeoleela.onedeoleela.Entity.Flat;
import onedeoleela.onedeoleela.Entity.Floor;
import onedeoleela.onedeoleela.Entity.Item;
import onedeoleela.onedeoleela.Entity.Trip;
import onedeoleela.onedeoleela.Repository.*;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {


    private final ItemRepository itemRepository;
    private final FloorRepository floorRepository;
    private final FlatRepository flatRepository;
    private final TripRepository tripRepository;
    private final ProjectRepository projectRepository;
    public ItemService(ItemRepository itemRepository, FloorRepository floorRepository, FlatRepository flatRepository, TripRepository tripRepository, ProjectRepository projectRepository) {
        this.itemRepository = itemRepository;
        this.floorRepository = floorRepository;
        this.flatRepository = flatRepository;
        this.tripRepository = tripRepository;
        this.projectRepository = projectRepository;
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

                // 5️⃣ Extract Floor number from flat (custom logic)
                Integer floorNumber = extractFloorNumber(flatNumber);

                // 6️⃣ Get or create Floor
                Floor floor = getOrCreateFloor(floorNumber, projectId);

                // 7️⃣ Get or create Flat
                Flat flat = getOrCreateFlat(flatNumber, floor);

                // 8️⃣ Create Item object
                Item item = new Item();
                item.setSrNo(getInteger(row.getCell(0)));
                item.setWinSrNo(getString(row.getCell(1)));
                item.setFlatNo(flatNumber);
                item.setLocation(getString(row.getCell(3)));
                item.setJobCardNo(getString(row.getCell(4)));
                item.setDescription(getString(row.getCell(5)));
                item.setWidth(getDouble(row.getCell(6)));
                item.setHeight(getDouble(row.getCell(7)));
                item.setQty(getInteger(row.getCell(8)));
                item.setUnit(getString(row.getCell(9)));
                item.setSqFt(getDouble(row.getCell(10)));
                item.setRemarks(getString(row.getCell(11)));

                // 9️⃣ Set relations
                item.setTrip(trip);
                item.setFlat(flat);
                item.setFloor(floor);

                // 10️⃣ Save Item
                itemRepository.save(item);
            }

            workbook.close();
            return "Bulk Upload Successful";

        } catch (Exception e) {
            throw new RuntimeException("Bulk upload failed: " + e.getMessage());
        }
    }

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

    private Floor getOrCreateFloor(Integer floorNumber, Long projectId) {
        // Fetch floor by number and project, or create if not exists
        return floorRepository.findByFloorNumberAndProject_ProjectId(floorNumber, projectId)
                .orElseGet(() -> {
                    Floor floor = new Floor();
                    floor.setFloorNumber(floorNumber);
                    floor.setProject(projectRepository.findById(projectId).orElseThrow());
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


    public Item createSingleItem(Item item, Long tripId, Long projectId) {

        // 1️⃣ Get Trip
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // 2️⃣ Extract Floor from Flat
        Integer floorNumber = extractFloorNumber(item.getFlatNo());

        // 3️⃣ Get/Create Floor
        Floor floor = getOrCreateFloor(floorNumber, projectId);

        // 4️⃣ Get/Create Flat
        Flat flat = getOrCreateFlat(item.getFlatNo(), floor);

        // 5️⃣ 🔥 APPLY YOUR FORMULA (IMPORTANT)
        Double width = item.getWidth() != null ? item.getWidth() : 0;
        Double height = item.getHeight() != null ? item.getHeight() : 0;
        Integer qty = item.getQty() != null ? item.getQty() : 0;

        Double calculated = ((width * height * qty) / 1000000) * 10.764;

        item.setSqFt(calculated); // 👉 this is your "weight logic"

        // 6️⃣ Set relations
        item.setTrip(trip);
        item.setFloor(floor);
        item.setFlat(flat);

        // 7️⃣ Save
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