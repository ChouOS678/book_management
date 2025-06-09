package com.zhouchangsheng.book_management.dao;

import com.zhouchangsheng.book_management.domain.BorrowRecordsModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
// Dao层只能用sql.Data(JDBC下)
import java.sql.Date;

import java.sql.ResultSet;
import java.util.List;

/**
 * 借阅记录数据访问层
 */
@Repository
public class BorrowRecordDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 查询所有借阅记录(查)
     * @return 借阅记录列表
     */
    public List<BorrowRecordsModel> selectAll() {
        String sql = "SELECT * FROM borrow_records";
        return jdbcTemplate.query(sql, (ResultSet rs, int rowNum) -> {
            BorrowRecordsModel record = new BorrowRecordsModel();
            record.setRecord_id(rs.getInt("record_id"));
            record.setBook_id(rs.getInt("book_id"));
            record.setUser_id(rs.getInt("user_id"));
            record.setBorrowDate(rs.getDate("BorrowDate"));
            record.setDueDate(rs.getDate("DueDate"));
            record.setReturnDate(rs.getDate("ReturnDate"));
            record.setStatus(rs.getString("Status"));
            return record;
        });
    }

    /**
     * 添加借阅记录（增）
     * @param record 新借阅记录对象
     */
    public void add(BorrowRecordsModel record) {
        String sql = "INSERT INTO borrow_records (book_id, user_id, BorrowDate, DueDate, ReturnDate, Status) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        java.sql.Date sqlReturnDate = null;
        if (record.getReturnDate() != null) {
            sqlReturnDate = new java.sql.Date(record.getReturnDate().getTime());
        }

        jdbcTemplate.update(sql,
                record.getBook_id(),
                record.getUser_id(),
                new Date(record.getBorrowDate().getTime()),
                new Date(record.getDueDate().getTime()),
                sqlReturnDate, // ReturnDate参数
                record.getStatus());
    }

    /**
     * 更新借阅记录状态（例如归还）（改）
     * @param recordId 记录ID
     * @param returnDate 归还日期
     * @param status 新状态
     */
    public void update(int recordId, Date returnDate, String status) {

        String sql = "UPDATE borrow_records SET ReturnDate = ?, Status = ? WHERE record_id = ?";
        jdbcTemplate.update(sql,
                new Date(returnDate.getTime()),
                status,
                recordId);
    }

    /**
     * 根据用户ID查询借阅记录（查）
     * @param user_id 用户ID
     * @return 借阅记录列表
     */
    public List<BorrowRecordsModel> selectByUserId(int user_id) {
        String sql = "SELECT * FROM borrow_records WHERE user_id = ?";
        return jdbcTemplate.query(sql, new Object[]{user_id}, (rs, rowNum) -> {
            BorrowRecordsModel record = new BorrowRecordsModel();
            record.setRecord_id(rs.getInt("record_id"));
            record.setBook_id(rs.getInt("book_id"));
            record.setUser_id(rs.getInt("user_id"));
            record.setBorrowDate(rs.getDate("BorrowDate"));
            record.setDueDate(rs.getDate("DueDate"));
            record.setReturnDate(rs.getDate("ReturnDate"));
            record.setStatus(rs.getString("Status"));
            return record;
        });
    }
}