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

    import java.time.format.DateTimeFormatter;
    import java.util.*;



    /**
     * ═══════════════════════════════════════════════════════════════════════
     *  EXCEL COLUMN MAPPING  (Row 0 = header, data starts from Row 1)
     * ═══════════════════════════════════════════════════════════════════════
     *
     *  Col Index │ Letter │ Field           │ Required?
     *  ──────────┼────────┼─────────────────┼──────────
     *     0      │   A    │ Sr No.          │ optional
     *     1      │   B    │ Win Sr No       │ optional
     *     2      │   C    │ Floor NO        │ ★ MANDATORY
     *     3      │   D    │ Flat No         │ ★ MANDATORY
     *     4      │   E    │ Location        │ optional
     *     5      │   F    │ Window Code     │ optional
     *     6      │   G    │ Job Card No     │ optional
     *     7      │   H    │ Priority        │ optional
     *     8      │   I    │ Description     │ optional
     *     9      │   J    │ Width           │ optional
     *    10      │   K    │ Height          │ optional
     *    11      │   L    │ Qty             │ optional
     *    12      │   M    │ Unit            │ optional
     *    13      │   N    │ SqFt            │ optional
     *    14      │   O    │ Weight          │ optional
     *    15      │   P    │ R Mtr           │ optional
     *    16      │   Q    │ Remarks         │ optional
     *
     * ═══════════════════════════════════════════════════════════════════════
     *  PDF COLUMN-DROP LOGIC
     * ═══════════════════════════════════════════════════════════════════════
     *  After upload, the controller endpoint getItemColumnPresence(tripId)
     *  returns a Map<String, Boolean> telling the frontend which columns
     *  have at least ONE non-null, non-blank value across all items for
     *  that trip. The frontend drops columns where the value is false.
     *
     * ═══════════════════════════════════════════════════════════════════════
     *  MATERIAL DELIVERY DATE LOGIC
     * ═══════════════════════════════════════════════════════════════════════
     *  The PDF header shows an extra "Material Delivery Date" line when:
     *    projectLog.userDate != null
     *    AND projectLog.userDate != projectLog.createdAt.toLocalDate()
     *  Date format in all outputs: dd/MM/yyyy
     * ═══════════════════════════════════════════════════════════════════════
     */
    @Service
    public class ItemService {

        // ── Column index constants ──────────────────────────────────────────
        private static final int COL_SR_NO       = 0;
        private static final int COL_WIN_SR_NO   = 1;
        private static final int COL_FLOOR_NO    = 2;   // MANDATORY
        private static final int COL_FLAT_NO     = 3;   // MANDATORY
        private static final int COL_LOCATION    = 4;
        private static final int COL_WINDOW_CODE = 5;   // ← NEW (was missing)
        private static final int COL_JOB_CARD    = 6;
        private static final int COL_PRIORITY    = 7;   // ← NEW (was missing)
        private static final int COL_DESCRIPTION = 8;
        private static final int COL_WIDTH       = 9;
        private static final int COL_HEIGHT      = 10;
        private static final int COL_QTY         = 11;
        private static final int COL_UNIT        = 12;
        private static final int COL_SQFT        = 13;
        private static final int COL_WEIGHT      = 14;  // ← NEW (was missing)
        private static final int COL_R_MTR       = 15;  // ← NEW (was missing)
        private static final int COL_REMARKS     = 16;

        private static final int TOTAL_COLS = 17;       // cols 0..16

        /** dd/MM/yyyy formatter used for all date output in PDF responses */
        public static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        // ── Repositories ───────────────────────────────────────────────────
        private final ItemRepository       itemRepository;
        private final FloorRepository      floorRepository;
        private final FlatRepository       flatRepository;
        private final TripRepository       tripRepository;
        private final ProjectRepository    projectRepository;
        private final TowerRepository      towerRepository;
        private final ProjectLogRepository projectLogRepository; // ← NEW

        public ItemService(ItemRepository       itemRepository,
                           FloorRepository      floorRepository,
                           FlatRepository       flatRepository,
                           TripRepository       tripRepository,
                           ProjectRepository    projectRepository,
                           TowerRepository      towerRepository,
                           ProjectLogRepository projectLogRepository) {
            this.itemRepository       = itemRepository;
            this.floorRepository      = floorRepository;
            this.flatRepository       = flatRepository;
            this.tripRepository       = tripRepository;
            this.projectRepository    = projectRepository;
            this.towerRepository      = towerRepository;
            this.projectLogRepository = projectLogRepository;
        }

        // ═══════════════════════════════════════════════════════════════════
        //  CRUD — unchanged from original
        // ═══════════════════════════════════════════════════════════════════

        public Item saveItem(Item item) {
            return itemRepository.save(item);
        }

        public List<Item> getAllItems() {
            return itemRepository.findAll();
        }

        public Optional<Item> getItemById(Long id) {
            return itemRepository.findById(id);
        }

        public void deleteItem(Long id) {
            itemRepository.deleteById(id);
        }


        public String getMaterialDeliveryDate(Long tripId) {
            return projectLogRepository
                    .findFirstByTripIdOrderByCreatedAtDesc(tripId)
                    .map(log -> {
                        if (log.getUserDate() == null) return null;
                        if (log.getCreatedAt() == null) return log.getUserDate().format(DATE_FMT);
                        // Show userDate only when it differs from the createdAt date
                        boolean differs = !log.getUserDate()
                                .equals(log.getCreatedAt().toLocalDate());
                        return differs ? log.getUserDate().format(DATE_FMT) : null;
                    })
                    .orElse(null);
        }


        public Map<String, Boolean> getColumnPresence(Long tripId) {
            List<Item> items = itemRepository.findByTrip_Id(tripId);

            Map<String, Boolean> presence = new LinkedHashMap<>();
            presence.put("Sr No.",       items.stream().anyMatch(i -> i.getSrNo()       != null));
            presence.put("Win Sr No",    items.stream().anyMatch(i -> notBlank(i.getWinSrNo())));
    //        presence.put("Floor No",     true);   // always shown — mandatory field
    //        presence.put("Flat No",      true);

            presence.put("Floor No",
                    items.stream().anyMatch(i -> i.getFloor() != null &&
                            i.getFloor().getFloorNumber() != null &&
                            !i.getFloor().getFloorNumber().toString().trim().isEmpty())
            );

            presence.put("Flat No",
                    items.stream().anyMatch(i ->
                            (i.getFlat() != null &&
                                    i.getFlat().getFlatNumber() != null &&
                                    !i.getFlat().getFlatNumber().trim().isEmpty())
                                    ||
                                    (i.getFlatNo() != null &&
                                            !i.getFlatNo().trim().isEmpty())
                    )
            );
    // always shown — mandatory field
            presence.put("Location",     items.stream().anyMatch(i -> notBlank(i.getLocation())));
            presence.put("Window Code",  items.stream().anyMatch(i -> notBlank(i.getWindowCode())));
            presence.put("Job Card No",  items.stream().anyMatch(i -> notBlank(i.getJobCardNo())));
            presence.put("Priority",     items.stream().anyMatch(i -> notBlank(i.getPriority())));
            presence.put("Description",  items.stream().anyMatch(i -> notBlank(i.getDescription())));
//            presence.put("Width",        items.stream().anyMatch(i -> i.getWidth()       != null && i.getWidth()  != 0));
//            presence.put("Height",       items.stream().anyMatch(i -> i.getHeight()      != null && i.getHeight() != 0));
            presence.put("Width",
                    items.stream().anyMatch(i -> i.getWidth() != null && !i.getWidth().isBlank())
            );

            presence.put("Height",
                    items.stream().anyMatch(i -> i.getHeight() != null && !i.getHeight().isBlank())
            );
            presence.put("Qty",          items.stream().anyMatch(i -> i.getQty()         != null && i.getQty()    != 0));
            presence.put("Unit",         items.stream().anyMatch(i -> notBlank(i.getUnit())));
            presence.put("SqFt",         items.stream().anyMatch(i -> i.getSqFt()        != null && i.getSqFt()   != 0));
            presence.put("Weight",       items.stream().anyMatch(i -> i.getWeight()      != null && i.getWeight() != 0));
            presence.put("R Mtr",        items.stream().anyMatch(i -> i.getRMtr()        != null && i.getRMtr()   != 0));
            presence.put("Remarks",      items.stream().anyMatch(i -> notBlank(i.getRemarks())));

            return presence;
        }

        private boolean notBlank(String s) {
            return s != null && !s.isBlank();
        }

        // ═══════════════════════════════════════════════════════════════════
        //  BULK UPLOAD — TWO-PASS
        // ═══════════════════════════════════════════════════════════════════

        public String bulkUpload(MultipartFile file, Long tripId, Long projectId, Long towerId)
                throws Exception {

            // 1. Entities
            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found with ID: " + tripId));
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
            Tower tower = towerRepository.findById(towerId)
                    .orElseThrow(() -> new RuntimeException("Tower not found with ID: " + towerId));

            // 2. Open workbook
            Workbook workbook = new XSSFWorkbook(file.getInputStream());
            Sheet sheet = workbook.getSheetAt(0);

            // ── PASS 1: Validate ────────────────────────────────────────────
            List<String> validationErrors = new ArrayList<>();





            // ── PASS 2: Build and save items ────────────────────────────────
            List<Item> itemsToSave = new ArrayList<>();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowCompletelyEmpty(row)) continue;

                String  floorRaw    = getCellStringValue(row, COL_FLOOR_NO);
                String  flatNo      = getCellStringValue(row, COL_FLAT_NO);

    // ✅ Floor and Flat are now optional — only create if value is present
                Floor floor = null;
                if (floorRaw != null && !floorRaw.isBlank()) {
                    Integer floorNumber = parseFloorNumber(floorRaw);
                    floor = getOrCreateFloor(floorNumber, towerId);
                }

                Flat flat = null;
                if (flatNo != null && !flatNo.isBlank() && floor != null) {
                    flat = getOrCreateFlat(flatNo, floor);
                }
                Item item = new Item();
                item.setSrNo(getCellIntValue(row, COL_SR_NO));
                item.setWinSrNo(getCellStringValue(row, COL_WIN_SR_NO));
                item.setFlatNo(flatNo);
                item.setLocation(getCellStringValue(row, COL_LOCATION));
                item.setWindowCode(getCellStringValue(row, COL_WINDOW_CODE));   // ← NEW
                item.setJobCardNo(getCellStringValue(row, COL_JOB_CARD));
                item.setPriority(getCellStringValue(row, COL_PRIORITY));         // ← NEW
                item.setDescription(getCellStringValue(row, COL_DESCRIPTION));
                item.setWidth(getCellStringValue(row, COL_WIDTH));
                item.setHeight(getCellStringValue(row, COL_HEIGHT));
                item.setQty(getCellIntValue(row, COL_QTY));
                item.setUnit(getCellStringValue(row, COL_UNIT));
                item.setSqFt(getCellDoubleValue(row, COL_SQFT));
                item.setWeight(getCellDoubleValue(row, COL_WEIGHT));             // ← NEW
                item.setRMtr(getCellDoubleValue(row, COL_R_MTR));               // ← NEW
                item.setRemarks(getCellStringValue(row, COL_REMARKS));

                item.setTrip(trip);
                item.setFloor(floor);
                item.setFlat(flat);
                item.setTower(tower);

                itemsToSave.add(item);
            }

            workbook.close();
            itemRepository.saveAll(itemsToSave);

            return "Bulk upload successful! " + itemsToSave.size() + " items uploaded.";
        }

        // ═══════════════════════════════════════════════════════════════════
        //  createSingleItem — unchanged logic, only new fields added
        // ═══════════════════════════════════════════════════════════════════

        public Item createSingleItem(Item item, Long tripId, Long projectId, Long towerId) {

            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found"));
            Tower tower = towerRepository.findById(towerId)
                    .orElseThrow(() -> new RuntimeException("Tower not found"));

            Integer floorNumber = extractFloorNumber(item.getFlatNo());
            Floor floor = getOrCreateFloor(floorNumber, towerId);
            Flat  flat  = getOrCreateFlat(item.getFlatNo(), floor);


            Double width  = parseDouble(item.getWidth());
            Double height = parseDouble(item.getHeight());
            Integer qty   = item.getQty() != null ? item.getQty() : 0;

            Double calculated = ((width * height * qty) / 1_000_000) * 10.764;
            item.setSqFt(calculated);

            item.setTrip(trip);
            item.setFloor(floor);
            item.setFlat(flat);
            item.setTower(tower);

            return itemRepository.save(item);
        }

        // ═══════════════════════════════════════════════════════════════════
        //  updateItem — unchanged logic, new fields added
        // ═══════════════════════════════════════════════════════════════════

        public Item updateItem(Long itemId, Item updatedItem) {
            Item existing = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            existing.setSrNo(updatedItem.getSrNo());
            existing.setWinSrNo(updatedItem.getWinSrNo());
            existing.setFlatNo(updatedItem.getFlatNo());
            existing.setLocation(updatedItem.getLocation());
            existing.setWindowCode(updatedItem.getWindowCode());     // ← NEW
            existing.setJobCardNo(updatedItem.getJobCardNo());
            existing.setPriority(updatedItem.getPriority());         // ← NEW
            existing.setDescription(updatedItem.getDescription());
            existing.setWidth(updatedItem.getWidth());
            existing.setHeight(updatedItem.getHeight());
            existing.setQty(updatedItem.getQty());
            existing.setUnit(updatedItem.getUnit());
            existing.setSqFt(updatedItem.getSqFt());
            existing.setWeight(updatedItem.getWeight());             // ← NEW
            existing.setRMtr(updatedItem.getRMtr());                 // ← NEW
            existing.setRemarks(updatedItem.getRemarks());

            if (updatedItem.getFlat()  != null) existing.setFlat(updatedItem.getFlat());
            if (updatedItem.getFloor() != null) existing.setFloor(updatedItem.getFloor());
            if (updatedItem.getTrip()  != null) existing.setTrip(updatedItem.getTrip());

            return itemRepository.save(existing);
        }

        // ═══════════════════════════════════════════════════════════════════
        //  HELPERS
        // ═══════════════════════════════════════════════════════════════════

        private boolean isRowCompletelyEmpty(Row row) {
            if (row == null) return true;
            for (int c = 0; c < TOTAL_COLS; c++) {
                Cell cell = row.getCell(c);
                if (cell == null) continue;
                if (cell.getCellType() == CellType.BLANK) continue;
                String val = getCellStringValue(row, c);
                if (val != null && !val.isBlank()) return false;
            }
            return true;
        }

        private Integer parseFloorNumber(String floorRaw) {
            if (floorRaw == null || floorRaw.isBlank()) return 0;
            String digits = floorRaw.replaceAll("[^0-9]", "");
            if (digits.isEmpty()) return 0;
            try { return Integer.parseInt(digits); }
            catch (NumberFormatException e) { return 0; }
        }

        private String getCellStringValue(Row row, int cellIndex) {
            Cell cell = row.getCell(cellIndex);
            if (cell == null) return "";
            return switch (cell.getCellType()) {
                case STRING  -> cell.getStringCellValue().trim();
              //  case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
                case NUMERIC -> String.valueOf(cell.getNumericCellValue());
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                case FORMULA -> {
                    try { yield String.valueOf((long) cell.getNumericCellValue()); }
                    catch (Exception e) { yield cell.getStringCellValue().trim(); }
                }
                default -> "";
            };
        }

        private Double getCellDoubleValue(Row row, int cellIndex) {
            Cell cell = row.getCell(cellIndex);
            if (cell == null) return null;
            return switch (cell.getCellType()) {
                case NUMERIC -> cell.getNumericCellValue();
                case STRING  -> {
                    try { yield parseDouble(cell.getStringCellValue().trim()); }
                    catch (NumberFormatException e) { yield null; }
                }
                default -> null;
            };
        }

        private Integer getCellIntValue(Row row, int cellIndex) {
            Cell cell = row.getCell(cellIndex);
            if (cell == null) return null;
            return switch (cell.getCellType()) {
                case NUMERIC -> (int) cell.getNumericCellValue();
                case STRING  -> {
                    try { yield Integer.parseInt(cell.getStringCellValue().trim()); }
                    catch (NumberFormatException e) { yield null; }
                }
                default -> null;
            };
        }

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
                return Integer.parseInt(flatNumber.replaceAll("[^0-9]", "").substring(0, 1));
            } catch (Exception e) { return 0; }
        }

        private Double parseDouble(String value) {
            try {
                if (value == null || value.isBlank()) return 0.0;
                return Double.parseDouble(value);
            } catch (Exception e) {
                return 0.0;
            }
        }
    }