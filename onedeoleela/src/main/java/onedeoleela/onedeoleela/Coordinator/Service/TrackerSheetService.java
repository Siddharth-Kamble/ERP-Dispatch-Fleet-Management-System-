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
//    // ── Map DTO row → Entity row ──────────────────────────────────────────────
//    private TrackerSheetRow mapRow(TrackerSheetDTO.RowDTO dto, TrackerSheet sheet) {
//        TrackerSheetRow row = new TrackerSheetRow();
//        row.setTrackerSheet(sheet);
//
//        // Auto-filled fields
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
//        // User-filled fields
//        row.setLength(dto.getLength());
//        row.setHeight(dto.getHeight());
//        row.setJobCard(dto.getJobCard());
//
//        // SUPPLY
//        row.setSupplyFrame(dto.getSupplyFrame());
//        row.setSupplyDoorFrame(dto.getSupplyDoorFrame());
//        row.setSupplyShutter(dto.getSupplyShutter());
//        row.setSupplyOpenableDoor(dto.getSupplyOpenableDoor());
//        row.setSupplyFixGlass(dto.getSupplyFixGlass());
//        row.setSupplyTopBottomFix(dto.getSupplyTopBottomFix());
//
//        // INSTALLATION
//        row.setInstallFrame(dto.getInstallFrame());
//        row.setInstallDoorFrame(dto.getInstallDoorFrame());
//        row.setInstallShutter(dto.getInstallShutter());
//        row.setInstallOpenableDoor(dto.getInstallOpenableDoor());
//        row.setInstallFixGlass(dto.getInstallFixGlass());
//        row.setInstallTopBottomFix(dto.getInstallTopBottomFix());
//
//        // HARDWARE
//        row.setHwFrame(dto.getHwFrame());
//        row.setHwDoorFrame(dto.getHwDoorFrame());
//        row.setHwShutter(dto.getHwShutter());
//        row.setHwOpenableDoor(dto.getHwOpenableDoor());
//        row.setHwFixGlass(dto.getHwFixGlass());
//        row.setHwTopBottomFix(dto.getHwTopBottomFix());
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
//        // Check if a tracker sheet already exists for this WO
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
//            // ✅ orphanRemoval safe — clear and re-add, never reassign
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
//    // ── GET by Work Order ─────────────────────────────────────────────────────
//    public Optional<TrackerSheet> getByWorkOrder(Long workOrderId) {
//        return trackerSheetRepository.findByWorkOrderId(workOrderId);
//    }
//
//    // ── GET by ID ─────────────────────────────────────────────────────────────
//    public TrackerSheet getById(Long id) {
//        return trackerSheetRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException(
//                        "Tracker Sheet not found: " + id));
//    }
//
//    // ── GET by Project ────────────────────────────────────────────────────────
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

    // ── Map DTO row → Entity row ──────────────────────────────────────────────
    private TrackerSheetRow mapRow(TrackerSheetDTO.RowDTO dto, TrackerSheet sheet) {
        TrackerSheetRow row = new TrackerSheetRow();
        row.setTrackerSheet(sheet);

        // Auto-filled
        row.setSrNo(dto.getSrNo());
        row.setFlat(dto.getFlat());
        row.setLocation(dto.getLocation());
        row.setWcode(dto.getWcode());
        row.setTypology(dto.getTypology());
        row.setSeries(dto.getSeries());
        row.setWoLnt(dto.getWoLnt());
        row.setWoHgt(dto.getWoHgt());
        row.setSqft(dto.getSqft());

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

        // STATUS
        row.setStatusFrame(dto.getStatusFrame());
        row.setStatusDoorFrame(dto.getStatusDoorFrame());
        row.setStatusShutter(dto.getStatusShutter());
        row.setStatusOpenableDoor(dto.getStatusOpenableDoor());
        row.setStatusFixGlass(dto.getStatusFixGlass());
        row.setStatusTopBottomFix(dto.getStatusTopBottomFix());
        row.setStatusHardware(dto.getStatusHardware());

        // SUPPLY
        row.setSupplyFrame(dto.getSupplyFrame());
        row.setSupplyDoorFrame(dto.getSupplyDoorFrame());
        row.setSupplyShutter(dto.getSupplyShutter());
        row.setSupplyOpenableDoor(dto.getSupplyOpenableDoor());
        row.setSupplyFixGlass(dto.getSupplyFixGlass());
        row.setSupplyTopBottomFix(dto.getSupplyTopBottomFix());

        // INSTALLATION
        row.setInstallFrame(dto.getInstallFrame());
        row.setInstallDoorFrame(dto.getInstallDoorFrame());
        row.setInstallShutter(dto.getInstallShutter());
        row.setInstallOpenableDoor(dto.getInstallOpenableDoor());
        row.setInstallFixGlass(dto.getInstallFixGlass());
        row.setInstallTopBottomFix(dto.getInstallTopBottomFix());

        // HARDWARE
        row.setHwFrame(dto.getHwFrame());
        row.setHwDoorFrame(dto.getHwDoorFrame());
        row.setHwShutter(dto.getHwShutter());
        row.setHwOpenableDoor(dto.getHwOpenableDoor());
        row.setHwFixGlass(dto.getHwFixGlass());
        row.setHwTopBottomFix(dto.getHwTopBottomFix());

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

        Optional<TrackerSheet> existing = trackerSheetRepository.findByWorkOrderId(dto.getWorkOrderId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException(
                    "A tracker sheet already exists for Work Order: " + wo.getWorkOrderNo()
                            + ". Use PUT to update it.");
        }

        TrackerSheet sheet = new TrackerSheet();
        sheet.setWorkOrder(wo);
        sheet.setProjectName(wo.getProjectName());
        sheet.setTowerName(wo.getTowerName());
        sheet.setDate(dto.getDate());

        if (dto.getRows() != null) {
            List<TrackerSheetRow> rows = dto.getRows().stream()
                    .map(r -> mapRow(r, sheet))
                    .collect(Collectors.toList());
            sheet.setRows(rows);
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
            // ✅ orphanRemoval safe — clear then re-add
            sheet.getRows().clear();
            List<TrackerSheetRow> newRows = dto.getRows().stream()
                    .map(r -> mapRow(r, sheet))
                    .collect(Collectors.toList());
            sheet.getRows().addAll(newRows);
        }

        return trackerSheetRepository.save(sheet);
    }

    // ── GET by Work Order ─────────────────────────────────────────────────────
    public Optional<TrackerSheet> getByWorkOrder(Long workOrderId) {
        return trackerSheetRepository.findByWorkOrderId(workOrderId);
    }

    // ── GET by ID ─────────────────────────────────────────────────────────────
    public TrackerSheet getById(Long id) {
        return trackerSheetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Tracker Sheet not found: " + id));
    }

    // ── GET by Project ────────────────────────────────────────────────────────
    public List<TrackerSheet> getByProject(String projectName) {
        return trackerSheetRepository.findByProjectNameOrderByIdDesc(projectName);
    }
}