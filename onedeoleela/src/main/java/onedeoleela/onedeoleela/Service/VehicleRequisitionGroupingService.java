package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Dto.RouteGroupDTO;
import onedeoleela.onedeoleela.Entity.VehicleRequisition;
import onedeoleela.onedeoleela.Entity.RequisitionStatus;
import onedeoleela.onedeoleela.Repository.VehicleRequisitionRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class VehicleRequisitionGroupingService {

    private final VehicleRequisitionRepository repository;

    public VehicleRequisitionGroupingService(
            VehicleRequisitionRepository repository) {
        this.repository = repository;
    }

    public List<RouteGroupDTO> groupRequisitions() {

        List<VehicleRequisition> requisitions =
                repository.findByStatus(RequisitionStatus.PENDING);

        Map<String, List<VehicleRequisition>> grouped =
                requisitions.stream()
                        .collect(Collectors.groupingBy(
                                r -> r.getLocationFrom().toUpperCase()
                        ));

        List<RouteGroupDTO> response = new ArrayList<>();

        for (Map.Entry<String, List<VehicleRequisition>> entry : grouped.entrySet()) {

            String startCity = entry.getKey();
            List<VehicleRequisition> reqList = entry.getValue();

            String routeName =
                    startCity + " → Multiple Destinations (" +
                            reqList.size() + " Requests)";

            response.add(new RouteGroupDTO(routeName, reqList));
        }

        return response;
    }
}