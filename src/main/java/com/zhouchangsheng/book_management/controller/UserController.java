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
    public ResponseResult<String> login(@RequestBody LoginRequest request) {
        UsersModel user = userService.login(request.getUsername(), request.getPassword());
        if (user != null) {
            return ResponseResult.success("登录成功");
        }
        return ResponseResult.error("用户名或密码错误");
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseResult<String> register(@RequestBody UsersModel user) {
        // 设置默认角色为普通用户
        if (user.getRole() == null) {
            user.setRole("普通用户");
        }

        boolean success = userService.register(user);
        if (success) {
            return ResponseResult.success("注册成功");
        }
        return ResponseResult.error("注册失败，用户名已存在");
    }

    /**
     * 添加用户（管理员功能）
     */
    @PostMapping
    public ResponseResult<String> addUser(@RequestBody UsersModel user) {
        userService.addUser(user);
        return ResponseResult.success("用户添加成功");
    }

    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    public ResponseResult<String> updateUser(@PathVariable Integer id, @RequestBody UsersModel user) {
        user.setUserId(id);
        userService.updateUser(user);
        return ResponseResult.success("用户更新成功");
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public ResponseResult<String> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseResult.success("用户删除成功");
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
     * 统一响应结果类
     */
    @Setter
    @Getter
    public static class ResponseResult<T> {

        private Integer code;
        private String message;
        private T data;

        public static <T> ResponseResult<T> success(T data) {
            ResponseResult<T> result = new ResponseResult<>();
            result.setCode(200);
            result.setMessage("操作成功");
            result.setData(data);
            return result;
        }

        public static <T> ResponseResult<T> error(String message) {
            ResponseResult<T> result = new ResponseResult<>();
            result.setCode(500);
            result.setMessage(message);
            return result;
        }

    }
}
