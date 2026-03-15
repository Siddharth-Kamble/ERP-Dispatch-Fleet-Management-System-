package onedeoleela.onedeoleela.Config;



import onedeoleela.onedeoleela.Entity.Role;
import onedeoleela.onedeoleela.Entity.User;
import onedeoleela.onedeoleela.Repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    User user = new User();
    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository) {
        return args -> {

            Long adminECode = 1001L;

            if (!userRepository.existsByeCode(adminECode)) {

                User admin = new User();
                admin.setECode(adminECode);
                admin.setFullName("System Admin");
                admin.setEmail("admin@company.com");
                admin.setPassword("admin@123");
                admin.setRole(Role.ADMIN);

                userRepository.save(admin);

                System.out.println("✅ ADMIN user created successfully");
            } else {
                System.out.println("ℹ️ ADMIN user already exists");

            }
        };
    }
}

