package com.zhouchangsheng.book_management.controller;

import com.zhouchangsheng.book_management.domain.UsersModel;
import com.zhouchangsheng.book_management.service.UserService;
import jakarta.annotation.Resource;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户控制器 - RESTful API
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

   // @Autowired
    @Resource
    private UserService userService;

    /**
     * 获取所有用户
     */
    @GetMapping
    public List<UsersModel> getAllUsers() {
        return userService.getAllUsers();
    }

    /**
     * 根据ID获取用户
     */
    @GetMapping("/{id}")
    public UsersModel getUserById(@PathVariable Integer id) {
        return userService.getUserById(id);
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        UsersModel user = userService.login(request.getUsername(), request.getPassword());
        if (user != null) {
            return "登录成功";
        }
        return "用户名或密码错误";
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public String register(@RequestBody UsersModel user) {
        // 设置默认角色为普通用户
        if (user.getRole() == null) {
            user.setRole("普通用户");
        }

        boolean success = userService.register(user);
        if (success) {
            return "注册成功";
        }
        return "注册失败，用户名已存在";
    }

    /**
     * 添加用户（管理员功能）
     */
    @PostMapping
    public String addUser(@RequestBody UsersModel user) {
        userService.addUser(user);
        return "用户添加成功";
    }

    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    public String updateUser(@PathVariable Integer id, @RequestBody UsersModel user) {
        user.setUserId(id);
        userService.updateUser(user);
        return "用户更新成功";
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return "用户删除成功";
    }

    /**
     * 登录请求对象
     */
    @Setter
    @Getter
    public static class LoginRequest {

        private String username;
        private String password;

    }
}
