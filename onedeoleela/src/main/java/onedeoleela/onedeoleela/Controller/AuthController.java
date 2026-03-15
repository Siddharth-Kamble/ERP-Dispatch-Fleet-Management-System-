package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow React frontend
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        System.out.println(user.getECode());
        try {

            User loggedUser = authService.login(
                    user.getECode(),
                    user.getPassword()
            );
            System.out.println(user.getECode());

            return ResponseEntity.ok(loggedUser);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

}
