package onedeoleela.onedeoleela.Planning.Service;


import onedeoleela.onedeoleela.Entity.*;
import onedeoleela.onedeoleela.Planning.Entity.TemplateLineItem;
import onedeoleela.onedeoleela.Planning.Entity.WorkTemplate;
import onedeoleela.onedeoleela.Planning.Repository.TemplateLineItemRepository;
import onedeoleela.onedeoleela.Planning.Repository.WorkTemplateRepository;
import onedeoleela.onedeoleela.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class WorkTemplateService {

    @Autowired private WorkTemplateRepository templateRepository;
    @Autowired private TemplateLineItemRepository templateItemRepository;
    @Autowired private PlanningLineItemRepository lineItemRepository;
    @Autowired private PlanningWorkRepository    workRepository;
    @Autowired private ProjectRepository         projectRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<WorkTemplate> getAllTemplates() {
        return templateRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<WorkTemplate> searchTemplates(String name) {
        return templateRepository
                .findByTemplateNameContainingIgnoreCaseOrderByCreatedAtDesc(name);
    }

    @Transactional(readOnly = true)
    public WorkTemplate getTemplateById(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<TemplateLineItem> getTemplateItems(Long templateId) {
        return templateItemRepository.findByTemplateIdOrderBySrNoAsc(templateId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SAVE AS TEMPLATE  (user-initiated — explicit action)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Copies the given work's line items into a new WorkTemplate.
     *
     * @param workId              the source PlanningWork
     * @param templateName        user-chosen name for the template
     * @param templateDescription optional description
     * @param createdBy           the user who clicked "Save as Template"
     * @return the saved WorkTemplate
     */
    public WorkTemplate saveAsTemplate(Long workId,
                                       String templateName,
                                       String templateDescription,
                                       String createdBy) {

        if (templateName == null || templateName.isBlank())
            throw new RuntimeException("Template name is required");

        PlanningWork work = workRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Work not found: " + workId));

        List<PlanningLineItem> sourceItems =
                lineItemRepository.findByWorkIdOrderBySrNoAsc(workId);

        if (sourceItems.isEmpty())
            throw new RuntimeException(
                    "Cannot save a template from a work with no line items");

        // ── Step 1: Create the template shell ─────────────────────────────────
        WorkTemplate template = new WorkTemplate();
        template.setTemplateName(templateName.trim());
        template.setTemplateDescription(
                templateDescription != null ? templateDescription.trim() : null);
        template.setDefaultWorkName(work.getWorkName());
        template.setCreatedBy(createdBy != null ? createdBy : "System");
        template.setItemCount(sourceItems.size());
        templateRepository.save(template);   // persist to get template.id

        // ── Step 2: Copy line items; track PlanningLineItem.id → TemplateLineItem ─
        // We need the mapping to re-wire linkedItemIds.
        Map<Long, TemplateLineItem> planningIdToTemplateItem = new LinkedHashMap<>();

        for (PlanningLineItem src : sourceItems) {
            TemplateLineItem tItem = new TemplateLineItem();
            tItem.setTemplate(template);
            tItem.setSrNo(src.getSrNo());
            tItem.setLineItemName(src.getLineItemName());
            tItem.setDepartment(src.getDepartment());
            tItem.setActionPerson(src.getActionPerson());
            tItem.setDefaultStatus("NOT STARTED");   // always reset status in template
            tItem.setRemark(src.getRemark());
            // linkedItemIds re-mapped in step 3 — set null for now
            tItem.setLinkedItemIds(null);
            templateItemRepository.save(tItem);
            planningIdToTemplateItem.put(src.getId(), tItem);
        }

        // ── Step 3: Re-map linkedItemIds ──────────────────────────────────────
        // Original linkedItemIds format: "planningItemId:trigger:offsetDays,..."
        // We replace planningItemId with the corresponding templateItemId.
        for (PlanningLineItem src : sourceItems) {
            if (src.getLinkedItemIds() == null || src.getLinkedItemIds().isBlank()) continue;

            TemplateLineItem tItem = planningIdToTemplateItem.get(src.getId());
            if (tItem == null) continue;

            String remapped = remapLinkedIds(
                    src.getLinkedItemIds(), planningIdToTemplateItem);
            tItem.setLinkedItemIds(remapped.isBlank() ? null : remapped);
            templateItemRepository.save(tItem);
        }

        return template;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // APPLY TEMPLATE  (create new work from template)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates a new PlanningWork from a template.
     * All line items are copied (without dates).
     * LinkedItemIds are re-mapped to the new PlanningLineItem IDs.
     *
     * Expected body keys:
     *   templateId    (Long)
     *   projectId     (Long)
     *   workName      (String, optional — defaults to template.defaultWorkName)
     *   workOrderNo   (String, optional)
     *   description   (String, optional — e.g. "249 NOS 15417 SQFT")
     *
     * @return the newly created PlanningWork (lineItems NOT loaded in response)
     */
    public PlanningWork applyTemplate(Map<String, Object> body) {

        Long templateId = parseLong(body.get("templateId"));
        Long projectId  = parseLong(body.get("projectId"));

        WorkTemplate template = getTemplateById(templateId);
        List<TemplateLineItem> tItems =
                templateItemRepository.findByTemplateIdOrderBySrNoAsc(templateId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        // ── Step 1: Create the new work ───────────────────────────────────────
        PlanningWork newWork = new PlanningWork();
        newWork.setProject(project);
        newWork.setWorkName(
                body.get("workName") != null && !body.get("workName").toString().isBlank()
                        ? body.get("workName").toString()
                        : template.getDefaultWorkName());
        newWork.setWorkOrderNo(
                body.get("workOrderNo") != null ? body.get("workOrderNo").toString() : null);
        newWork.setDescription(
                body.get("description") != null ? body.get("description").toString() : null);
        // startDate / endDate intentionally NOT set — user fills via ± Days or edit
        workRepository.save(newWork);

        // ── Step 2: Create PlanningLineItems (no dates) ───────────────────────
        // Track templateItemId → new PlanningLineItem
        Map<Long, PlanningLineItem> templateIdToNewItem = new LinkedHashMap<>();

        for (TemplateLineItem tItem : tItems) {
            PlanningLineItem newItem = new PlanningLineItem();
            newItem.setWork(newWork);
            newItem.setSrNo(tItem.getSrNo());
            newItem.setLineItemName(tItem.getLineItemName());
            newItem.setDepartment(tItem.getDepartment());
            newItem.setActionPerson(tItem.getActionPerson());
            newItem.setStatus(tItem.getDefaultStatus() != null
                    ? tItem.getDefaultStatus() : "NOT STARTED");
            newItem.setRemark(tItem.getRemark());
            newItem.setLinkedItemIds(null);  // re-mapped in step 3
            lineItemRepository.save(newItem);
            templateIdToNewItem.put(tItem.getId(), newItem);
        }

        // ── Step 3: Re-map linkedItemIds ──────────────────────────────────────
        // templateItem.linkedItemIds stores templateItemId-based references.
        // Replace each templateItemId with the corresponding new PlanningLineItem ID.
        for (TemplateLineItem tItem : tItems) {
            if (tItem.getLinkedItemIds() == null || tItem.getLinkedItemIds().isBlank()) continue;

            PlanningLineItem newItem = templateIdToNewItem.get(tItem.getId());
            if (newItem == null) continue;

            String remapped = remapLinkedIdsReverse(
                    tItem.getLinkedItemIds(), templateIdToNewItem);
            newItem.setLinkedItemIds(remapped.isBlank() ? null : remapped);
            lineItemRepository.save(newItem);
        }

        return newWork;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    public void deleteTemplate(Long id) {
        if (!templateRepository.existsById(id))
            throw new RuntimeException("Template not found: " + id);
        templateRepository.deleteById(id);   // cascade removes TemplateLineItems
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS — linkedItemIds re-mapping
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * When SAVING a template:
     * Replace planningItemId in linkedItemIds with the templateItemId.
     *
     * Input:  "42:END_TO_START:0,55:START_TO_START:2"
     * Output: "101:END_TO_START:0,102:START_TO_START:2"
     *          (where 101/102 are TemplateLineItem IDs)
     */
    private String remapLinkedIds(String linkedItemIds,
                                  Map<Long, TemplateLineItem> planningIdToTemplateItem) {
        if (linkedItemIds == null || linkedItemIds.isBlank()) return "";
        List<String> parts = new ArrayList<>();
        for (String entry : linkedItemIds.split(",")) {
            String[] segments = entry.trim().split(":");
            if (segments.length == 0) continue;
            try {
                Long planningId = Long.valueOf(segments[0].trim());
                TemplateLineItem mapped = planningIdToTemplateItem.get(planningId);
                if (mapped == null) continue;  // skip if not in same work
                StringBuilder sb = new StringBuilder(String.valueOf(mapped.getId()));
                for (int i = 1; i < segments.length; i++) {
                    sb.append(":").append(segments[i]);
                }
                parts.add(sb.toString());
            } catch (NumberFormatException ignored) {}
        }
        return String.join(",", parts);
    }

    /**
     * When APPLYING a template:
     * Replace templateItemId in linkedItemIds with the new PlanningLineItem ID.
     *
     * Input:  "101:END_TO_START:0,102:START_TO_START:2"
     * Output: "201:END_TO_START:0,202:START_TO_START:2"
     *          (where 201/202 are new PlanningLineItem IDs)
     */
    private String remapLinkedIdsReverse(String linkedItemIds,
                                         Map<Long, PlanningLineItem> templateIdToNewItem) {
        if (linkedItemIds == null || linkedItemIds.isBlank()) return "";
        List<String> parts = new ArrayList<>();
        for (String entry : linkedItemIds.split(",")) {
            String[] segments = entry.trim().split(":");
            if (segments.length == 0) continue;
            try {
                Long templateItemId = Long.valueOf(segments[0].trim());
                PlanningLineItem mapped = templateIdToNewItem.get(templateItemId);
                if (mapped == null) continue;
                StringBuilder sb = new StringBuilder(String.valueOf(mapped.getId()));
                for (int i = 1; i < segments.length; i++) {
                    sb.append(":").append(segments[i]);
                }
                parts.add(sb.toString());
            } catch (NumberFormatException ignored) {}
        }
        return String.join(",", parts);
    }

    private Long parseLong(Object value) {
        if (value == null) throw new RuntimeException("Required field is missing");
        return Long.valueOf(value.toString());
    }
}