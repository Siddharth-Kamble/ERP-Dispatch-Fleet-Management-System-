////// SecurityConfig.java
////package onedeoleela.onedeoleela.Config;
////
////import org.springframework.context.annotation.Bean;
////import org.springframework.context.annotation.Configuration;
////import org.springframework.security.config.annotation.web.builders.HttpSecurity;
////import org.springframework.security.web.SecurityFilterChain;
////
////@Configuration
////public class SecurityConfig {
////
////    @Bean
////    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
////
////        http
////                .csrf(csrf -> csrf.disable())   // ✅ FIXES 403
////                .authorizeHttpRequests(auth -> auth
////                        .requestMatchers("/api/**").permitAll()  // allow your APIs
////                        .anyRequest().authenticated()
////                );
////
////        return http.build();
////    }
////}
//
//package onedeoleela.onedeoleela.Config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.web.SecurityFilterChain;
//
//@Configuration
//public class SecurityConfig {
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//
//        http
//                .csrf(csrf -> csrf.disable())   // keep as it is
//
//                // ✅ ADD THIS (does NOT affect existing logic, only enables CORS)
//                .cors(cors -> {})
//
//                .authorizeHttpRequests(auth -> auth
//
//                        // ✅ keep your existing rule
//                        .requestMatchers("/api/**").permitAll()
//
//                        // ✅ ADD THIS (fixes browser preflight issues)
//                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//
//                        // ✅ keep your existing behavior
//                        .anyRequest().authenticated()
//                );
//
//        return http.build();
//    }
//}

//package onedeoleela.onedeoleela.Config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.web.SecurityFilterChain;
//
//@Configuration
//public class SecurityConfig {
//
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//
//        http
//                .csrf(csrf -> csrf.disable())
//
//                // ✅ IMPORTANT: enable CORS inside security
//                .cors(cors -> {})
//
//                .authorizeHttpRequests(auth -> auth
//
//                        // ✅ allow preflight requests
//                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//
//                        // ✅ allow auth APIs
//                        .requestMatchers("/api/auth/**").permitAll()
//
//                        // ✅ allow ALL APIs
//                        .requestMatchers("/api/**").permitAll()
//
//                        // other requests
//                        .anyRequest().authenticated()
//                );
//
//        return http.build();
//    }
//}

package onedeoleela.onedeoleela.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // ✅ Disable CSRF (for API usage)
                .csrf(csrf -> csrf.disable())

                // ✅ IMPORTANT: Enable CORS (this connects with your CorsConfig)
                .cors(cors -> {})

                // ✅ Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // ✅ Allow ALL preflight requests (VERY IMPORTANT for CORS)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ Allow auth APIs
                        .requestMatchers("/api/auth/**").permitAll()

                        // ✅ Allow ALL API endpoints
                        .requestMatchers("/api/**").permitAll()

                        // ✅ FIX: Allow non-api endpoints like /projects
                        .requestMatchers("/projects/**").permitAll()

                        // ✅ (Optional safety) allow everything else
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}