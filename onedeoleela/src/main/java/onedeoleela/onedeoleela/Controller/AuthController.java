//////package onedeoleela.onedeoleela.Controller;
//////
//////import onedeoleela.onedeoleela.Entity.User;
//////import onedeoleela.onedeoleela.Service.AuthService;
//////import org.springframework.http.HttpStatus;
//////import org.springframework.http.ResponseEntity;
//////import org.springframework.web.bind.annotation.*;
//////
//////@RestController
//////@RequestMapping("/api/auth")
//////@CrossOrigin(origins = "*") // Allow React frontend
//////public class AuthController {
//////
//////    private final AuthService authService;
//////
//////    public AuthController(AuthService authService) {
//////        this.authService = authService;
//////    }
//////
//////    @PostMapping("/login")
//////    public ResponseEntity<?> login(@RequestBody User user) {
//////
//////        System.out.println(user.getECode());
//////        try {
//////
//////            User loggedUser = authService.login(
//////                    user.getECode(),
//////                    user.getPassword()
//////            );
//////            System.out.println(user.getECode());
//////
//////            return ResponseEntity.ok(loggedUser);
//////
//////        } catch (RuntimeException e) {
//////
//////            return ResponseEntity
//////                    .status(HttpStatus.UNAUTHORIZED)
//////                    .body(e.getMessage());
//////        }
//////    }
//////
//////}
////
////
////package onedeoleela.onedeoleela.Controller;
////
////import onedeoleela.onedeoleela.Entity.User;
////import onedeoleela.onedeoleela.Service.AuthService;
////import org.springframework.http.HttpStatus;
////import org.springframework.http.ResponseEntity;
////import org.springframework.web.bind.annotation.*;
////
////import java.nio.file.Files;
////import java.nio.file.Path;
////
////@RestController
////@RequestMapping("/api/auth")
////@CrossOrigin(origins = "*")
////public class AuthController {
////
////    private final AuthService authService;
////
////    public AuthController(AuthService authService) {
////        this.authService = authService;
////    }
////
////    // ── LOGIN ─────────────────────────────────────────────────────────────────
////    @PostMapping("/login")
////    public ResponseEntity<?> login(@RequestBody User user) {
////
////        System.out.println(user.getECode());
////
////        try {
////            User loggedUser = authService.login(
////                    user.getECode(),
////                    user.getPassword()
////            );
////
////            // ✅ If BOSS — write session file so Electron widget appears
////            // Check what your Role looks like — adjust the string to match your enum
////            String role = loggedUser.getRole() != null
////                    ? loggedUser.getRole().toString()
////                    : "";
////
////            if ("BOSS".equals(role)) {
////                // ✅ BOSS login — write session file → Electron widget appears
////                try {
////                    Files.writeString(
////                            Path.of(System.getProperty("user.home") + "/boss_session.txt"),
////                            "BOSS_LOGGED_IN:" + System.currentTimeMillis()
////                    );
////                    System.out.println("✅ boss_session.txt written — widget will appear");
////                } catch (Exception ex) {
////                    System.out.println("⚠️ Could not write boss_session.txt: " + ex.getMessage());
////                }
////            } else {
////                // ✅ ANY other role (PA, ADMIN, VP, DRIVER etc) — DELETE session file
////                // This ensures if BOSS was logged in before, widget disappears
////                try {
////                    boolean deleted = Files.deleteIfExists(
////                            Path.of(System.getProperty("user.home") + "/boss_session.txt")
////                    );
////                    if (deleted) System.out.println("🔒 Non-BOSS login — boss_session.txt deleted");
////                } catch (Exception ex) { /* ignore */ }
////            }
////
////            return ResponseEntity.ok(loggedUser);
////
////        } catch (RuntimeException e) {
////            return ResponseEntity
////                    .status(HttpStatus.UNAUTHORIZED)
////                    .body(e.getMessage());
////        }
////    }
////
////    // ── LOGOUT ────────────────────────────────────────────────────────────────
////    @PostMapping("/logout")
////    public ResponseEntity<?> logout(@RequestBody User user) {
////
////        String role = user.getRole() != null
////                ? user.getRole().toString()
////                : "";
////
////        // ✅ If BOSS — delete session file so Electron widget disappears
////        if ("BOSS".equals(role)) {
////            try {
////                Files.deleteIfExists(
////                        Path.of(System.getProperty("user.home") + "/boss_session.txt")
////                );
////                System.out.println("✅ boss_session.txt deleted");
////            } catch (Exception ex) {
////                System.out.println("⚠️ Could not delete boss_session.txt: " + ex.getMessage());
////            }
////        }
////
////        return ResponseEntity.ok().build();
////    }
////}
//
//
//package onedeoleela.onedeoleela.Controller;
//
//import onedeoleela.onedeoleela.Entity.User;
//import onedeoleela.onedeoleela.Service.AuthService;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.nio.file.Files;
//import java.nio.file.Path;
//
//@RestController
//@RequestMapping("/api/auth")
//@CrossOrigin(origins = "*")
//public class AuthController {
//
//    private final AuthService authService;
//
//    public AuthController(AuthService authService) {
//        this.authService = authService;
//    }
//
//    @PostMapping("/login")
//    public ResponseEntity<?> login(@RequestBody User user) {
//
//        System.out.println("Entered eCode: " + user.getECode());
//
//        try {
//            User loggedUser = authService.login(
//                    user.getECode(),
//                    user.getPassword()
//            );
//
//            String role = loggedUser.getRole() != null
//                    ? loggedUser.getRole().toString()
//                    : "";
//
//            System.out.println("Role: " + role);
//
//            if ("BOSS".equals(role)) {
//                // ✅ Write full user data to session file
//                String sessionData = "role=" + role
//                        + "&id="       + loggedUser.getId()
//                        + "&name="     + (loggedUser.getFullName() != null ? loggedUser.getFullName() : "Boss")
//                        + "&time="     + System.currentTimeMillis();
//
//                try {
//                    Files.writeString(
//                            Path.of(System.getProperty("user.home") + "/boss_session.txt"),
//                            sessionData
//                    );
//                    System.out.println("✅ boss_session.txt written: " + sessionData);
//                } catch (Exception ex) {
//                    System.out.println("⚠️ Could not write: " + ex.getMessage());
//                }
//
//            } else {
//                // ✅ Any other role — delete file so widget hides
//                try {
//                    boolean deleted = Files.deleteIfExists(
//                            Path.of(System.getProperty("user.home") + "/boss_session.txt")
//                    );
//                    if (deleted) System.out.println("🔒 Non-BOSS login — session file deleted");
//                } catch (Exception ex) { /* ignore */ }
//            }
//
//            return ResponseEntity.ok(loggedUser);
//
//        } catch (RuntimeException e) {
//            return ResponseEntity
//                    .status(HttpStatus.UNAUTHORIZED)
//                    .body(e.getMessage());
//        }
//    }
//
//    @PostMapping("/logout")
//    public ResponseEntity<?> logout(@RequestBody User user) {
//
//        String role = user.getRole() != null
//                ? user.getRole().toString()
//                : "";
//
//        if ("BOSS".equals(role)) {
//            try {
//                Files.deleteIfExists(
//                        Path.of(System.getProperty("user.home") + "/boss_session.txt")
//                );
//                System.out.println("✅ boss_session.txt deleted on logout");
//            } catch (Exception ex) { /* ignore */ }
//        }
//
//        return ResponseEntity.ok().build();
//    }
//}

package onedeoleela.onedeoleela.Controller;

import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    private static final String SESSION_FILE =
            System.getProperty("user.home") + "/boss_session.txt";

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        System.out.println("=== LOGIN ATTEMPT ===");
        System.out.println("eCode: " + user.getECode());

        try {
            User loggedUser = authService.login(
                    user.getECode(),
                    user.getPassword()
            );

            // ✅ Print all fields to confirm values
            System.out.println("=== LOGIN SUCCESS ===");
            System.out.println("ID:       " + loggedUser.getId());
            System.out.println("FullName: " + loggedUser.getFullName());
            System.out.println("Role:     " + loggedUser.getRole());

            String role = loggedUser.getRole() != null
                    ? loggedUser.getRole().toString().trim().toUpperCase()
                    : "";

            System.out.println("Role string:  '" + role + "'");
            System.out.println("Is BOSS:      " + "BOSS".equals(role));
            System.out.println("Session file: " + SESSION_FILE);

            if ("BOSS".equals(role)) {

                String name = loggedUser.getFullName() != null
                        ? loggedUser.getFullName().trim()
                        : "Boss";

                String sessionData = "role=BOSS"
                        + "&id="   + loggedUser.getId()
                        + "&name=" + name
                        + "&time=" + System.currentTimeMillis();

                try {
                    Path filePath = Path.of(SESSION_FILE);

                    // ✅ Make sure parent directory exists
                    if (!Files.exists(filePath.getParent())) {
                        Files.createDirectories(filePath.getParent());
                    }

                    Files.writeString(filePath, sessionData);

                    System.out.println("✅ boss_session.txt WRITTEN");
                    System.out.println("✅ Path: " + filePath.toAbsolutePath());
                    System.out.println("✅ Content: " + sessionData);

                } catch (Exception ex) {
                    System.out.println("❌ FAILED to write boss_session.txt");
                    System.out.println("❌ Error: " + ex.getClass().getName());
                    System.out.println("❌ Message: " + ex.getMessage());
                    ex.printStackTrace();
                }

            } else {
                // ✅ Not BOSS — delete session file
                try {
                    boolean deleted = Files.deleteIfExists(Path.of(SESSION_FILE));
                    System.out.println("🔒 Non-BOSS (" + role + ") — file deleted: " + deleted);
                } catch (Exception ex) {
                    System.out.println("⚠️ Could not delete: " + ex.getMessage());
                }
            }

            return ResponseEntity.ok(loggedUser);

        } catch (RuntimeException e) {
            System.out.println("❌ LOGIN FAILED: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody User user) {

        System.out.println("=== LOGOUT ===");

        String role = user.getRole() != null
                ? user.getRole().toString().trim().toUpperCase()
                : "";

        System.out.println("Logout role: '" + role + "'");

        if ("BOSS".equals(role)) {
            try {
                boolean deleted = Files.deleteIfExists(Path.of(SESSION_FILE));
                System.out.println("✅ boss_session.txt DELETED: " + deleted);
                System.out.println("✅ Widget will hide now");
            } catch (Exception ex) {
                System.out.println("⚠️ Could not delete: " + ex.getMessage());
            }
        }

        return ResponseEntity.ok().build();
    }
}