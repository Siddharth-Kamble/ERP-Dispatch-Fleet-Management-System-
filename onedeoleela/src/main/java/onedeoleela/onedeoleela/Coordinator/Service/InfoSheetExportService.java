package onedeoleela.onedeoleela.Coordinator.Service;


import onedeoleela.onedeoleela.Coordinator.DTO.InfoSheetExportDTO;
import onedeoleela.onedeoleela.Coordinator.Entity.*;
import onedeoleela.onedeoleela.Coordinator.Repository.InfoSheetRepository;
import onedeoleela.onedeoleela.Coordinator.Repository.WorkOrderRepository;
import onedeoleela.onedeoleela.Entity.Project;
import onedeoleela.onedeoleela.Repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class InfoSheetExportService {

    private final InfoSheetRepository  infoSheetRepository;
    private final WorkOrderRepository  workOrderRepository;
    private final ProjectRepository    projectRepository;

    public InfoSheetExportService(
            InfoSheetRepository infoSheetRepository,
            WorkOrderRepository workOrderRepository,
            ProjectRepository   projectRepository
    ) {
        this.infoSheetRepository = infoSheetRepository;
        this.workOrderRepository = workOrderRepository;
        this.projectRepository   = projectRepository;
    }

    public InfoSheetExportDTO buildExportData(Long sheetId) {
        // 1. Load sheet
        InfoSheet sheet = infoSheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("Sheet not found: " + sheetId));

        // 2. Load work order
        WorkOrder wo = sheet.getWorkOrder();

        // 3. Load project for floor count
        Project project = projectRepository
                .findByProjectName(wo.getProjectName())
                .orElse(null);

        int totalFloors  = (project != null && project.getNumberOfFloors() != null)
                ? project.getNumberOfFloors() : 0;

        // 4. Flats per floor = distinct flat numbers in the info sheet
        //    (assumes each floor has the same flat layout)
        long flatsPerFloor = sheet.getFlats().stream()
                .map(InfoSheetFlat::getFlatNo)
                .distinct()
                .count();
        if (flatsPerFloor == 0) flatsPerFloor = 1;

        int totalFlats          = totalFloors * (int) flatsPerFloor;
        int refuseFlats         = 0; // reserved for future
        int actualWorkableFlats = totalFlats - refuseFlats;

        // 5. Build rows from WO items
        List<InfoSheetExportDTO.ExportRow> rows = new ArrayList<>();
        double grandTotalSqft           = 0;
        double totalWindowsPerFloor     = 0;
        double totalWindowsPerFloorSqft = 0;
        double totalWindowsInTower      = 0;

        for (WorkOrderItem item : wo.getItems()) {
            double sqft          = item.getSqft()      != null ? item.getSqft().doubleValue()      : 0;
            double perFloorCount = item.getWoQtyNos()  != null ? item.getWoQtyNos().doubleValue()  : 0;
            double length        = item.getLength()    != null ? item.getLength().doubleValue()    : 0;
            double height        = item.getHeight()    != null ? item.getHeight().doubleValue()    : 0;

            double perFloorSqft  = sqft * perFloorCount;
            double total         = perFloorSqft * totalFloors;
            int    refuseCount   = 0;
            double netWindow     = total - refuseCount;
            double netWindowSqft = netWindow * sqft;

            InfoSheetExportDTO.ExportRow row = new InfoSheetExportDTO.ExportRow();
            row.setLocation(item.getLocation());
            row.setWindowCode(item.getWindowCode());
            row.setTypology(item.getTypology());
            row.setSeries(item.getSeries() != null ? item.getSeries() : "");
            row.setLength(length);
            row.setHeight(height);
            row.setSqft(sqft);
            row.setPerFloorCount(perFloorCount);
            row.setPerFloorSqft(perFloorSqft);
            row.setTotal((int) total);
            row.setRefuseCount(refuseCount);
            row.setNetWindow(netWindow);
            row.setNetWindowSqft(netWindowSqft);
            rows.add(row);

            grandTotalSqft           += netWindowSqft;
            totalWindowsPerFloor     += perFloorCount;
            totalWindowsPerFloorSqft += perFloorSqft;
            totalWindowsInTower      += total;
        }

        // 6. Assemble DTO
        InfoSheetExportDTO dto = new InfoSheetExportDTO();
        dto.setSheetId(sheet.getId());
        dto.setWorkOrderNo(wo.getWorkOrderNo());
        dto.setProjectName(wo.getProjectName());
        dto.setTowerName(wo.getTowerName());
        dto.setDate(sheet.getDate() != null ? sheet.getDate().toString() : "");
        dto.setTotalFloors(totalFloors);
        dto.setFlatsPerFloor((int) flatsPerFloor);
        dto.setTotalFlats(totalFlats);
        dto.setRefuseFlats(refuseFlats);
        dto.setActualWorkableFlats(actualWorkableFlats);
        dto.setRows(rows);
        dto.setGrandTotalSqft(grandTotalSqft);
        dto.setTotalWindowsPerFloor(totalWindowsPerFloor);
        dto.setTotalWindowsPerFloorSqft(totalWindowsPerFloorSqft);
        dto.setTotalWindowsInTower(totalWindowsInTower);
        dto.setTotalWindowsInTowerSqft(grandTotalSqft);
        return dto;
    }
}