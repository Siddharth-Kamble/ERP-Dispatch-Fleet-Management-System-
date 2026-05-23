package onedeoleela.onedeoleela.Coordinator.Service;

import onedeoleela.onedeoleela.Coordinator.DTO.WorkOrderDTO;
import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrder;
import onedeoleela.onedeoleela.Coordinator.Entity.WorkOrderItem;
import onedeoleela.onedeoleela.Coordinator.Repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkOrderService {

    private final WorkOrderRepository repository;

    public WorkOrderService(WorkOrderRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public WorkOrder create(WorkOrderDTO dto) {
        if (repository.existsByWorkOrderNo(dto.getWorkOrderNo())) {
            throw new IllegalArgumentException("Work Order No. already exists: " + dto.getWorkOrderNo());
        }

        WorkOrder wo = new WorkOrder();
        wo.setWorkOrderNo(dto.getWorkOrderNo());
        wo.setProjectName(dto.getProjectName());
        wo.setDate(dto.getDate());

        if (dto.getItems() != null) {
            List<WorkOrderItem> items = dto.getItems().stream().map(i -> {
                WorkOrderItem item = new WorkOrderItem();
                item.setSrNo(i.getSrNo());
                // ── NEW FIELDS ──────────────────────────
                item.setLocation(i.getLocation());
                item.setWindowCode(i.getWindowCode());
                item.setTypology(i.getTypology());
                item.setSeries(i.getSeries());
                // ────────────────────────────────────────
                item.setLength(i.getLength());
                item.setHeight(i.getHeight());
                item.setSqft(i.getSqft());
                item.setWoQtySqft(i.getWoQtySqft());
                item.setWoQtyNos(i.getWoQtyNos());
                item.setFloorPlanQty(i.getFloorPlanQty());
                item.setWorkOrder(wo);
                return item;
            }).collect(Collectors.toList());
            wo.setItems(items);
        }

        return repository.save(wo);
    }

    // ── UPDATE work order items ──────────────────────────────────────────────
    @Transactional
    public WorkOrder update(Long id, WorkOrderDTO dto) {
        WorkOrder wo = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work Order not found: " + id));

        wo.setProjectName(dto.getProjectName());
        wo.setDate(dto.getDate());

        if (dto.getItems() != null) {
            List<WorkOrderItem> items = dto.getItems().stream().map(i -> {
                WorkOrderItem item = new WorkOrderItem();
                item.setSrNo(i.getSrNo());
                item.setLocation(i.getLocation());
                item.setWindowCode(i.getWindowCode());
                item.setTypology(i.getTypology());
                item.setSeries(i.getSeries());
                item.setLength(i.getLength());
                item.setHeight(i.getHeight());
                item.setSqft(i.getSqft());
                item.setWoQtySqft(i.getWoQtySqft());
                item.setWoQtyNos(i.getWoQtyNos());
                item.setFloorPlanQty(i.getFloorPlanQty());
                item.setWorkOrder(wo);
                return item;
            }).collect(Collectors.toList());
            wo.setItems(items);
        }

        return repository.save(wo);
    }

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