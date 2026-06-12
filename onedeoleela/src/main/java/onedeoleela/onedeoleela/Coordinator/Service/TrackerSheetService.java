//////package onedeoleela.onedeoleela.Coordinator.Service;
//////
//////import onedeoleela.onedeoleela.Coordinator.DTO.TrackerSheetDTO;
//////import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheet;
//////import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheetRow;
//////import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrder;
//////import onedeoleela.onedeoleela.Coordinator.Repository.TrackerSheetRepository;
//////import onedeoleela.onedeoleela.Coordinator.Repository.WorkOrderRepository;
//////import org.springframework.stereotype.Service;
//////import org.springframework.transaction.annotation.Transactional;
//////
//////import java.util.List;
//////import java.util.Optional;
//////import java.util.stream.Collectors;
//////
//////@Service
//////public class TrackerSheetService {
//////
//////    private final TrackerSheetRepository trackerSheetRepository;
//////    private final WorkOrderRepository    workOrderRepository;
//////
//////    public TrackerSheetService(
//////            TrackerSheetRepository trackerSheetRepository,
//////            WorkOrderRepository    workOrderRepository
//////    ) {
//////        this.trackerSheetRepository = trackerSheetRepository;
//////        this.workOrderRepository    = workOrderRepository;
//////    }
//////
//////    // ── Map DTO row → Entity row ──────────────────────────────────────────────
//////    private TrackerSheetRow mapRow(TrackerSheetDTO.RowDTO dto, TrackerSheet sheet) {
//////        TrackerSheetRow row = new TrackerSheetRow();
//////        row.setTrackerSheet(sheet);
//////
//////        // Auto-filled fields
//////        row.setSrNo(dto.getSrNo());
//////        row.setFlat(dto.getFlat());
//////        row.setLocation(dto.getLocation());
//////        row.setWcode(dto.getWcode());
//////        row.setTypology(dto.getTypology());
//////        row.setSeries(dto.getSeries());
//////        row.setWoLnt(dto.getWoLnt());
//////        row.setWoHgt(dto.getWoHgt());
//////        row.setSqft(dto.getSqft());
//////
//////        // User-filled fields
//////        row.setLength(dto.getLength());
//////        row.setHeight(dto.getHeight());
//////        row.setJobCard(dto.getJobCard());
//////
//////        // SUPPLY
//////        row.setSupplyFrame(dto.getSupplyFrame());
//////        row.setSupplyDoorFrame(dto.getSupplyDoorFrame());
//////        row.setSupplyShutter(dto.getSupplyShutter());
//////        row.setSupplyOpenableDoor(dto.getSupplyOpenableDoor());
//////        row.setSupplyFixGlass(dto.getSupplyFixGlass());
//////        row.setSupplyTopBottomFix(dto.getSupplyTopBottomFix());
//////
//////        // INSTALLATION
//////        row.setInstallFrame(dto.getInstallFrame());
//////        row.setInstallDoorFrame(dto.getInstallDoorFrame());
//////        row.setInstallShutter(dto.getInstallShutter());
//////        row.setInstallOpenableDoor(dto.getInstallOpenableDoor());
//////        row.setInstallFixGlass(dto.getInstallFixGlass());
//////        row.setInstallTopBottomFix(dto.getInstallTopBottomFix());
//////
//////        // HARDWARE
//////        row.setHwFrame(dto.getHwFrame());
//////        row.setHwDoorFrame(dto.getHwDoorFrame());
//////        row.setHwShutter(dto.getHwShutter());
//////        row.setHwOpenableDoor(dto.getHwOpenableDoor());
//////        row.setHwFixGlass(dto.getHwFixGlass());
//////        row.setHwTopBottomFix(dto.getHwTopBottomFix());
//////
//////        // Extra
//////        row.setHandoverStatus(dto.getHandoverStatus());
//////        row.setDcNo(dto.getDcNo());
//////
//////        return row;
//////    }
//////
//////    // ── CREATE ────────────────────────────────────────────────────────────────
//////    @Transactional
//////    public TrackerSheet create(TrackerSheetDTO dto) {
//////        WorkOrder wo = workOrderRepository.findById(dto.getWorkOrderId())
//////                .orElseThrow(() -> new IllegalArgumentException(
//////                        "Work Order not found: " + dto.getWorkOrderId()));
//////
//////        // Check if a tracker sheet already exists for this WO
//////        Optional<TrackerSheet> existing = trackerSheetRepository.findByWorkOrderId(dto.getWorkOrderId());
//////        if (existing.isPresent()) {
//////            throw new IllegalArgumentException(
//////                    "A tracker sheet already exists for Work Order: " + wo.getWorkOrderNo()
//////                            + ". Use PUT to update it.");
//////        }
//////
//////        TrackerSheet sheet = new TrackerSheet();
//////        sheet.setWorkOrder(wo);
//////        sheet.setProjectName(wo.getProjectName());
//////        sheet.setTowerName(wo.getTowerName());
//////        sheet.setDate(dto.getDate());
//////
//////        if (dto.getRows() != null) {
//////            List<TrackerSheetRow> rows = dto.getRows().stream()
//////                    .map(r -> mapRow(r, sheet))
//////                    .collect(Collectors.toList());
//////            sheet.setRows(rows);
//////        }
//////
//////        return trackerSheetRepository.save(sheet);
//////    }
//////
//////    // ── UPDATE ────────────────────────────────────────────────────────────────
//////    @Transactional
//////    public TrackerSheet update(Long id, TrackerSheetDTO dto) {
//////        TrackerSheet sheet = trackerSheetRepository.findById(id)
//////                .orElseThrow(() -> new IllegalArgumentException(
//////                        "Tracker Sheet not found: " + id));
//////
//////        sheet.setDate(dto.getDate());
//////
//////        if (dto.getRows() != null) {
//////            // ✅ orphanRemoval safe — clear and re-add, never reassign
//////            sheet.getRows().clear();
//////            List<TrackerSheetRow> newRows = dto.getRows().stream()
//////                    .map(r -> mapRow(r, sheet))
//////                    .collect(Collectors.toList());
//////            sheet.getRows().addAll(newRows);
//////        }
//////
//////        return trackerSheetRepository.save(sheet);
//////    }
//////
//////    // ── GET by Work Order ─────────────────────────────────────────────────────
//////    public Optional<TrackerSheet> getByWorkOrder(Long workOrderId) {
//////        return trackerSheetRepository.findByWorkOrderId(workOrderId);
//////    }
//////
//////    // ── GET by ID ─────────────────────────────────────────────────────────────
//////    public TrackerSheet getById(Long id) {
//////        return trackerSheetRepository.findById(id)
//////                .orElseThrow(() -> new IllegalArgumentException(
//////                        "Tracker Sheet not found: " + id));
//////    }
//////
//////    // ── GET by Project ────────────────────────────────────────────────────────
//////    public List<TrackerSheet> getByProject(String projectName) {
//////        return trackerSheetRepository.findByProjectNameOrderByIdDesc(projectName);
//////    }
//////}
////
////package onedeoleela.onedeoleela.Coordinator.Service;
////
////import onedeoleela.onedeoleela.Coordinator.DTO.TrackerSheetDTO;
////import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheet;
////import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheetRow;
////import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrder;
////import onedeoleela.onedeoleela.Coordinator.Repository.TrackerSheetRepository;
////import onedeoleela.onedeoleela.Coordinator.Repository.WorkOrderRepository;
////import org.springframework.stereotype.Service;
////import org.springframework.transaction.annotation.Transactional;
////
////import java.util.List;
////import java.util.Optional;
////import java.util.stream.Collectors;
////
////@Service
////public class TrackerSheetService {
////
////    private final TrackerSheetRepository trackerSheetRepository;
////    private final WorkOrderRepository    workOrderRepository;
////
////    public TrackerSheetService(
////            TrackerSheetRepository trackerSheetRepository,
////            WorkOrderRepository    workOrderRepository
////    ) {
////        this.trackerSheetRepository = trackerSheetRepository;
////        this.workOrderRepository    = workOrderRepository;
////    }
////
////    // ── Map DTO row → Entity row ──────────────────────────────────────────────
////    private TrackerSheetRow mapRow(TrackerSheetDTO.RowDTO dto, TrackerSheet sheet) {
////        TrackerSheetRow row = new TrackerSheetRow();
////        row.setTrackerSheet(sheet);
////
////        // Auto-filled
////        row.setSrNo(dto.getSrNo());
////        row.setFlat(dto.getFlat());
////        row.setLocation(dto.getLocation());
////        row.setWcode(dto.getWcode());
////        row.setTypology(dto.getTypology());
////        row.setSeries(dto.getSeries());
////        row.setWoLnt(dto.getWoLnt());
////        row.setWoHgt(dto.getWoHgt());
////        row.setSqft(dto.getSqft());
////
////        // User filled
////        row.setLength(dto.getLength());
////        row.setHeight(dto.getHeight());
////        row.setJobCard(dto.getJobCard());
////
////        // DC.NO
////        row.setDcnoFrame(dto.getDcnoFrame());
////        row.setDcnoDoorFrame(dto.getDcnoDoorFrame());
////        row.setDcnoShutter(dto.getDcnoShutter());
////        row.setDcnoOpenableDoor(dto.getDcnoOpenableDoor());
////        row.setDcnoFixGlass(dto.getDcnoFixGlass());
////        row.setDcnoTopBottomFix(dto.getDcnoTopBottomFix());
////
////        // STATUS
////        row.setStatusFrame(dto.getStatusFrame());
////        row.setStatusDoorFrame(dto.getStatusDoorFrame());
////        row.setStatusShutter(dto.getStatusShutter());
////        row.setStatusOpenableDoor(dto.getStatusOpenableDoor());
////        row.setStatusFixGlass(dto.getStatusFixGlass());
////        row.setStatusTopBottomFix(dto.getStatusTopBottomFix());
////        row.setStatusHardware(dto.getStatusHardware());
////
////        // SUPPLY
////        row.setSupplyFrame(dto.getSupplyFrame());
////        row.setSupplyDoorFrame(dto.getSupplyDoorFrame());
////        row.setSupplyShutter(dto.getSupplyShutter());
////        row.setSupplyOpenableDoor(dto.getSupplyOpenableDoor());
////        row.setSupplyFixGlass(dto.getSupplyFixGlass());
////        row.setSupplyTopBottomFix(dto.getSupplyTopBottomFix());
////
////        // INSTALLATION
////        row.setInstallFrame(dto.getInstallFrame());
////        row.setInstallDoorFrame(dto.getInstallDoorFrame());
////        row.setInstallShutter(dto.getInstallShutter());
////        row.setInstallOpenableDoor(dto.getInstallOpenableDoor());
////        row.setInstallFixGlass(dto.getInstallFixGlass());
////        row.setInstallTopBottomFix(dto.getInstallTopBottomFix());
////
////        // HARDWARE
////        row.setHwFrame(dto.getHwFrame());
////        row.setHwDoorFrame(dto.getHwDoorFrame());
////        row.setHwShutter(dto.getHwShutter());
////        row.setHwOpenableDoor(dto.getHwOpenableDoor());
////        row.setHwFixGlass(dto.getHwFixGlass());
////        row.setHwTopBottomFix(dto.getHwTopBottomFix());
////
////        // Extra
////        row.setHandoverStatus(dto.getHandoverStatus());
////        row.setDcNo(dto.getDcNo());
////
////        return row;
////    }
////
////    // ── CREATE ────────────────────────────────────────────────────────────────
////    @Transactional
////    public TrackerSheet create(TrackerSheetDTO dto) {
////        WorkOrder wo = workOrderRepository.findById(dto.getWorkOrderId())
////                .orElseThrow(() -> new IllegalArgumentException(
////                        "Work Order not found: " + dto.getWorkOrderId()));
////
////        Optional<TrackerSheet> existing = trackerSheetRepository.findByWorkOrderId(dto.getWorkOrderId());
////        if (existing.isPresent()) {
////            throw new IllegalArgumentException(
////                    "A tracker sheet already exists for Work Order: " + wo.getWorkOrderNo()
////                            + ". Use PUT to update it.");
////        }
////
////        TrackerSheet sheet = new TrackerSheet();
////        sheet.setWorkOrder(wo);
////        sheet.setProjectName(wo.getProjectName());
////        sheet.setTowerName(wo.getTowerName());
////        sheet.setDate(dto.getDate());
////
////        if (dto.getRows() != null) {
////            List<TrackerSheetRow> rows = dto.getRows().stream()
////                    .map(r -> mapRow(r, sheet))
////                    .collect(Collectors.toList());
////            sheet.setRows(rows);
////        }
////
////        return trackerSheetRepository.save(sheet);
////    }
////
////    // ── UPDATE ────────────────────────────────────────────────────────────────
////    @Transactional
////    public TrackerSheet update(Long id, TrackerSheetDTO dto) {
////        TrackerSheet sheet = trackerSheetRepository.findById(id)
////                .orElseThrow(() -> new IllegalArgumentException(
////                        "Tracker Sheet not found: " + id));
////
////        sheet.setDate(dto.getDate());
////
////        if (dto.getRows() != null) {
////            // ✅ orphanRemoval safe — clear then re-add
////            sheet.getRows().clear();
////            List<TrackerSheetRow> newRows = dto.getRows().stream()
////                    .map(r -> mapRow(r, sheet))
////                    .collect(Collectors.toList());
////            sheet.getRows().addAll(newRows);
////        }
////
////        return trackerSheetRepository.save(sheet);
////    }
////
////    // ── GET by Work Order ─────────────────────────────────────────────────────
////    public Optional<TrackerSheet> getByWorkOrder(Long workOrderId) {
////        return trackerSheetRepository.findByWorkOrderId(workOrderId);
////    }
////
////    // ── GET by ID ─────────────────────────────────────────────────────────────
////    public TrackerSheet getById(Long id) {
////        return trackerSheetRepository.findById(id)
////                .orElseThrow(() -> new IllegalArgumentException(
////                        "Tracker Sheet not found: " + id));
////    }
////
////    // ── GET by Project ────────────────────────────────────────────────────────
////    public List<TrackerSheet> getByProject(String projectName) {
////        return trackerSheetRepository.findByProjectNameOrderByIdDesc(projectName);
////    }
////}
//
//package onedeoleela.onedeoleela.Coordinator.Service;
//
//import onedeoleela.onedeoleela.Coordinator.DTO.TrackerSheetDTO;
//import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheet;
//import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheetRow;
//import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrder;
//import onedeoleela.onedeoleela.Coordinator.Repository.TrackerSheetRepository;
//import onedeoleela.onedeoleela.Coordinator.Repository.WorkOrderRepository;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.math.RoundingMode;
//import java.util.List;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Service
//public class TrackerSheetService {
//
//    private final TrackerSheetRepository trackerSheetRepository;
//    private final WorkOrderRepository    workOrderRepository;
//
//    public TrackerSheetService(
//            TrackerSheetRepository trackerSheetRepository,
//            WorkOrderRepository    workOrderRepository
//    ) {
//        this.trackerSheetRepository = trackerSheetRepository;
//        this.workOrderRepository    = workOrderRepository;
//    }
//
//    // ── Helper: parse "R"/"I" and return sqft or zero ─────────────────────────
//    private BigDecimal resolveSupply(String statusVal, BigDecimal sqft) {
//        if (statusVal != null && statusVal.trim().equalsIgnoreCase("R")) {
//            return sqft != null ? sqft.setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
//        }
//        return BigDecimal.ZERO;
//    }
//
//    private BigDecimal resolveInstall(String statusVal, BigDecimal sqft) {
//        if (statusVal != null && statusVal.trim().equalsIgnoreCase("I")) {
//            return sqft != null ? sqft.setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
//        }
//        return BigDecimal.ZERO;
//    }
//
//    // ── Map DTO row → Entity row ──────────────────────────────────────────────
//    private TrackerSheetRow mapRow(TrackerSheetDTO.RowDTO dto, TrackerSheet sheet) {
//        TrackerSheetRow row = new TrackerSheetRow();
//        row.setTrackerSheet(sheet);
//
//        // Auto-filled from WO
//        row.setSrNo(dto.getSrNo());
//        row.setFlat(dto.getFlat());
//        row.setLocation(dto.getLocation());
//        row.setWcode(dto.getWcode());
//        row.setTypology(dto.getTypology());
//        row.setSeries(dto.getSeries());
//        row.setWoLnt(dto.getWoLnt());
//        row.setWoHgt(dto.getWoHgt());
//        row.setSqft(dto.getSqft());
//
//        // User filled
//        row.setLength(dto.getLength());
//        row.setHeight(dto.getHeight());
//        row.setJobCard(dto.getJobCard());
//
//        // DC.NO
//        row.setDcnoFrame(dto.getDcnoFrame());
//        row.setDcnoDoorFrame(dto.getDcnoDoorFrame());
//        row.setDcnoShutter(dto.getDcnoShutter());
//        row.setDcnoOpenableDoor(dto.getDcnoOpenableDoor());
//        row.setDcnoFixGlass(dto.getDcnoFixGlass());
//        row.setDcnoTopBottomFix(dto.getDcnoTopBottomFix());
//
//        // STATUS — store R/I string values
//        row.setStatusFrame(dto.getStatusFrame());
//        row.setStatusDoorFrame(dto.getStatusDoorFrame());
//        row.setStatusShutter(dto.getStatusShutter());
//        row.setStatusOpenableDoor(dto.getStatusOpenableDoor());
//        row.setStatusFixGlass(dto.getStatusFixGlass());
//        row.setStatusTopBottomFix(dto.getStatusTopBottomFix());
//
//        // SUPPLY — server-side: R in STATUS → sqft, else 0
//        BigDecimal sqft = dto.getSqft();
//        row.setSupplyFrame(resolveSupply(dto.getStatusFrame(), sqft));
//        row.setSupplyDoorFrame(resolveSupply(dto.getStatusDoorFrame(), sqft));
//        row.setSupplyShutter(resolveSupply(dto.getStatusShutter(), sqft));
//        row.setSupplyOpenableDoor(resolveSupply(dto.getStatusOpenableDoor(), sqft));
//        row.setSupplyFixGlass(resolveSupply(dto.getStatusFixGlass(), sqft));
//        row.setSupplyTopBottomFix(resolveSupply(dto.getStatusTopBottomFix(), sqft));
//
//        // INSTALLATION — server-side: I in STATUS → sqft, else 0
//        row.setInstallFrame(resolveInstall(dto.getStatusFrame(), sqft));
//        row.setInstallDoorFrame(resolveInstall(dto.getStatusDoorFrame(), sqft));
//        row.setInstallShutter(resolveInstall(dto.getStatusShutter(), sqft));
//        row.setInstallOpenableDoor(resolveInstall(dto.getStatusOpenableDoor(), sqft));
//        row.setInstallFixGlass(resolveInstall(dto.getStatusFixGlass(), sqft));
//        row.setInstallTopBottomFix(resolveInstall(dto.getStatusTopBottomFix(), sqft));
//
//        // Extra
//        row.setHandoverStatus(dto.getHandoverStatus());
//        row.setDcNo(dto.getDcNo());
//
//        return row;
//    }
//
//    // ── CREATE ────────────────────────────────────────────────────────────────
//    @Transactional
//    public TrackerSheet create(TrackerSheetDTO dto) {
//        WorkOrder wo = workOrderRepository.findById(dto.getWorkOrderId())
//                .orElseThrow(() -> new IllegalArgumentException(
//                        "Work Order not found: " + dto.getWorkOrderId()));
//
//        Optional<TrackerSheet> existing = trackerSheetRepository.findByWorkOrderId(dto.getWorkOrderId());
//        if (existing.isPresent()) {
//            throw new IllegalArgumentException(
//                    "A tracker sheet already exists for Work Order: " + wo.getWorkOrderNo()
//                            + ". Use PUT to update it.");
//        }
//
//        TrackerSheet sheet = new TrackerSheet();
//        sheet.setWorkOrder(wo);
//        sheet.setProjectName(wo.getProjectName());
//        sheet.setTowerName(wo.getTowerName());
//        sheet.setDate(dto.getDate());
//
//        if (dto.getRows() != null) {
//            List<TrackerSheetRow> rows = dto.getRows().stream()
//                    .map(r -> mapRow(r, sheet))
//                    .collect(Collectors.toList());
//            sheet.setRows(rows);
//        }
//
//        return trackerSheetRepository.save(sheet);
//    }
//
//    // ── UPDATE ────────────────────────────────────────────────────────────────
//    @Transactional
//    public TrackerSheet update(Long id, TrackerSheetDTO dto) {
//        TrackerSheet sheet = trackerSheetRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException(
//                        "Tracker Sheet not found: " + id));
//
//        sheet.setDate(dto.getDate());
//
//        if (dto.getRows() != null) {
//            // ✅ orphanRemoval safe
//            sheet.getRows().clear();
//            List<TrackerSheetRow> newRows = dto.getRows().stream()
//                    .map(r -> mapRow(r, sheet))
//                    .collect(Collectors.toList());
//            sheet.getRows().addAll(newRows);
//        }
//
//        return trackerSheetRepository.save(sheet);
//    }
//
//    // ── READ ──────────────────────────────────────────────────────────────────
//    public Optional<TrackerSheet> getByWorkOrder(Long workOrderId) {
//        return trackerSheetRepository.findByWorkOrderId(workOrderId);
//    }
//
//    public TrackerSheet getById(Long id) {
//        return trackerSheetRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException(
//                        "Tracker Sheet not found: " + id));
//    }
//
//    public List<TrackerSheet> getByProject(String projectName) {
//        return trackerSheetRepository.findByProjectNameOrderByIdDesc(projectName);
//    }
//}

//
//package onedeoleela.onedeoleela.Coordinator.Service;
//
//import onedeoleela.onedeoleela.Coordinator.DTO.TrackerSheetDTO;
//import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheet;
//import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheetRow;
//import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrder;
//import onedeoleela.onedeoleela.Coordinator.Repository.TrackerSheetRepository;
//import onedeoleela.onedeoleela.Coordinator.Repository.WorkOrderRepository;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.math.RoundingMode;
//import java.util.List;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Service
//public class TrackerSheetService {
//
//    private final TrackerSheetRepository trackerSheetRepository;
//    private final WorkOrderRepository    workOrderRepository;
//
//    public TrackerSheetService(
//            TrackerSheetRepository trackerSheetRepository,
//            WorkOrderRepository    workOrderRepository
//    ) {
//        this.trackerSheetRepository = trackerSheetRepository;
//        this.workOrderRepository    = workOrderRepository;
//    }
//
//    // ── Helper: parse "R"/"I" and return sqft or zero ─────────────────────────
//    // R → SUPPLY gets sqft
//    // I → BOTH SUPPLY and INSTALLATION get sqft
//
//    private BigDecimal resolveSupply(String statusVal, BigDecimal sqft) {
//        if (statusVal == null) return BigDecimal.ZERO;
//        String v = statusVal.trim().toUpperCase();
//        if (v.equals("R") || v.equals("I") || v.equals("H")) {
//            return sqft != null ? sqft.setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
//        }
//        return BigDecimal.ZERO;
//    }
//
//    private BigDecimal resolveInstall(String statusVal, BigDecimal sqft) {
//        if (statusVal == null) return BigDecimal.ZERO;
//        String v = statusVal.trim().toUpperCase();
//        if (v.equals("I") || v.equals("H")) {
//            return sqft != null ? sqft.setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
//        }
//        return BigDecimal.ZERO;
//    }
//
//    // ── Map DTO row → Entity row ──────────────────────────────────────────────
//    private TrackerSheetRow mapRow(TrackerSheetDTO.RowDTO dto, TrackerSheet sheet) {
//        TrackerSheetRow row = new TrackerSheetRow();
//        row.setTrackerSheet(sheet);
//
//        // Auto-filled from WO
//        row.setSrNo(dto.getSrNo());
//        row.setFlat(dto.getFlat());
//        row.setLocation(dto.getLocation());
//        row.setWcode(dto.getWcode());
//        row.setTypology(dto.getTypology());
//        row.setSeries(dto.getSeries());
//        row.setWoLnt(dto.getWoLnt());
//        row.setWoHgt(dto.getWoHgt());
//        row.setSqft(dto.getSqft());
//
//        // User filled
//        row.setLength(dto.getLength());
//        row.setHeight(dto.getHeight());
//        row.setJobCard(dto.getJobCard());
//
//        // DC.NO
//        row.setDcnoFrame(dto.getDcnoFrame());
//        row.setDcnoDoorFrame(dto.getDcnoDoorFrame());
//        row.setDcnoShutter(dto.getDcnoShutter());
//        row.setDcnoOpenableDoor(dto.getDcnoOpenableDoor());
//        row.setDcnoFixGlass(dto.getDcnoFixGlass());
//        row.setDcnoTopBottomFix(dto.getDcnoTopBottomFix());
//
//        // STATUS — store R/I string values
//        row.setStatusFrame(dto.getStatusFrame());
//        row.setStatusDoorFrame(dto.getStatusDoorFrame());
//        row.setStatusShutter(dto.getStatusShutter());
//        row.setStatusOpenableDoor(dto.getStatusOpenableDoor());
//        row.setStatusFixGlass(dto.getStatusFixGlass());
//        row.setStatusTopBottomFix(dto.getStatusTopBottomFix());
//
//        // SUPPLY — server-side: R in STATUS → sqft, else 0
//        BigDecimal sqft = dto.getSqft();
//        row.setSupplyFrame(resolveSupply(dto.getStatusFrame(), sqft));
//        row.setSupplyDoorFrame(resolveSupply(dto.getStatusDoorFrame(), sqft));
//        row.setSupplyShutter(resolveSupply(dto.getStatusShutter(), sqft));
//        row.setSupplyOpenableDoor(resolveSupply(dto.getStatusOpenableDoor(), sqft));
//        row.setSupplyFixGlass(resolveSupply(dto.getStatusFixGlass(), sqft));
//        row.setSupplyTopBottomFix(resolveSupply(dto.getStatusTopBottomFix(), sqft));
//
//        // INSTALLATION — server-side: I in STATUS → sqft, else 0
//        row.setInstallFrame(resolveInstall(dto.getStatusFrame(), sqft));
//        row.setInstallDoorFrame(resolveInstall(dto.getStatusDoorFrame(), sqft));
//        row.setInstallShutter(resolveInstall(dto.getStatusShutter(), sqft));
//        row.setInstallOpenableDoor(resolveInstall(dto.getStatusOpenableDoor(), sqft));
//        row.setInstallFixGlass(resolveInstall(dto.getStatusFixGlass(), sqft));
//        row.setInstallTopBottomFix(resolveInstall(dto.getStatusTopBottomFix(), sqft));
//
//        // Extra
//        row.setHandoverStatus(dto.getHandoverStatus());
//        row.setDcNo(dto.getDcNo());
//
//        return row;
//    }
//
//    // ── CREATE ────────────────────────────────────────────────────────────────
//    @Transactional
//    public TrackerSheet create(TrackerSheetDTO dto) {
//        WorkOrder wo = workOrderRepository.findById(dto.getWorkOrderId())
//                .orElseThrow(() -> new IllegalArgumentException(
//                        "Work Order not found: " + dto.getWorkOrderId()));
//
//        Optional<TrackerSheet> existing = trackerSheetRepository.findByWorkOrderId(dto.getWorkOrderId());
//        if (existing.isPresent()) {
//            throw new IllegalArgumentException(
//                    "A tracker sheet already exists for Work Order: " + wo.getWorkOrderNo()
//                            + ". Use PUT to update it.");
//        }
//
//        TrackerSheet sheet = new TrackerSheet();
//        sheet.setWorkOrder(wo);
//        sheet.setProjectName(wo.getProjectName());
//        sheet.setTowerName(wo.getTowerName());
//        sheet.setDate(dto.getDate());
//
//        if (dto.getRows() != null) {
//            List<TrackerSheetRow> newRows = dto.getRows().stream()
//                    .map(r -> mapRow(r, sheet))
//                    .collect(Collectors.toList());
//            sheet.getRows().clear();
//            trackerSheetRepository.saveAndFlush(sheet); // flush DELETEs first
//            sheet.getRows().addAll(newRows);
//        }
//
//        return trackerSheetRepository.save(sheet);
//    }
//
//    // ── UPDATE ────────────────────────────────────────────────────────────────
//    @Transactional
//    public TrackerSheet update(Long id, TrackerSheetDTO dto) {
//        TrackerSheet sheet = trackerSheetRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException(
//                        "Tracker Sheet not found: " + id));
//
//        sheet.setDate(dto.getDate());
//
//        if (dto.getRows() != null) {
//            // ✅ orphanRemoval safe
//            sheet.getRows().clear();
//            List<TrackerSheetRow> newRows = dto.getRows().stream()
//                    .map(r -> mapRow(r, sheet))
//                    .collect(Collectors.toList());
//            sheet.getRows().addAll(newRows);
//        }
//
//        return trackerSheetRepository.save(sheet);
//    }
//
//    // ── READ ──────────────────────────────────────────────────────────────────
//    public Optional<TrackerSheet> getByWorkOrder(Long workOrderId) {
//        return trackerSheetRepository.findByWorkOrderId(workOrderId);
//    }
//
//    public TrackerSheet getById(Long id) {
//        return trackerSheetRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException(
//                        "Tracker Sheet not found: " + id));
//    }
//
//    public List<TrackerSheet> getByProject(String projectName) {
//        return trackerSheetRepository.findByProjectNameOrderByIdDesc(projectName);
//    }
//}

package onedeoleela.onedeoleela.Coordinator.Service;

import onedeoleela.onedeoleela.Coordinator.DTO.TrackerSheetDTO;
import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheet;
import onedeoleela.onedeoleela.Coordinator.Entity.TrackerSheetRow;
import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrder;
import onedeoleela.onedeoleela.Coordinator.Repository.TrackerSheetRepository;
import onedeoleela.onedeoleela.Coordinator.Repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TrackerSheetService {

    private final TrackerSheetRepository trackerSheetRepository;
    private final WorkOrderRepository    workOrderRepository;

    public TrackerSheetService(
            TrackerSheetRepository trackerSheetRepository,
            WorkOrderRepository    workOrderRepository
    ) {
        this.trackerSheetRepository = trackerSheetRepository;
        this.workOrderRepository    = workOrderRepository;
    }

    // ── Status check helpers ──────────────────────────────────────────────────

    private boolean isH(String statusVal) {
        return statusVal != null && statusVal.trim().equalsIgnoreCase("H");
    }

    // ── SUPPLY: R / I / H → sqft, else ZERO ──────────────────────────────────
    private BigDecimal resolveSupply(String statusVal, BigDecimal sqft) {
        if (statusVal == null) return BigDecimal.ZERO;
        String v = statusVal.trim().toUpperCase();
        if (v.equals("R") || v.equals("I") || v.equals("H")) {
            return sqft != null ? sqft.setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        }
        return BigDecimal.ZERO;
    }

    // ── INSTALLATION: I / H → sqft, else ZERO ────────────────────────────────
    private BigDecimal resolveInstall(String statusVal, BigDecimal sqft) {
        if (statusVal == null) return BigDecimal.ZERO;
        String v = statusVal.trim().toUpperCase();
        if (v.equals("I") || v.equals("H")) {
            return sqft != null ? sqft.setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        }
        return BigDecimal.ZERO;
    }

    // ── HANDOVER (6 shared cols): H → sqft, else ZERO ────────────────────────
    private BigDecimal resolveHandover(String statusVal, BigDecimal sqft) {
        if (statusVal == null) return BigDecimal.ZERO;
        if (statusVal.trim().equalsIgnoreCase("H")) {
            return sqft != null ? sqft.setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        }
        return BigDecimal.ZERO;
    }

    // ── Sqft: recalculate from length/height if provided, else use WO dims ────
    private BigDecimal computeSqft(TrackerSheetDTO.RowDTO dto) {
        // Priority 1: user-entered length + height
        if (dto.getLength() != null && dto.getHeight() != null
                && dto.getLength().compareTo(BigDecimal.ZERO) > 0
                && dto.getHeight().compareTo(BigDecimal.ZERO) > 0) {
            return dto.getLength()
                    .multiply(dto.getHeight())
                    .divide(new BigDecimal("1000000"), 10, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("10.764"))
                    .setScale(4, RoundingMode.HALF_UP);
        }
        // Priority 2: WO dims
        if (dto.getWoLnt() != null && dto.getWoHgt() != null
                && dto.getWoLnt().compareTo(BigDecimal.ZERO) > 0
                && dto.getWoHgt().compareTo(BigDecimal.ZERO) > 0) {
            return dto.getWoLnt()
                    .multiply(dto.getWoHgt())
                    .divide(new BigDecimal("1000000"), 10, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("10.764"))
                    .setScale(4, RoundingMode.HALF_UP);
        }
        // Priority 3: sqft already on the DTO (passed as-is from frontend)
        return dto.getSqft() != null ? dto.getSqft() : BigDecimal.ZERO;
    }

    // ── Map DTO row → Entity row ──────────────────────────────────────────────
    private TrackerSheetRow mapRow(TrackerSheetDTO.RowDTO dto, TrackerSheet sheet) {
        TrackerSheetRow row = new TrackerSheetRow();
        row.setTrackerSheet(sheet);

        // Auto-filled from WO
        row.setSrNo(dto.getSrNo());
        row.setFlat(dto.getFlat());
        row.setLocation(dto.getLocation());
        row.setWcode(dto.getWcode());
        row.setTypology(dto.getTypology());
        row.setSeries(dto.getSeries());
        row.setWoLnt(dto.getWoLnt());
        row.setWoHgt(dto.getWoHgt());

        // Compute effective sqft (user dims override WO dims)
        BigDecimal sqft = computeSqft(dto);
        row.setSqft(sqft);

        // User filled
        row.setLength(dto.getLength());
        row.setHeight(dto.getHeight());
        row.setJobCard(dto.getJobCard());

        // DC.NO
        row.setDcnoFrame(dto.getDcnoFrame());
        row.setDcnoDoorFrame(dto.getDcnoDoorFrame());
        row.setDcnoShutter(dto.getDcnoShutter());
        row.setDcnoOpenableDoor(dto.getDcnoOpenableDoor());
        row.setDcnoFixGlass(dto.getDcnoFixGlass());
        row.setDcnoTopBottomFix(dto.getDcnoTopBottomFix());

        // STATUS — store R / I / H string values
        row.setStatusFrame(dto.getStatusFrame());
        row.setStatusDoorFrame(dto.getStatusDoorFrame());
        row.setStatusShutter(dto.getStatusShutter());
        row.setStatusOpenableDoor(dto.getStatusOpenableDoor());
        row.setStatusFixGlass(dto.getStatusFixGlass());
        row.setStatusTopBottomFix(dto.getStatusTopBottomFix());

        // SUPPLY — R / I / H → sqft
        row.setSupplyFrame(resolveSupply(dto.getStatusFrame(), sqft));
        row.setSupplyDoorFrame(resolveSupply(dto.getStatusDoorFrame(), sqft));
        row.setSupplyShutter(resolveSupply(dto.getStatusShutter(), sqft));
        row.setSupplyOpenableDoor(resolveSupply(dto.getStatusOpenableDoor(), sqft));
        row.setSupplyFixGlass(resolveSupply(dto.getStatusFixGlass(), sqft));
        row.setSupplyTopBottomFix(resolveSupply(dto.getStatusTopBottomFix(), sqft));

        // INSTALLATION — I / H → sqft
        row.setInstallFrame(resolveInstall(dto.getStatusFrame(), sqft));
        row.setInstallDoorFrame(resolveInstall(dto.getStatusDoorFrame(), sqft));
        row.setInstallShutter(resolveInstall(dto.getStatusShutter(), sqft));
        row.setInstallOpenableDoor(resolveInstall(dto.getStatusOpenableDoor(), sqft));
        row.setInstallFixGlass(resolveInstall(dto.getStatusFixGlass(), sqft));
        row.setInstallTopBottomFix(resolveInstall(dto.getStatusTopBottomFix(), sqft));

        // HANDOVER 6 shared cols — H → sqft per col
        row.setHandoverFrame(resolveHandover(dto.getStatusFrame(), sqft));
        row.setHandoverDoorFrame(resolveHandover(dto.getStatusDoorFrame(), sqft));
        row.setHandoverShutter(resolveHandover(dto.getStatusShutter(), sqft));
        row.setHandoverOpenableDoor(resolveHandover(dto.getStatusOpenableDoor(), sqft));
        row.setHandoverFixGlass(resolveHandover(dto.getStatusFixGlass(), sqft));
        row.setHandoverTopBottomFix(resolveHandover(dto.getStatusTopBottomFix(), sqft));

        // HANDOVER HARDWARE — fills if ANY status col in this row is H
        boolean anyH = isH(dto.getStatusFrame())
                || isH(dto.getStatusDoorFrame())
                || isH(dto.getStatusShutter())
                || isH(dto.getStatusOpenableDoor())
                || isH(dto.getStatusFixGlass())
                || isH(dto.getStatusTopBottomFix());
        row.setHandoverHardware(anyH
                ? sqft.setScale(4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

        // Extra
        row.setHandoverStatus(dto.getHandoverStatus());
        row.setDcNo(dto.getDcNo());

        return row;
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    @Transactional
    public TrackerSheet create(TrackerSheetDTO dto) {
        WorkOrder wo = workOrderRepository.findById(dto.getWorkOrderId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Work Order not found: " + dto.getWorkOrderId()));

        Optional<TrackerSheet> existing =
                trackerSheetRepository.findByWorkOrderId(dto.getWorkOrderId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException(
                    "A tracker sheet already exists for Work Order: "
                            + wo.getWorkOrderNo() + ". Use PUT to update it.");
        }

        TrackerSheet sheet = new TrackerSheet();
        sheet.setWorkOrder(wo);
        sheet.setProjectName(wo.getProjectName());
        sheet.setTowerName(wo.getTowerName());
        sheet.setDate(dto.getDate());

        if (dto.getRows() != null) {
            List<TrackerSheetRow> newRows = dto.getRows().stream()
                    .map(r -> mapRow(r, sheet))
                    .collect(Collectors.toList());
            sheet.getRows().clear();
            trackerSheetRepository.saveAndFlush(sheet);
            sheet.getRows().addAll(newRows);
        }

        return trackerSheetRepository.save(sheet);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    @Transactional
    public TrackerSheet update(Long id, TrackerSheetDTO dto) {
        TrackerSheet sheet = trackerSheetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Tracker Sheet not found: " + id));

        sheet.setDate(dto.getDate());

        if (dto.getRows() != null) {
            sheet.getRows().clear();
            List<TrackerSheetRow> newRows = dto.getRows().stream()
                    .map(r -> mapRow(r, sheet))
                    .collect(Collectors.toList());
            sheet.getRows().addAll(newRows);
        }

        return trackerSheetRepository.save(sheet);
    }

    // ── READ ──────────────────────────────────────────────────────────────────
    public Optional<TrackerSheet> getByWorkOrder(Long workOrderId) {
        return trackerSheetRepository.findByWorkOrderId(workOrderId);
    }

    public TrackerSheet getById(Long id) {
        return trackerSheetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Tracker Sheet not found: " + id));
    }

    public List<TrackerSheet> getByProject(String projectName) {
        return trackerSheetRepository.findByProjectNameOrderByIdDesc(projectName);
    }
}