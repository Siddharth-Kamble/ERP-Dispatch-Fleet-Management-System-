//package onedeoleela.onedeoleela.Config;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//import org.springframework.web.filter.CorsFilter;
//
//import java.util.Arrays;
//
//@Configuration
//public class CorsConfig {
//
//    @Value("${frontend.url}")
//    private String frontendUrl;
//
//    @Bean
//    public CorsFilter corsFilter() {
//
//        CorsConfiguration config = new CorsConfiguration();
//        config.setAllowCredentials(true);
//
//        // ✅ Allow both localhost and production
//        config.setAllowedOrigins(Arrays.asList(
//                "http://localhost:*",
//                frontendUrl
//        ));
//
//        config.setAllowedMethods(Arrays.asList(
//                "GET","POST","PUT","DELETE","PATCH","OPTIONS"
//        ));
//
//        config.setAllowedHeaders(Arrays.asList("*"));
//
//        UrlBasedCorsConfigurationSource source =
//                new UrlBasedCorsConfigurationSource();
//
//        source.registerCorsConfiguration("/**", config);
//
//        return new CorsFilter(source);
//    }
//}

package onedeoleela.onedeoleela.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public CorsFilter corsFilter() {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        // ✅ FIX: use allowedOriginPatterns instead of allowedOrigins
        config.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "http://127.0.0.1:*",
                frontendUrl
        ));

        config.setAllowedMethods(Arrays.asList(
                "GET","POST","PUT","DELETE","PATCH","OPTIONS"
        ));

        config.setAllowedHeaders(Arrays.asList("*"));

        // ✅ (Optional but recommended)
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}