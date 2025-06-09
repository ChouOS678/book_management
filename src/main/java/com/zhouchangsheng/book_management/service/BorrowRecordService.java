package com.zhouchangsheng.book_management.service;

import com.zhouchangsheng.book_management.dao.BorrowRecordDao;
import com.zhouchangsheng.book_management.domain.BorrowRecordsModel;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Date;
import java.util.List;

/**
 * 借阅记录业务层
 */
@Service
public class BorrowRecordService {

    // @Autowired
    @Resource
    private BorrowRecordDao borrowRecordDao;

    /**
     * 查询所有借阅记录
     *
     * @return 借阅记录列表
     */
    public List<BorrowRecordsModel> findAll() {
        return borrowRecordDao.selectAll();
    }

    /**
     * 添加借阅记录
     *
     * @param record 新借阅记录对象
     */
    @Transactional
    public void add(BorrowRecordsModel record) {
        borrowRecordDao.add(record);
    }

    /**
     * 更新借阅记录状态（例如归还）
     *
     * @param recordId 记录ID
     * @param returnDate 归还日期
     * @param status 新状态
     */
    @Transactional
    public void update(int recordId, Date returnDate, String status) {
        borrowRecordDao.update(recordId, returnDate, status);
    }

    /**
     * 根据用户ID查询借阅记录
     *
     * @param user_id 用户ID
     * @return 借阅记录列表
     */
    public List<BorrowRecordsModel> findByUserId(int user_id) {
        return borrowRecordDao.selectByUserId(user_id);
    }
}
