//package onedeoleela.onedeoleela.Controller;
//
//import onedeoleela.onedeoleela.Entity.Item;
//import onedeoleela.onedeoleela.Service.ItemService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/items")
//public class ItemController {
//
//    @Autowired
//    private ItemService itemService;
//
//    // Create Item
//    @PostMapping
//    public Item createItem(@RequestBody Item item) {
//        return itemService.saveItem(item);
//    }
//
//    // Get all Items
//    @GetMapping
//    public List<Item> getAllItems() {
//        return itemService.getAllItems();
//    }
//
//    // Get Item by ID
//    @GetMapping("/{id}")
//    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
//        return itemService.getItemById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }
//
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
//        return itemService.getItemById(id).map(item -> {
//            itemService.deleteItem(id);
//            return ResponseEntity.ok().<Void>build();
//        }).orElse(ResponseEntity.notFound().build());
//    }
//        @PostMapping("/upload/{tripId}")
//        public ResponseEntity<String> bulkUploadItems(
//                @PathVariable("tripId") Long tripId,
//                @RequestParam("projectId") Long projectId,
//                @RequestParam("towerId") Long towerId,   // ✅ NEW
//                @RequestParam("file") MultipartFile file
//        ) {
//            try {
//                String message = itemService.bulkUpload(file, tripId, projectId, towerId);
//                return ResponseEntity.ok(message);
//            } catch (Exception e) {
//                return ResponseEntity.status(500)
//                        .body("Bulk upload failed: " + e.getMessage());
//            }
//        }
//
//    @PostMapping("/create")
//    public ResponseEntity<Item> createSingleItem(
//            @RequestParam Long tripId,
//            @RequestParam Long projectId,
//            @RequestParam Long towerId,   // ✅ NEW
//            @RequestBody Item item
//    ) {
//        Item savedItem = itemService.createSingleItem(item, tripId, projectId, towerId);
//        return ResponseEntity.ok(savedItem);
//    }
//
//
//
//    @PutMapping("/{id}")
//    public ResponseEntity<Item> updateItem(
//            @PathVariable Long id,
//            @RequestBody Item updatedItem
//    ) {
//        Item item = itemService.updateItem(id, updatedItem);
//        return ResponseEntity.ok(item);
//    }
//
//}




package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.Item;
import onedeoleela.onedeoleela.Service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    // Create Item
    @PostMapping
    public Item createItem(@RequestBody Item item) {
        return itemService.saveItem(item);
    }

    // Get all Items
    @GetMapping
    public List<Item> getAllItems() {
        return itemService.getAllItems();
    }

    // Get Item by ID
    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        return itemService.getItemById(id).map(item -> {
            itemService.deleteItem(id);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Bulk upload via Excel file.
     *
     * Rules enforced in ItemService.bulkUpload():
     *  - Floor No  (column C, index 2) is MANDATORY for every data row
     *  - Flat No   (column D, index 3) is MANDATORY for every data row
     *  - If ANY row is missing either mandatory field → the ENTIRE file is rejected
     *    and a 400 Bad Request is returned with details of which rows failed.
     *  - Completely empty rows are silently skipped.
     *  - Columns that are empty for every row are dropped from the PDF
     *    (handled on the frontend downloadPDF function using only non-null columns).
     */
    @PostMapping("/upload/{tripId}")
    public ResponseEntity<String> bulkUploadItems(
            @PathVariable("tripId") Long tripId,
            @RequestParam("projectId") Long projectId,
            @RequestParam("towerId") Long towerId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            String message = itemService.bulkUpload(file, tripId, projectId, towerId);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            // Validation errors (missing Floor/Flat) → 400 so frontend can show them clearly
            return ResponseEntity.badRequest()
                    .body("Upload rejected: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Bulk upload failed: " + e.getMessage());
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Item> createSingleItem(
            @RequestParam Long tripId,
            @RequestParam Long projectId,
            @RequestParam Long towerId,
            @RequestBody Item item
    ) {
        Item savedItem = itemService.createSingleItem(item, tripId, projectId, towerId);
        return ResponseEntity.ok(savedItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(
            @PathVariable Long id,
            @RequestBody Item updatedItem
    ) {
        Item item = itemService.updateItem(id, updatedItem);
        return ResponseEntity.ok(item);
    }
}