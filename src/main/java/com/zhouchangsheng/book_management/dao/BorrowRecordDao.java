package com.zhouchangsheng.book_management.dao;

import com.zhouchangsheng.book_management.domain.BorrowRecordsModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
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
     *
     * @return 借阅记录列表
     */
    public List<BorrowRecordsModel> selectAll() {
        String sql = "SELECT * FROM borrow_records";
        return jdbcTemplate.query(sql, (ResultSet rs, int rowNum) -> {
            BorrowRecordsModel record = new BorrowRecordsModel();
            record.setRecordId(rs.getInt("record_id"));
            record.setBookId(rs.getInt("book_id"));
            record.setUserId(rs.getInt("user_id"));
            record.setBorrowDate(rs.getDate("BorrowDate"));
            record.setDueDate(rs.getDate("DueDate"));
            record.setReturnDate(rs.getDate("ReturnDate"));
            record.setStatus(rs.getString("Status"));
            return record;
        });
    }

    /**
     * 添加借阅记录（增）
     *
     * @param record 新借阅记录对象
     */
    public void add(BorrowRecordsModel record) {
        String sql = "INSERT INTO borrow_records (book_id, user_id, BorrowDate, DueDate, Status) "
                + "VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                record.getBookId(),
                record.getUserId(),
                new Date(record.getBorrowDate().getTime()),
                new Date(record.getDueDate().getTime()),
                record.getStatus());
    }

    /**
     * 更新借阅记录状态（例如归还）（改）
     *
     * @param recordId 记录ID
     * @param returnDate 归还日期
     * @param status 新状态
     */
    public void update(int recordId, java.util.Date returnDate, String status) {
        String sql = "UPDATE borrow_records SET ReturnDate = ?, Status = ? WHERE record_id = ?";
        jdbcTemplate.update(sql,
                returnDate != null ? new Date(returnDate.getTime()) : null,
                status,
                recordId);
    }

    /**
     * 根据用户ID查询借阅记录（查）
     *
     * @param user_id 用户ID
     * @return 借阅记录列表
     */
    public List<BorrowRecordsModel> selectByUserId(int user_id) {
        String sql = "SELECT * FROM borrow_records WHERE user_id = ?";
        return jdbcTemplate.query(sql, new Object[]{user_id}, (rs, rowNum) -> {
            BorrowRecordsModel record = new BorrowRecordsModel();
            record.setRecordId(rs.getInt("record_id"));
            record.setBookId(rs.getInt("book_id"));
            record.setUserId(rs.getInt("user_id"));
            record.setBorrowDate(rs.getDate("BorrowDate"));
            record.setDueDate(rs.getDate("DueDate"));
            record.setReturnDate(rs.getDate("ReturnDate"));
            record.setStatus(rs.getString("Status"));
            return record;
        });
    }
}
