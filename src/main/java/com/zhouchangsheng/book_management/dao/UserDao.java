package com.zhouchangsheng.book_management.dao;

import com.zhouchangsheng.book_management.domain.UsersModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 用户数据访问层
 */
@Repository
public class UserDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 查询所有用户（查）
     */
    public List<UsersModel> findAll() {
        String sql = "SELECT * FROM users";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            UsersModel user = new UsersModel();
            user.setUserId(rs.getInt("user_id"));
            user.setUserName(rs.getString("user_name"));
            user.setPassword(rs.getString("pass"));
            user.setEmail(rs.getString("email"));
            user.setRole(rs.getString("role"));
            return user;
        });
    }

    /**
     * 根据ID查询用户（查）
     */
    public UsersModel findById(Integer userId) {
        String sql = "SELECT * FROM users WHERE user_id = ?";
        List<UsersModel> users = jdbcTemplate.query(sql, (rs, rowNum) -> {
            UsersModel user = new UsersModel();
            user.setUserId(rs.getInt("user_id"));
            user.setUserName(rs.getString("user_name"));
            user.setPassword(rs.getString("pass"));
            user.setEmail(rs.getString("email"));
            user.setRole(rs.getString("role"));
            return user;
        }, userId);
        return users.isEmpty() ? null : users.get(0);
    }

    /**
     * 根据用户名查询用户（查）
     */
    public UsersModel findByUsername(String username) {
        String sql = "SELECT * FROM users WHERE user_name = ?";
        List<UsersModel> users = jdbcTemplate.query(sql, (rs, rowNum) -> {
            UsersModel user = new UsersModel();
            user.setUserId(rs.getInt("user_id"));
            user.setUserName(rs.getString("user_name"));
            user.setPassword(rs.getString("pass"));
            user.setEmail(rs.getString("email"));
            user.setRole(rs.getString("role"));
            return user;
        }, username);
        return users.isEmpty() ? null : users.get(0);
    }

    /**
     * 保存用户（增）
     */
    public void save(UsersModel user) {
        String sql = "INSERT INTO users(user_name, pass, email, role) VALUES(?,?,?,?)";
        jdbcTemplate.update(sql, user.getUserName(), user.getPassword(),
                user.getEmail(), user.getRole());
    }

    /**
     * 更新用户
     */
    public void update(UsersModel user) {
        String sql = "UPDATE users SET user_name=?, pass=?, email=?, role=? WHERE user_id=?";
        jdbcTemplate.update(sql, user.getUserName(), user.getPassword(),
                user.getEmail(), user.getRole(), user.getUserId());
    }

    /**
     * 删除用户（删）
     */
    public void deleteById(Integer userId) {
        String sql = "DELETE FROM users WHERE user_id = ?";
        jdbcTemplate.update(sql, userId);
    }
}
