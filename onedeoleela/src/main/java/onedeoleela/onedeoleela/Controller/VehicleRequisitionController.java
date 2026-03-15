package onedeoleela.onedeoleela.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import onedeoleela.onedeoleela.Entity.VehicleRequisition;
import onedeoleela.onedeoleela.Entity.RequisitionStatus;
import onedeoleela.onedeoleela.Entity.Role;

import onedeoleela.onedeoleela.Service.VehicleRequisitionService;
import onedeoleela.onedeoleela.Service.SmartTripPlannerService;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle-requisition")
@CrossOrigin
public class VehicleRequisitionController {

    @Autowired
    private VehicleRequisitionService service;

    @Autowired
    private SmartTripPlannerService plannerService;


    // ================= CREATE =================
    @PostMapping
    public VehicleRequisition create(
            @RequestBody VehicleRequisition req,
            @RequestHeader(value = "department", required = false) String department) {

        if (department == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Department header missing"
            );
        }

        if (!canCreate(department)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access Denied"
            );
        }

        req.setDepartment(department);
        req.setStatus(RequisitionStatus.PENDING);

        return service.createRequisition(req);
    }


    // ================= GET ALL =================
    @GetMapping
    public List<VehicleRequisition> getAll() {
        return service.getAllRequisitions();
    }


    // ================= GET PENDING =================
    @GetMapping("/pending")
    public List<VehicleRequisition> getPending() {
        return service.getPendingRequisitions();
    }


    // ================= UPDATE STATUS =================
    @PutMapping("/{id}/status")
    public VehicleRequisition updateStatus(
            @PathVariable Long id,
            @RequestParam RequisitionStatus status) {

        return service.updateStatus(id, status);
    }


    // ================= AUTO ASSIGN REQUISITIONS =================
    @PostMapping("/auto-assign/{tripId}")
    public String autoAssign(@PathVariable Long tripId) {

        service.autoAssignRequisitionsToTrip(tripId);

        return "Requisitions assigned to trip successfully";
    }


    // ================= SMART ROUTE GROUPING =================
    @GetMapping("/smart-groups")
    public List<List<VehicleRequisition>> getSmartGroups() {

        return plannerService.generateSmartGroups();
    }


    // ================= ROLE CHECK =================
    private boolean canCreate(String department) {

        try {

            Role role = Role.valueOf(department.toUpperCase());

            return role == Role.PRODUCTION ||
                    role == Role.PURCHASE ||
                    role == Role.POWDER_COATING ||
                    role == Role.COORDINATOR ||
                    role == Role.SITE_SUPERVISOR ||
                    role == Role.ADMIN;

        } catch (Exception e) {
            return false;
        }
    }
}