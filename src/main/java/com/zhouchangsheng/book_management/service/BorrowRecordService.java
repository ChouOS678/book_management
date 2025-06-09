package com.zhouchangsheng.book_management.service;

import com.zhouchangsheng.book_management.dao.BorrowRecordDao;
import com.zhouchangsheng.book_management.domain.BorrowRecordsModel;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// 时间库
import java.util.Date;
import java.util.List;

/**
 *借阅记录业务层
 */
@Service
public class BorrowRecordService {


    @Resource
    private BorrowRecordDao borrowRecordDao;

    /**
     * 查询所有借阅记录
     * @return 借阅记录列表
     */
    public List<BorrowRecordsModel> findAll() {
        return borrowRecordDao.selectAll();
    }

    /**
     * 添加借阅记录
     * @param record 新借阅记录对象
     */
    @Transactional
    public void add(BorrowRecordsModel record) {
        // 检查关键数据是否为空
        if (record.getBorrowDate() == null) {
            // 设置一个默认值（当前时间）
            record.setBorrowDate(new java.util.Date());
        }

        // 只有在数据校验通过后，才调用DAO方法
        borrowRecordDao.add(record);
    }

    /**
     * 更新借阅记录状态（例如归还）
     * @param recordId 记录ID
     * @param returnDate 归还日期
     * @param status 新状态
     */
    @Transactional
    public void update(int recordId, Date returnDate, String status) {
        // 1.调用Dao层之前，将java.util.date转换为java.sql.date
        java.sql.Date sqlreturnDate = new java.sql.Date(returnDate.getTime());

        // 2.将转换后的sql.Date对象传入Dao方法
        borrowRecordDao.update(recordId, sqlreturnDate, status);
    }

    /**
     * 根据用户ID查询借阅记录
     * @param user_id 用户ID
     * @return 借阅记录列表
     */
    public List<BorrowRecordsModel> findByUserId(int user_id) {
        return borrowRecordDao.selectByUserId(user_id);
    }
}
