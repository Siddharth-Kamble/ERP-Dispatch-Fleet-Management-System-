package onedeoleela.onedeoleela.Coordinator.Service;


import onedeoleela.onedeoleela.Coordinator.DTO.InfoSheetDTO;
import onedeoleela.onedeoleela.Coordinator.Entity.InfoSheet;
import onedeoleela.onedeoleela.Coordinator.Entity.InfoSheetItem;
import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrder;
import onedeoleela.onedeoleela.Coordinator.Repository.InfoSheetRepository;
import onedeoleela.onedeoleela.Coordinator.Repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InfoSheetService {

    private final InfoSheetRepository infoSheetRepository;
    private final WorkOrderRepository workOrderRepository;

    public InfoSheetService(
            InfoSheetRepository infoSheetRepository,
            WorkOrderRepository workOrderRepository
    ) {
        this.infoSheetRepository = infoSheetRepository;
        this.workOrderRepository = workOrderRepository;
    }

    // ── Map DTO item → Entity item ────────────────────────────────────────────
    private InfoSheetItem mapItem(InfoSheetDTO.ItemDTO dto, InfoSheet sheet) {
        InfoSheetItem item = new InfoSheetItem();
        item.setSrNo(dto.getSrNo());
        item.setLocation(dto.getLocation());
        item.setWindowCode(dto.getWindowCode());
        item.setTypology(dto.getTypology());
        item.setSeries(dto.getSeries());
        item.setLength(dto.getLength());
        item.setHeight(dto.getHeight());
        item.setSqft(dto.getSqft());
        item.setInfoSheet(sheet);
        return item;
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    @Transactional
    public InfoSheet create(InfoSheetDTO dto) {
        WorkOrder wo = workOrderRepository.findById(dto.getWorkOrderId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Work Order not found: " + dto.getWorkOrderId()));

        InfoSheet sheet = new InfoSheet();
        sheet.setWorkOrder(wo);
        sheet.setProjectName(wo.getProjectName());   // auto from WO
        sheet.setTowerName(wo.getTowerName());        // auto from WO
        sheet.setFlatType(dto.getFlatType());
        sheet.setFlatNo(dto.getFlatNo());
        sheet.setDate(dto.getDate());

        if (dto.getItems() != null) {
            List<InfoSheetItem> items = dto.getItems().stream()
                    .map(i -> mapItem(i, sheet))
                    .collect(Collectors.toList());
            sheet.setItems(items);
        }

        return infoSheetRepository.save(sheet);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    @Transactional
    public InfoSheet update(Long id, InfoSheetDTO dto) {
        InfoSheet sheet = infoSheetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Info Sheet not found: " + id));

        sheet.setFlatType(dto.getFlatType());
        sheet.setFlatNo(dto.getFlatNo());
        sheet.setDate(dto.getDate());

        if (dto.getItems() != null) {
            // ✅ orphanRemoval safe — clear and re-add, never reassign
            sheet.getItems().clear();
            List<InfoSheetItem> newItems = dto.getItems().stream()
                    .map(i -> mapItem(i, sheet))
                    .collect(Collectors.toList());
            sheet.getItems().addAll(newItems);
        }

        return infoSheetRepository.save(sheet);
    }

    // ── READ ──────────────────────────────────────────────────────────────────
    public List<InfoSheet> getByWorkOrder(Long workOrderId) {
        return infoSheetRepository.findByWorkOrderIdOrderByIdDesc(workOrderId);
    }

    public InfoSheet getById(Long id) {
        return infoSheetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Info Sheet not found: " + id));
    }

    public List<InfoSheet> getByProject(String projectName) {
        return infoSheetRepository.findByProjectNameOrderByIdDesc(projectName);
    }
}