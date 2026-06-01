//package onedeoleela.onedeoleela.Coordinator.Controller;
//
//
//import onedeoleela.onedeoleela.Coordinator.DTO.InfoSheetDTO;
//import onedeoleela.onedeoleela.Coordinator.Entity.InfoSheet;
//import onedeoleela.onedeoleela.Coordinator.Service.InfoSheetService;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/info-sheets")
//@CrossOrigin(origins = "*")
//public class InfoSheetController {
//
//    private final InfoSheetService service;
//
//    public InfoSheetController(InfoSheetService service) {
//        this.service = service;
//    }
//
//    // POST /api/info-sheets → create new info sheet
//    @PostMapping
//    public ResponseEntity<?> create(@RequestBody InfoSheetDTO dto) {
//        try {
//            InfoSheet saved = service.create(dto);
//            return ResponseEntity.ok(Map.of(
//                    "success", true,
//                    "id",      saved.getId(),
//                    "message", "Info Sheet saved successfully"
//            ));
//        } catch (IllegalArgumentException ex) {
//            return ResponseEntity.badRequest()
//                    .body(Map.of("success", false, "message", ex.getMessage()));
//        }
//    }
//
//    // PUT /api/info-sheets/{id} → update existing
//    @PutMapping("/{id}")
//    public ResponseEntity<?> update(
//            @PathVariable Long id,
//            @RequestBody InfoSheetDTO dto
//    ) {
//        try {
//            InfoSheet updated = service.update(id, dto);
//            return ResponseEntity.ok(Map.of(
//                    "success", true,
//                    "id",      updated.getId(),
//                    "message", "Info Sheet updated successfully"
//            ));
//        } catch (IllegalArgumentException ex) {
//            return ResponseEntity.badRequest()
//                    .body(Map.of("success", false, "message", ex.getMessage()));
//        }
//    }
//
//    // GET /api/info-sheets/by-work-order/{workOrderId}
//    // → all sheets for a work order (shown in list view)
//    @GetMapping("/by-work-order/{workOrderId}")
//    public ResponseEntity<List<InfoSheet>> getByWorkOrder(
//            @PathVariable Long workOrderId
//    ) {
//        return ResponseEntity.ok(service.getByWorkOrder(workOrderId));
//    }
//
//    // GET /api/info-sheets/{id} → single sheet for editing
//    @GetMapping("/{id}")
//    public ResponseEntity<?> getById(@PathVariable Long id) {
//        try {
//            return ResponseEntity.ok(service.getById(id));
//        } catch (IllegalArgumentException ex) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    // GET /api/info-sheets/by-project/{projectName}
//    @GetMapping("/by-project/{projectName}")
//    public ResponseEntity<List<InfoSheet>> getByProject(
//            @PathVariable String projectName
//    ) {
//        return ResponseEntity.ok(service.getByProject(projectName));
//    }
//}

package onedeoleela.onedeoleela.Coordinator.Controller;

import onedeoleela.onedeoleela.Coordinator.DTO.InfoSheetDTO;
import onedeoleela.onedeoleela.Coordinator.Entity.InfoSheet;
import onedeoleela.onedeoleela.Coordinator.Service.InfoSheetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/info-sheets")
@CrossOrigin(origins = "*")
public class InfoSheetController {

    private final InfoSheetService service;

    public InfoSheetController(InfoSheetService service) {
        this.service = service;
    }

    // POST /api/info-sheets
    @PostMapping
    public ResponseEntity<?> create(@RequestBody InfoSheetDTO dto) {
        try {
            InfoSheet saved = service.create(dto);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id",      saved.getId(),
                    "message", "Info Sheet saved successfully"
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    // PUT /api/info-sheets/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody InfoSheetDTO dto
    ) {
        try {
            InfoSheet updated = service.update(id, dto);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id",      updated.getId(),
                    "message", "Info Sheet updated successfully"
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    // DELETE /api/info-sheets/{sheetId}/flats/{flatId}
    @DeleteMapping("/{sheetId}/flats/{flatId}")
    public ResponseEntity<?> deleteFlat(
            @PathVariable Long sheetId,
            @PathVariable Long flatId
    ) {
        try {
            service.deleteFlat(sheetId, flatId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Flat deleted"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    // GET /api/info-sheets/by-work-order/{workOrderId}
    @GetMapping("/by-work-order/{workOrderId}")
    public ResponseEntity<List<InfoSheet>> getByWorkOrder(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(service.getByWorkOrder(workOrderId));
    }

    // GET /api/info-sheets/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/info-sheets/by-project/{projectName}
    @GetMapping("/by-project/{projectName}")
    public ResponseEntity<List<InfoSheet>> getByProject(@PathVariable String projectName) {
        return ResponseEntity.ok(service.getByProject(projectName));
    }
}