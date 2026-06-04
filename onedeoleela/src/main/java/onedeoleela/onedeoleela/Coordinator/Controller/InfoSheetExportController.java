package onedeoleela.onedeoleela.Coordinator.Controller;


import onedeoleela.onedeoleela.Coordinator.DTO.InfoSheetExportDTO;
import onedeoleela.onedeoleela.Coordinator.Service.InfoSheetExportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/info-sheets")
@CrossOrigin(origins = "*")
public class InfoSheetExportController {

    private final InfoSheetExportService exportService;

    public InfoSheetExportController(InfoSheetExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/{id}/export-data")
    public ResponseEntity<InfoSheetExportDTO> getExportData(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(exportService.buildExportData(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}