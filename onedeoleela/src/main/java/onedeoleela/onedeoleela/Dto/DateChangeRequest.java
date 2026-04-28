package onedeoleela.onedeoleela.Dto;

import lombok.Data;

@Data
public class DateChangeRequest {
    private String field;       // "startDate" or "endDate"
    private String oldValue;    // ISO date string e.g. "2025-06-01"
    private String newValue;    // ISO date string e.g. "2025-06-10"
    private String reason;      // mandatory — user must type this
    private boolean cascade;    // true if |diff| >= 2 days (sent from frontend)
}