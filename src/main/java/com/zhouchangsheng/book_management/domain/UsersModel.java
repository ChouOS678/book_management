package com.zhouchangsheng.book_management.domain;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.io.Serializable;

/**
 * 用户实体类，用于存储用户信息。
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsersModel implements Serializable {
    private Integer userId; // 用户ID字段
    private String userName; // 用户名字段
    private String password; // 密码字段
    private String email; // 邮箱字段
    private String role; // 角色字段(普通用户/管理员)
}
