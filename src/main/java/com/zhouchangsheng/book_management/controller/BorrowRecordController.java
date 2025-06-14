package com.zhouchangsheng.book_management.controller;

import com.zhouchangsheng.book_management.domain.BorrowRecordsModel;
import com.zhouchangsheng.book_management.service.BorrowRecordService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;
// 时间库
import java.util.Date;
import java.util.List;

/**
 * 借阅记录控制器 - RESTful API
 */
@RestController
@RequestMapping("/api/records")
public class BorrowRecordController {

    @Resource
    private BorrowRecordService borrowRecordService;

    /**
     * 调用service层查询所有借阅记录方法
     */
    @GetMapping("/find/all")
    public List<BorrowRecordsModel> findAll() {
        return borrowRecordService.findAll();
    }

    /**
     * 调用添加借阅记录方法
     * @param borrowRecordsModel
     */
    @PostMapping("/add")
    public void addBorrowRecord(@RequestBody BorrowRecordsModel borrowRecordsModel) {
        borrowRecordService.add(borrowRecordsModel);
    }

    /**
     * 调用更新借阅状态方法
     */
    @PostMapping("/update")
    public void updateBorrowRecord(@RequestBody BorrowRecordsModel borrowRecordsModel) {
        borrowRecordService.update(borrowRecordsModel.getRecord_id(),
                borrowRecordsModel.getReturnDate(), borrowRecordsModel.getStatus());
    }

    /**
     * 调用根据用户id查询借阅记录方法
     */
    @GetMapping("/find/id")
    public List<BorrowRecordsModel> findByRecordId(@RequestParam int record_id) {
       return borrowRecordService.findByUserId(record_id);
    }

}
