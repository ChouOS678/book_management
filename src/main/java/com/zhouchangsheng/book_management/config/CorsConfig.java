package com.zhouchangsheng.book_management.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); // 允许发送 Cookie
        config.addAllowedOrigin("http://localhost:5173"); // 允许您的前端域名访问，或者使用 "*" 允许所有（不推荐在生产环境）
        // config.addAllowedOriginPattern("*"); // Spring Boot 2.4+ 推荐使用此方法来代替 addAllowedOrigin("*")
        config.addAllowedHeader("*"); // 允许所有请求头
        config.addAllowedMethod("*"); // 允许所有 HTTP 方法 (GET, POST, PUT, DELETE, OPTIONS 等)
        source.registerCorsConfiguration("/**", config); // 对所有路径生效
        return new CorsFilter(source);
    }
}
