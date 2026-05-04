//package onedeoleela.onedeoleela.Service;
//
//import onedeoleela.onedeoleela.Entity.PlanningHistory;
//import onedeoleela.onedeoleela.Entity.PlanningLineItem;
//import onedeoleela.onedeoleela.Entity.PlanningWork;
//import onedeoleela.onedeoleela.Repository.PlanningHistoryRepository;
//import onedeoleela.onedeoleela.Repository.PlanningLineItemRepository;
//import onedeoleela.onedeoleela.Repository.PlanningWorkRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.temporal.ChronoUnit;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Service
//@Transactional
//public class PlanningLineItemService {
//
//    @Autowired
//    private PlanningLineItemRepository lineItemRepository;
//
//    @Autowired
//    private PlanningWorkRepository workRepository;
//
//    @Autowired
//    private PlanningHistoryRepository historyRepository;
//
//    // ── READ ─────────────────────────────────────────────────────────────────
//
//    @Transactional(readOnly = true)
//    public List<PlanningLineItem> getLineItemsByWork(Long workId) {
//        return lineItemRepository.findByWorkIdOrderBySrNoAsc(workId);
//    }
//
//    @Transactional(readOnly = true)
//    public PlanningLineItem getLineItemById(Long id) {
//        return lineItemRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Line item not found with id: " + id));
//    }
//
//    // ── CREATE ────────────────────────────────────────────────────────────────
//
//    public PlanningLineItem createLineItem(Map<String, Object> body) {
//        Long workId = Long.valueOf(body.get("workId").toString());
//        PlanningWork work = workRepository.findById(workId)
//                .orElseThrow(() -> new RuntimeException("Work not found with id: " + workId));
//
//        PlanningLineItem item = new PlanningLineItem();
//        item.setWork(work);
//        mapBodyToLineItem(body, item);
//        return lineItemRepository.save(item);
//    }
//
//    // ── UPDATE ────────────────────────────────────────────────────────────────
//
//    public PlanningLineItem updateLineItem(Long id, Map<String, Object> body) {
//        PlanningLineItem item = getLineItemById(id);
//        mapBodyToLineItem(body, item);
//        return lineItemRepository.save(item);
//    }
//
//    // ── DELETE ────────────────────────────────────────────────────────────────
//
//    public void deleteLineItem(Long id) {
//        if (!lineItemRepository.existsById(id)) {
//            throw new RuntimeException("Line item not found with id: " + id);
//        }
//        lineItemRepository.deleteById(id);
//    }
//
//    // ── DATE CHANGE WITH HISTORY + CASCADE ───────────────────────────────────
//
//    public Map<String, Object> changeDateWithHistory(Long id, Map<String, Object> body) {
//        PlanningLineItem item = getLineItemById(id);
//
//        String  field     = (String) body.get("field");
//        String  newValue  = (String) body.get("newValue");
//        String  oldValue  = (String) body.get("oldValue");
//        String  reason    = (String) body.get("reason");
//        String  changedBy = body.get("changedBy") != null
//                ? body.get("changedBy").toString() : "System";
//        boolean cascade   = Boolean.TRUE.equals(body.get("cascade"));
//
//        if (reason == null || reason.isBlank())
//            throw new RuntimeException("Reason is required for date change");
//        if (field == null || (!field.equals("startDate") && !field.equals("endDate")))
//            throw new RuntimeException("Field must be 'startDate' or 'endDate'");
//
//        LocalDate oldDate = LocalDate.parse(oldValue);
//        LocalDate newDate = LocalDate.parse(newValue);
//        long shiftDays    = ChronoUnit.DAYS.between(oldDate, newDate);
//        long absDiff      = Math.abs(shiftDays);
//
//        // Apply date change to the main item
//        if ("startDate".equals(field)) item.setStartDate(newDate);
//        else                            item.setEndDate(newDate);
//        lineItemRepository.save(item);
//
//        // ── Cascade ───────────────────────────────────────────────────────────
//        List<String> cascadedNames   = new ArrayList<>();
//        List<String> cascadedDetails = new ArrayList<>();  // ✅ NEW rich detail list
//
//        if (cascade && absDiff >= 2) {
//            Set<Long> toShift = new HashSet<>();
//
//            // a) Items explicitly listed in this item's linkedItemIds
//            if (item.getLinkedItemIds() != null && !item.getLinkedItemIds().isBlank()) {
//                for (String entry : item.getLinkedItemIds().split(",")) {
//                    try {
//                        String idPart = entry.trim().split(":")[0];
//                        toShift.add(Long.valueOf(idPart));
//                    } catch (NumberFormatException ignored) {}
//                }
//            }
//
//            // b) Bidirectional: siblings that reference this item
//            List<PlanningLineItem> siblings = lineItemRepository
//                    .findByWorkIdOrderBySrNoAsc(item.getWork().getId());
//
//            for (PlanningLineItem sibling : siblings) {
//                if (sibling.getId().equals(id)) continue;
//                if (sibling.getLinkedItemIds() == null) continue;
//                for (String entry : sibling.getLinkedItemIds().split(",")) {
//                    try {
//                        String idPart = entry.trim().split(":")[0];
//                        if (Long.valueOf(idPart).equals(id)) {
//                            toShift.add(sibling.getId());
//                            break;
//                        }
//                    } catch (NumberFormatException ignored) {}
//                }
//            }
//
//            // Apply shift + build rich detail string per linked item
//            for (Long linkedId : toShift) {
//                PlanningLineItem linked = lineItemRepository.findById(linkedId).orElse(null);
//                if (linked == null) continue;
//
//                // ✅ Capture OLD values BEFORE shifting
//                String oldLinkedStart = linked.getStartDate() != null
//                        ? linked.getStartDate().toString() : null;
//                String oldLinkedEnd   = linked.getEndDate() != null
//                        ? linked.getEndDate().toString()   : null;
//
//                // Shift startDate + record detail
//                if (linked.getStartDate() != null) {
//                    LocalDate newStart = linked.getStartDate().plusDays(shiftDays);
//                    linked.setStartDate(newStart);
//                    // ✅ Format: "ItemName|startDate|2025-06-01|2025-06-10"
//                    cascadedDetails.add(
//                            linked.getLineItemName() + "|startDate|" + oldLinkedStart + "|" + newStart
//                    );
//                }
//
//                // Shift endDate + record detail
//                if (linked.getEndDate() != null) {
//                    LocalDate newEnd = linked.getEndDate().plusDays(shiftDays);
//                    linked.setEndDate(newEnd);
//                    // ✅ Format: "ItemName|endDate|2025-06-15|2025-06-24"
//                    cascadedDetails.add(
//                            linked.getLineItemName() + "|endDate|" + oldLinkedEnd + "|" + newEnd
//                    );
//                }
//
//                lineItemRepository.save(linked);
//                cascadedNames.add(linked.getLineItemName());
//            }
//        }
//
//        // ── Record history ────────────────────────────────────────────────────
//        PlanningHistory history = new PlanningHistory();
//        history.setWork(item.getWork());
//        history.setLineItemId(item.getId());
//        history.setLineItemName(item.getLineItemName());
//        if (item.getWork() != null) {
//            history.setWorkName(item.getWork().getWorkName());
//            if (item.getWork().getProject() != null) {
//                history.setProjectName(item.getWork().getProject().getProjectName());
//                history.setProjectCode(item.getWork().getProject().getProjectCode());
//            }
//        }
//        history.setField(field);
//        history.setOldValue(oldValue);
//        history.setNewValue(newValue);
//        history.setReason(reason);
//        history.setChangedBy(changedBy);
//        history.setChangedAt(LocalDateTime.now());
//
//        // ✅ KEY FIX: "Name|field|old|new;Name|field|old|new" instead of "Name1, Name2"
//        if (!cascadedDetails.isEmpty()) {
//            history.setCascadedItemNames(String.join(";", cascadedDetails));
//        }
//
//        historyRepository.save(history);
//
//        Map<String, Object> response = new LinkedHashMap<>();
//        response.put("success", true);
//        response.put("shiftDays", shiftDays);
//        response.put("cascadedCount", cascadedNames.size());
//        response.put("cascadedItems", cascadedNames);
//        return response;
//    }
//
//    // ── HELPERS ───────────────────────────────────────────────────────────────
//
//    private void mapBodyToLineItem(Map<String, Object> body, PlanningLineItem item) {
//        if (body.containsKey("srNo") && body.get("srNo") != null)
//            item.setSrNo(Integer.valueOf(body.get("srNo").toString()));
//        if (body.containsKey("lineItemName"))
//            item.setLineItemName((String) body.get("lineItemName"));
//        if (body.containsKey("department"))
//            item.setDepartment((String) body.get("department"));
//        if (body.containsKey("actionPerson"))
//            item.setActionPerson((String) body.get("actionPerson"));
//        if (body.containsKey("status"))
//            item.setStatus((String) body.get("status"));
//        if (body.containsKey("remark"))
//            item.setRemark((String) body.get("remark"));
//        if (body.get("startDate") != null && !body.get("startDate").toString().isBlank())
//            item.setStartDate(LocalDate.parse(body.get("startDate").toString()));
//        if (body.get("endDate") != null && !body.get("endDate").toString().isBlank())
//            item.setEndDate(LocalDate.parse(body.get("endDate").toString()));
//
//        // linkedItemIds: accept both List and plain String from frontend
//        if (body.containsKey("linkedItemIds") && body.get("linkedItemIds") != null) {
//            Object raw = body.get("linkedItemIds");
//            String joined;
//            if (raw instanceof List) {
//                joined = ((List<?>) raw).stream()
//                        .map(Object::toString)
//                        .filter(s -> !s.isBlank())
//                        .collect(Collectors.joining(","));
//            } else {
//                joined = raw.toString().trim();
//            }
//            item.setLinkedItemIds(joined.isBlank() ? null : joined);
//        }
//    }
//}


package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.PlanningHistory;
import onedeoleela.onedeoleela.Entity.PlanningLineItem;
import onedeoleela.onedeoleela.Entity.PlanningWork;
import onedeoleela.onedeoleela.Repository.PlanningHistoryRepository;
import onedeoleela.onedeoleela.Repository.PlanningLineItemRepository;
import onedeoleela.onedeoleela.Repository.PlanningWorkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlanningLineItemService {

    @Autowired
    private PlanningLineItemRepository lineItemRepository;

    @Autowired
    private PlanningWorkRepository workRepository;

    @Autowired
    private PlanningHistoryRepository historyRepository;

    // ── READ ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PlanningLineItem> getLineItemsByWork(Long workId) {
        return lineItemRepository.findByWorkIdOrderBySrNoAsc(workId);
    }

    @Transactional(readOnly = true)
    public PlanningLineItem getLineItemById(Long id) {
        return lineItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Line item not found with id: " + id));
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    public PlanningLineItem createLineItem(Map<String, Object> body) {
        Long workId = Long.valueOf(body.get("workId").toString());
        PlanningWork work = workRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Work not found with id: " + workId));

        PlanningLineItem item = new PlanningLineItem();
        item.setWork(work);
        mapBodyToLineItem(body, item);
        return lineItemRepository.save(item);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    public PlanningLineItem updateLineItem(Long id, Map<String, Object> body) {
        PlanningLineItem item = getLineItemById(id);
        mapBodyToLineItem(body, item);
        return lineItemRepository.save(item);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    public void deleteLineItem(Long id) {
        if (!lineItemRepository.existsById(id)) {
            throw new RuntimeException("Line item not found with id: " + id);
        }
        lineItemRepository.deleteById(id);
    }

    // ── DATE CHANGE WITH HISTORY + CASCADE ───────────────────────────────────

    public Map<String, Object> changeDateWithHistory(Long id, Map<String, Object> body) {
        PlanningLineItem item = getLineItemById(id);

        String  field     = (String) body.get("field");
        String  newValue  = (String) body.get("newValue");
        String  oldValue  = (String) body.get("oldValue");
        String  reason    = (String) body.get("reason");
        String  changedBy = body.get("changedBy") != null
                ? body.get("changedBy").toString() : "System";
        boolean cascade   = Boolean.TRUE.equals(body.get("cascade"));

        if (reason == null || reason.isBlank())
            throw new RuntimeException("Reason is required for date change");
        if (field == null || (!field.equals("startDate") && !field.equals("endDate")))
            throw new RuntimeException("Field must be 'startDate' or 'endDate'");

        LocalDate oldDate  = LocalDate.parse(oldValue);
        LocalDate newDate  = LocalDate.parse(newValue);
        long shiftDays     = ChronoUnit.DAYS.between(oldDate, newDate);
        long absDiff       = Math.abs(shiftDays);

        // Apply date change to the main item
        if ("startDate".equals(field)) item.setStartDate(newDate);
        else                            item.setEndDate(newDate);
        lineItemRepository.save(item);

        // ── Cascade ───────────────────────────────────────────────────────────
        List<String> cascadedNames = new ArrayList<>();

        // Holds per-cascaded-item history data: each entry = one history row to save
        // Structure: { linkedItem, fieldName, oldVal, newVal }
        record CascadeEntry(PlanningLineItem linkedItem, String fieldName,
                            String oldVal, String newVal) {}
        List<CascadeEntry> cascadeEntries = new ArrayList<>();

        if (cascade && absDiff >= 2) {
            Set<Long> toShift = new HashSet<>();

            // a) Items explicitly listed in this item's linkedItemIds
            if (item.getLinkedItemIds() != null && !item.getLinkedItemIds().isBlank()) {
                for (String entry : item.getLinkedItemIds().split(",")) {
                    try {
                        String idPart = entry.trim().split(":")[0];
                        toShift.add(Long.valueOf(idPart));
                    } catch (NumberFormatException ignored) {}
                }
            }

            // b) Bidirectional: siblings that reference this item
            List<PlanningLineItem> siblings = lineItemRepository
                    .findByWorkIdOrderBySrNoAsc(item.getWork().getId());

            for (PlanningLineItem sibling : siblings) {
                if (sibling.getId().equals(id)) continue;
                if (sibling.getLinkedItemIds() == null) continue;
                for (String entry : sibling.getLinkedItemIds().split(",")) {
                    try {
                        String idPart = entry.trim().split(":")[0];
                        if (Long.valueOf(idPart).equals(id)) {
                            toShift.add(sibling.getId());
                            break;
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }

            // Apply shift + capture old/new per field per linked item
            for (Long linkedId : toShift) {
                PlanningLineItem linked = lineItemRepository.findById(linkedId).orElse(null);
                if (linked == null) continue;

                // Capture OLD values BEFORE shifting
                String oldLinkedStart = linked.getStartDate() != null
                        ? linked.getStartDate().toString() : null;
                String oldLinkedEnd   = linked.getEndDate() != null
                        ? linked.getEndDate().toString()   : null;

                // Shift startDate
                if (linked.getStartDate() != null) {
                    LocalDate newStart = linked.getStartDate().plusDays(shiftDays);
                    linked.setStartDate(newStart);
                    // ✅ One entry = one history row for startDate of this cascaded item
                    cascadeEntries.add(new CascadeEntry(
                            linked, "startDate", oldLinkedStart, newStart.toString()
                    ));
                }

                // Shift endDate
                if (linked.getEndDate() != null) {
                    LocalDate newEnd = linked.getEndDate().plusDays(shiftDays);
                    linked.setEndDate(newEnd);
                    // ✅ One entry = one history row for endDate of this cascaded item
                    cascadeEntries.add(new CascadeEntry(
                            linked, "endDate", oldLinkedEnd, newEnd.toString()
                    ));
                }

                lineItemRepository.save(linked);
                cascadedNames.add(linked.getLineItemName());
            }
        }

        LocalDateTime now = LocalDateTime.now();

        // ── Source item history row ───────────────────────────────────────────
        // cascadedItemNames on source row = comma list of affected item names (unchanged behaviour)
        PlanningHistory sourceHistory = new PlanningHistory();
        sourceHistory.setWork(item.getWork());
        sourceHistory.setLineItemId(item.getId());
        sourceHistory.setLineItemName(item.getLineItemName());
        if (item.getWork() != null) {
            sourceHistory.setWorkName(item.getWork().getWorkName());
            if (item.getWork().getProject() != null) {
                sourceHistory.setProjectName(item.getWork().getProject().getProjectName());
                sourceHistory.setProjectCode(item.getWork().getProject().getProjectCode());
            }
        }
        sourceHistory.setField(field);
        sourceHistory.setOldValue(oldValue);
        sourceHistory.setNewValue(newValue);
        sourceHistory.setReason(reason);
        sourceHistory.setChangedBy(changedBy);
        sourceHistory.setChangedAt(now);
        if (!cascadedNames.isEmpty()) {
            sourceHistory.setCascadedItemNames(String.join(", ", cascadedNames));
        }
        historyRepository.save(sourceHistory);

        // ── Individual history row for EACH cascaded item's each field ────────
        // reason clearly says which source item triggered this change
        String cascadeReason = "Cascaded from: " + item.getLineItemName();

        for (var entry : cascadeEntries) {
            PlanningLineItem linked = entry.linkedItem();

            PlanningHistory cascadeHistory = new PlanningHistory();
            cascadeHistory.setWork(linked.getWork());
            cascadeHistory.setLineItemId(linked.getId());
            cascadeHistory.setLineItemName(linked.getLineItemName());
            if (linked.getWork() != null) {
                cascadeHistory.setWorkName(linked.getWork().getWorkName());
                if (linked.getWork().getProject() != null) {
                    cascadeHistory.setProjectName(linked.getWork().getProject().getProjectName());
                    cascadeHistory.setProjectCode(linked.getWork().getProject().getProjectCode());
                }
            }
            cascadeHistory.setField(entry.fieldName());       // "startDate" or "endDate"
            cascadeHistory.setOldValue(entry.oldVal());       // linked item's own old date
            cascadeHistory.setNewValue(entry.newVal());       // linked item's own new date
            cascadeHistory.setReason(cascadeReason);          // "Cascaded from: SITE SURVEY"
            cascadeHistory.setChangedBy(changedBy);
            cascadeHistory.setChangedAt(now);
            // cascadedItemNames is null here — this IS the cascaded item, not the source
            historyRepository.save(cascadeHistory);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("shiftDays", shiftDays);
        response.put("cascadedCount", cascadedNames.size());
        response.put("cascadedItems", cascadedNames);
        return response;
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private void mapBodyToLineItem(Map<String, Object> body, PlanningLineItem item) {
        if (body.containsKey("srNo") && body.get("srNo") != null)
            item.setSrNo(Integer.valueOf(body.get("srNo").toString()));
        if (body.containsKey("lineItemName"))
            item.setLineItemName((String) body.get("lineItemName"));
        if (body.containsKey("department"))
            item.setDepartment((String) body.get("department"));
        if (body.containsKey("actionPerson"))
            item.setActionPerson((String) body.get("actionPerson"));
        if (body.containsKey("status"))
            item.setStatus((String) body.get("status"));
        if (body.containsKey("remark"))
            item.setRemark((String) body.get("remark"));
        if (body.get("startDate") != null && !body.get("startDate").toString().isBlank())
            item.setStartDate(LocalDate.parse(body.get("startDate").toString()));
        if (body.get("endDate") != null && !body.get("endDate").toString().isBlank())
            item.setEndDate(LocalDate.parse(body.get("endDate").toString()));

        // linkedItemIds: accept both List and plain String from frontend
        if (body.containsKey("linkedItemIds") && body.get("linkedItemIds") != null) {
            Object raw = body.get("linkedItemIds");
            String joined;
            if (raw instanceof List) {
                joined = ((List<?>) raw).stream()
                        .map(Object::toString)
                        .filter(s -> !s.isBlank())
                        .collect(Collectors.joining(","));
            } else {
                joined = raw.toString().trim();
            }
            item.setLinkedItemIds(joined.isBlank() ? null : joined);
        }
    }
}