package com.zhouchangsheng.book_management.utils;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Base64;
import javax.crypto.SecretKey;
// 密码生成类
public class KeyGenerator {
    public static void main(String[] args) {
        SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS512); // 生成一个512位的HS512密钥
        String base64EncodedKey = Base64.getEncoder().encodeToString(secretKey.getEncoded());
        System.out.println("请将此密钥添加到application.yml文件中:");
        System.out.println("jwt.secret=" + base64EncodedKey);
    }
}
