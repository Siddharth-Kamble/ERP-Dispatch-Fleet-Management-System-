package onedeoleela.onedeoleela.Service;

import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {

        if (userRepository.existsByeCode(user.getECode())) {
            throw new RuntimeException("E-Code already exists");
        }

        return userRepository.save(user);
    }
    public Optional<String> getFullNameByECode(Long eCode) {
        return userRepository.findByeCode(eCode)
                .map(User::getFullName);
    }
}
