package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Dto.RouteGroupDTO;
import onedeoleela.onedeoleela.Service.VehicleRequisitionGroupingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requisition-groups")
public class VehicleRequisitionGroupController {

    private final VehicleRequisitionGroupingService service;

    public VehicleRequisitionGroupController(
            VehicleRequisitionGroupingService service) {
        this.service = service;
    }

    @GetMapping
    public List<RouteGroupDTO> getGroupedRequisitions() {
        return service.groupRequisitions();
    }
}