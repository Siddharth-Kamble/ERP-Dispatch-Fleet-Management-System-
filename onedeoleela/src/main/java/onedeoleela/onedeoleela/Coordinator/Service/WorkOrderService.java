

package onedeoleela.onedeoleela.Coordinator.Service;

import onedeoleela.onedeoleela.Coordinator.DTO.WorkOrderDTO;
import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrder;
import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrderItem;
import onedeoleela.onedeoleela.Coordinator.Repository.WorkOrderRepository;
import onedeoleela.onedeoleela.Coordinator.Util.SqftConverter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkOrderService {

    private final WorkOrderRepository repository;

    public WorkOrderService(WorkOrderRepository repository) {
        this.repository = repository;
    }

    // ── Map DTO → Entity ──────────────────────────────────────────────────────
    private WorkOrderItem mapItem(WorkOrderDTO.ItemDTO i, WorkOrder wo) {
        WorkOrderItem item = new WorkOrderItem();
        item.setSrNo(i.getSrNo());
        item.setLocation(i.getLocation());
        item.setWindowCode(i.getWindowCode());
        item.setTypology(i.getTypology());
        item.setSeries(i.getSeries());
        item.setLength(i.getLength());
        item.setHeight(i.getHeight());

        // Server-side sqft recalculation
        if (i.getLength() != null && i.getHeight() != null) {
            BigDecimal serverSqft = SqftConverter.convertMm(i.getLength(), i.getHeight());
            item.setSqft(serverSqft);
        } else {
            item.setSqft(i.getSqft());
        }

        // W/O Qty unit & conversion
        String woQtyUnit = i.getWoQtyUnit() != null ? i.getWoQtyUnit() : "sqft";
        item.setWoQtyUnit(woQtyUnit);
        item.setWoQtySqftRaw(i.getWoQtySqftRaw());

        if (i.getWoQtySqftRaw() != null && !i.getWoQtySqftRaw().isBlank()) {
            try {
                BigDecimal rawVal = new BigDecimal(i.getWoQtySqftRaw().trim());
                BigDecimal converted = "sqm".equalsIgnoreCase(woQtyUnit)
                        ? rawVal.multiply(new BigDecimal("10.764")).setScale(4, RoundingMode.HALF_UP)
                        : rawVal.setScale(4, RoundingMode.HALF_UP);
                item.setWoQtySqft(converted);

                if (item.getSqft() != null && item.getSqft().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal nos = converted.divide(item.getSqft(), 0, RoundingMode.FLOOR);
                    item.setWoQtyNos(nos);
                } else {
                    item.setWoQtyNos(i.getWoQtyNos());
                }
            } catch (NumberFormatException ex) {
                item.setWoQtySqft(i.getWoQtySqft());
                item.setWoQtyNos(i.getWoQtyNos());
            }
        } else {
            item.setWoQtySqft(i.getWoQtySqft());
            item.setWoQtyNos(i.getWoQtyNos());
        }

        item.setFloorPlanQty(i.getFloorPlanQty());

        // ── NEW: save qtyAsPerFloorPlan ───────────────────────────────────────
        item.setQtyAsPerFloorPlan(i.getQtyAsPerFloorPlan());

        item.setWorkOrder(wo);
        return item;
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    @Transactional
    public WorkOrder create(WorkOrderDTO dto) {
        if (repository.existsByWorkOrderNo(dto.getWorkOrderNo())) {
            throw new IllegalArgumentException("Work Order No. already exists: " + dto.getWorkOrderNo());
        }

        WorkOrder wo = new WorkOrder();
        wo.setWorkOrderNo(dto.getWorkOrderNo());
        wo.setProjectName(dto.getProjectName());
        wo.setTowerName(dto.getTowerName());   // ── NEW ──
        wo.setDate(dto.getDate());

        if (dto.getItems() != null) {
            List<WorkOrderItem> items = dto.getItems().stream()
                    .map(i -> mapItem(i, wo))
                    .collect(Collectors.toList());
            wo.setItems(items);
        }

        return repository.save(wo);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    @Transactional
    public WorkOrder update(Long id, WorkOrderDTO dto) {
        WorkOrder wo = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work Order not found: " + id));

        wo.setProjectName(dto.getProjectName());
        wo.setTowerName(dto.getTowerName());    // ── NEW ──
        wo.setDate(dto.getDate());

        if (dto.getItems() != null) {
            // ✅ Fix orphan deletion bug — clear and re-add, never reassign
            wo.getItems().clear();

            List<WorkOrderItem> newItems = dto.getItems().stream()
                    .map(i -> mapItem(i, wo))
                    .collect(Collectors.toList());

            wo.getItems().addAll(newItems);
        }

        return repository.save(wo);
    }

    // ── READ ──────────────────────────────────────────────────────────────────
    public List<WorkOrder> getAll() {
        return repository.findAllByOrderByIdDesc();
    }

    public List<WorkOrder> getByProjectName(String projectName) {
        return repository.findByProjectNameOrderByIdDesc(projectName);
    }

    public WorkOrder getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work Order not found: " + id));
    }
}