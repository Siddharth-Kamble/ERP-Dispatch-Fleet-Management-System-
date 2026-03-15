package onedeoleela.onedeoleela.Repository;

import onedeoleela.onedeoleela.Entity.Role;
import onedeoleela.onedeoleela.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByeCode(Long eCode);

    boolean existsByeCode(Long eCode);
    Optional<User> findByFullName(String fullName);
//    Optional<User> findByUsername(String username);
    List<User> findByRole(Role role);
}
