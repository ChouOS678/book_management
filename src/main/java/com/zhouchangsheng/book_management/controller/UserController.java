package com.zhouchangsheng.book_management.controller;

import com.zhouchangsheng.book_management.domain.UsersModel;
import com.zhouchangsheng.book_management.service.UserService;
import jakarta.annotation.Resource;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        UsersModel user = userService.login(request.getUsername(), request.getPassword());
        if (user != null) {
            // 一个生成 token 的逻辑 (例如 JWT)
            // 这里只是一个示例 token
            String token = "your_generated_jwt_token_for_" + user.getUserName();

            // 创建一个响应对象，包含 token 和 user 信息
            LoginResponse loginResponse = new LoginResponse(token, user);
            return ResponseEntity.ok(loginResponse); // 返回 200 OK 和 JSON 对象
        }
        // 返回 401 Unauthorized 或 400 Bad Request
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("用户名或密码错误");
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UsersModel user) {
        // 设置默认角色为普通用户
        if (user.getRole() == null) {
            user.setRole("普通用户");
        }

        boolean success = userService.register(user);
        if (success) {
            // 注册成功后，直接登录并返回 token 和 user 信息
            String token = "your_generated_jwt_token_for_" + user.getUserName();
            return ResponseEntity.ok(new LoginResponse(token, user)); // 返回 200 OK 和 JSON 对象
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("注册失败，用户名已存在");
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

    /**
     * 登录响应对象
     */
    @Setter
    @Getter
    @AllArgsConstructor // Lombok annotation to generate all-args constructor
    public static class LoginResponse {
        private String token;
        private UsersModel user;
    }
}
