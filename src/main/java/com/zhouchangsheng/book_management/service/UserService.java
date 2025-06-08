package com.zhouchangsheng.book_management.service;

import com.zhouchangsheng.book_management.dao.UserDao;
import com.zhouchangsheng.book_management.domain.UsersModel;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 用户业务层
 */
@Service
public class UserService {

   // @Autowired
    @Resource
    private UserDao userDao;

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
        if (user != null && user.getPassword().equals(password)) {
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
