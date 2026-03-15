package onedeoleela.onedeoleela.Controller;

import lombok.RequiredArgsConstructor;
import onedeoleela.onedeoleela.Entity.Driver;
import onedeoleela.onedeoleela.Service.DriverService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
@CrossOrigin("*")

public class DriverController {

    private final DriverService service;

    @GetMapping()
    public List<Driver> getAll(@RequestParam Integer eCode) {
        return service.getAllDrivers();
    }

    @PostMapping
    public Driver create(@RequestBody Driver d) {
        return service.create(d);
    }

    @PutMapping("/{id}")
    public Driver update(@PathVariable Long id,
                         @RequestBody Driver d) {
        return service.update(id, d);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
