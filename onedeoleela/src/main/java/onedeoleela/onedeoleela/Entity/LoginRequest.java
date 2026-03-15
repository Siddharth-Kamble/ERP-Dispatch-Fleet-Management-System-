package onedeoleela.onedeoleela.Entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private Long eCode;
    private String password;
}