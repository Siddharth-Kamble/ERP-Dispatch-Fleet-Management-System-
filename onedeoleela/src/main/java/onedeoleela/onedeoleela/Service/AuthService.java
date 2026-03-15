package onedeoleela.onedeoleela.Service;


import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Repository.UserRepository;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User login(Long eCode, String password) {
        System.out.println("Entered eCode: " + eCode);
        System.out.println("Entered password: " + password);
        User user = userRepository.findByeCode(eCode)
                .orElseThrow(() -> new RuntimeException("Invalid eCode"));

        System.out.println("DB Password: " + user.getPassword());

         user = userRepository.findByeCode(eCode)
                .orElseThrow(() -> new RuntimeException("Invalid eCode"));


        // Plain password comparison
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }

        return user; // role included
    }
}

