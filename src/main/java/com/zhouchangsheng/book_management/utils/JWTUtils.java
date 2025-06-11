package com.zhouchangsheng.book_management.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JWTUtils {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    // 生成 JWT (仅在用户名密码验证通过后调用)
    public String generateToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", username);
        claims.put("role", role);
        long expTime = (expiration != null) ?expiration : 3600;
        if(secret == null || secret.isEmpty()){
            throw new IllegalStateException("JWT key没有配置");
        }

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expTime * 1000))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }
}


// 使用生成JWT代码（Gemini给出）
//package com.zhouchangsheng.book_management.utils;
//
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.SignatureAlgorithm;
//import io.jsonwebtoken.security.Keys; // 导入 Keys 类
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//
//import jakarta.annotation.PostConstruct; // 注意这里是 jakarta.annotation.PostConstruct，因为你用的 Spring Boot 3.2.0
//import javax.crypto.SecretKey; // 导入 SecretKey 接口
//import java.util.Base64; // 导入 Base64 用于解码
//import java.util.Date;
//import java.util.HashMap;
//import java.util.Map;
//
//@Component
//public class JWTUtils {
//
//    @Value("${jwt.secret}")
//    private String secretBase64; // 变量名改为 secretBase64，表示它是Base64编码的
//
//    @Value("${jwt.expiration}")
//    private Long expiration;
//
//    private SecretKey signingKey; // 存储实际的 SecretKey 对象
//
//    // 这个方法会在Spring完成依赖注入（即@Value注解的属性设置后）被调用
//    @PostConstruct
//    public void init() {
//        if (secretBase64 == null || secretBase64.isEmpty()) {
//            // 如果 jwt.secret 没有配置，则生成一个新的安全密钥。
//            // 这在开发环境中很方便，但在生产环境中，你理想情况下应该
//            // 一次性生成密钥并安全地存储它。
//            this.signingKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
//            // 可选：打印生成的Base64编码密钥，以便你可以添加到你的 application.properties 中
//            // System.out.println("Generated HS512 Secret Key (Base64 for application.properties): " + Base64.getEncoder().encodeToString(signingKey.getEncoded()));
//            System.err.println("警告: jwt.secret 未配置。已生成一个随机的 HS512 密钥。请在生产环境中将一个 Base64 编码的 512 位密钥配置到 'jwt.secret' 中。");
//        } else {
//            try {
//                // 将从配置文件中读取的Base64编码的secret解码为字节数组，然后创建SecretKey
//                byte[] keyBytes = Base64.getDecoder().decode(secretBase64);
//                // 确保解码后的密钥至少有512位（即64字节）长，以符合HS512要求
//                if (keyBytes.length < 64) {
//                    throw new IllegalArgumentException("配置的JWT密钥对于HS512来说太短了。Base64解码后必须至少为64字节（512位）。当前长度：" + keyBytes.length + " 字节。");
//                }
//                this.signingKey = Keys.hmacShaKeyFor(keyBytes);
//            } catch (IllegalArgumentException e) {
//                // 处理Base64解码失败或密钥太短的情况
//                throw new IllegalStateException("解码或使用配置的JWT密钥时出错: " + e.getMessage(), e);
//            }
//        }
//    }
//
//    // 生成 JWT (仅在用户名密码验证通过后调用)
//    public String generateToken(String username, String role) {
//        Map<String, Object> claims = new HashMap<>();
//        claims.put("username", username);
//        claims.put("role", role);
//        long expTime = (expiration != null) ? expiration : 3600;
//
//        // 确保 signingKey 已初始化
//        if (this.signingKey == null) {
//            throw new IllegalStateException("JWT 签名密钥未初始化。");
//        }
//
//        return Jwts.builder()
//                .setClaims(claims)
//                .setSubject(username)
//                .setIssuedAt(new Date(System.currentTimeMillis()))
//                .setExpiration(new Date(System.currentTimeMillis() + expTime * 1000))
//                .signWith(this.signingKey, SignatureAlgorithm.HS512) // **这里是关键的改动！**
//                .compact();
//    }
//}