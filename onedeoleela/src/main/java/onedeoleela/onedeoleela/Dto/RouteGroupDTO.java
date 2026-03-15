package onedeoleela.onedeoleela.Dto;

import onedeoleela.onedeoleela.Entity.VehicleRequisition;

import java.util.List;

public class RouteGroupDTO {

    private String route;
    private List<VehicleRequisition> requisitions;

    public RouteGroupDTO(String route, List<VehicleRequisition> requisitions) {
        this.route = route;
        this.requisitions = requisitions;
    }

    public String getRoute() {
        return route;
    }

    public List<VehicleRequisition> getRequisitions() {
        return requisitions;
    }
}