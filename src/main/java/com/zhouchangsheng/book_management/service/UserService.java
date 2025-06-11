package com.zhouchangsheng.book_management.service;

import com.zhouchangsheng.book_management.dao.UserDao;
import com.zhouchangsheng.book_management.domain.UsersModel;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.resource.ResourceUrlProvider;

import java.util.List;

/**
 * 用户业务层
 */
@Service
public class UserService {

   // @Autowired
    @Resource
    private UserDao userDao;
    @Autowired
    private ResourceUrlProvider resourceUrlProvider;

    /**
     * 获取所有用户
     */
    public List<UsersModel> getAllUsers() {
        return userDao.findAll();
    }

    /**
     * 根据ID获取用户
     */
    public UsersModel getUserById(Integer userId) {
        return userDao.findById(userId);
    }

    /**
     * 用户登录验证
     */
    public UsersModel login(String username, String password) {
        UsersModel user = userDao.findByUsername(username);
        System.out.println("user: " + user);
        if(user != null) {
            System.out.println("数据库存储密码" + user.getUserName() + ": '" + user.getPassword() + "'");
            System.out.println("输入密码" + username + ": '" + password + "'");
        }
        if (user != null && user.getPassword().equals(password)) {
//            if (user.getRole().equals("管理员")) { return user; } // 添加管理员业务
//            else { return user; } // 添加普通用户业务
            return user;
        }
        return null;
    }

    /**
     * 用户注册
     */
    public boolean register(UsersModel user) {
        try {
            // 检查用户名是否已存在
            if (userDao.findByUsername(user.getUserName()) != null) {
                return false;
            }
            userDao.save(user);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 添加用户
     */
    public void addUser(UsersModel user) {
        userDao.save(user);
    }

    /**
     * 更新用户
     */
    public void updateUser(UsersModel user) {
        userDao.update(user);
    }

    /**
     * 删除用户
     */
    public void deleteUser(Integer userId) {
        userDao.deleteById(userId);
    }
}
