package onedeoleela.onedeoleela.Service;


import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Entity.VehicleFuelData;
import onedeoleela.onedeoleela.Repository.UserRepository;
import onedeoleela.onedeoleela.Repository.VehicleFuelDataRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VehicleFuelDataService {

    private final VehicleFuelDataRepository repo;
    private final UserRepository userRepository; // To get user name

    public VehicleFuelDataService(VehicleFuelDataRepository repo, UserRepository userRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
    }

    public VehicleFuelData updateFuel(VehicleFuelData vehicleFuelData) {

        // Create a new entry for every fuel record
        VehicleFuelData newEntry = new VehicleFuelData();

        // Get user name from eCode
        String updatedByName = "";
        if (vehicleFuelData.getUpdatedBy() != null) {
            updatedByName = userRepository.findByeCode(Long.valueOf(vehicleFuelData.getUpdatedBy()))
                    .map(User::getFullName)
                    .orElse(vehicleFuelData.getUpdatedBy());
        }

        // Set last expense amount if previous record exists
        List<VehicleFuelData> records = repo.findAllByVehicleNumberOrderByUpdatedDateAsc(vehicleFuelData.getVehicleNumber());
        if (!records.isEmpty()) {
            newEntry.setLastExpenseAmount(records.get(records.size() - 1).getFuelAmount());
        }

        // Set current fuel data
        newEntry.setVehicleNumber(vehicleFuelData.getVehicleNumber());
        newEntry.setKmReading(vehicleFuelData.getKmReading());
        newEntry.setDieselRate(vehicleFuelData.getDieselRate());
        newEntry.setFuelAmount(vehicleFuelData.getFuelAmount());
        newEntry.setUpdatedBy(updatedByName);
        newEntry.setUpdatedDate(LocalDate.now());

        // Save as a new entry
        return repo.save(newEntry);
    }
    public Double calculateAverageMileage(String vehicleNumber) {
        List<VehicleFuelData> records = repo.findAllByVehicleNumberOrderByUpdatedDateAsc(vehicleNumber);
        if (records.size() < 2) return null; // Not enough data

        double totalDistance = 0;
        double totalFuelLiters = 0;

        for (int i = 1; i < records.size(); i++) {
            VehicleFuelData prev = records.get(i - 1);
            VehicleFuelData curr = records.get(i);

            if (prev.getKmReading() != null &&
                    curr.getKmReading() != null &&
                    curr.getFuelAmount() != null &&
                    curr.getDieselRate() != null &&
                    curr.getDieselRate() > 0) {

                double distance = curr.getKmReading() - prev.getKmReading();
                double fuelLiters = curr.getFuelAmount() / curr.getDieselRate(); // convert amount to liters

                if (distance > 0 && fuelLiters > 0) {
                    totalDistance += distance;
                    totalFuelLiters += fuelLiters;
                }
            }
        }

        if (totalFuelLiters == 0) return null;

        return totalDistance / totalFuelLiters; // km per litre
    }

    public Map<String, Double> calculateMonthlyMileage(String vehicleNumber) {
        List<VehicleFuelData> records = repo.findAllByVehicleNumberOrderByUpdatedDateAsc(vehicleNumber);
        Map<YearMonth, List<VehicleFuelData>> monthGroups = new LinkedHashMap<>();

        // Group entries by YearMonth
        for (VehicleFuelData v : records) {
            if (v.getUpdatedDate() != null) {
                YearMonth ym = YearMonth.from(v.getUpdatedDate());
                monthGroups.computeIfAbsent(ym, k -> new ArrayList<>()).add(v);
            }
        }

        // Calculate month-wise mileage
        Map<String, Double> monthlyMileage = new LinkedHashMap<>();
        for (Map.Entry<YearMonth, List<VehicleFuelData>> entry : monthGroups.entrySet()) {
            List<VehicleFuelData> monthRecords = entry.getValue();
            if (monthRecords.size() < 2) continue;

            VehicleFuelData first = monthRecords.get(0);
            VehicleFuelData last = monthRecords.get(monthRecords.size() - 1);

            double distance = last.getKmReading() - first.getKmReading();
            double totalFuelLiters = 0;

            for (VehicleFuelData r : monthRecords) {
                if (r.getDieselRate() != null && r.getDieselRate() > 0 && r.getFuelAmount() != null) {
                    totalFuelLiters += r.getFuelAmount() / r.getDieselRate();
                }
            }

            if (distance > 0 && totalFuelLiters > 0) {
                monthlyMileage.put(entry.getKey().toString(), distance / totalFuelLiters);
            }
        }

        return monthlyMileage;
    }

    public List<String> getAllVehicleNumbers() {
        return repo.findAll()
                .stream()
                .map(VehicleFuelData::getVehicleNumber)
                .distinct()
                .collect(Collectors.toList());
    }


    public List<Map<String, Object>> getVehicleHistoryWithMileage(String vehicleNumber) {
        List<VehicleFuelData> records = repo.findAllByVehicleNumberOrderByUpdatedDateAsc(vehicleNumber);
        List<Map<String, Object>> history = new ArrayList<>();

        for (int i = 0; i < records.size(); i++) {
            VehicleFuelData curr = records.get(i);
            Map<String, Object> map = new HashMap<>();

            map.put("dieselRate", curr.getDieselRate());
            map.put("fuelAmount", curr.getFuelAmount());
            map.put("kmReading", curr.getKmReading());
            map.put("lastExpenseAmount", curr.getLastExpenseAmount());
            map.put("updatedBy", curr.getUpdatedBy());
            map.put("updatedDate", curr.getUpdatedDate());

            // Calculate mileage compared to previous entry
            if (i > 0) {
                VehicleFuelData prev = records.get(i - 1);
                double distance = curr.getKmReading() - prev.getKmReading();
                double fuelLiters = curr.getFuelAmount() / (curr.getDieselRate() != null ? curr.getDieselRate() : 1);
                if (distance > 0 && fuelLiters > 0) {
                    map.put("mileage", distance / fuelLiters);
                } else {
                    map.put("mileage", null);
                }
            } else {
                map.put("mileage", null); // first entry cannot calculate mileage
            }

            history.add(map);
        }

        return history;
    }
}