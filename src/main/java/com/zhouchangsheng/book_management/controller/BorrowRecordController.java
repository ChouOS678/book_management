package com.zhouchangsheng.book_management.controller;

import com.zhouchangsheng.book_management.domain.BorrowRecordsModel;
import com.zhouchangsheng.book_management.service.BorrowRecordService;
import jakarta.annotation.Resource;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.*;
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
     * 获取所有借阅记录
     */
    @GetMapping
    public ResponseResult<List<BorrowRecordsModel>> findAll() {
        return ResponseResult.success(borrowRecordService.findAll());
    }

    /**
     * 添加借阅记录
     */
    @PostMapping
    public ResponseResult<String> addBorrowRecord(@RequestBody BorrowRecordsModel borrowRecordsModel) {
        borrowRecordService.add(borrowRecordsModel);
        return ResponseResult.success("借阅记录添加成功");
    }

    /**
     * 更新借阅状态
     */
    @PutMapping("/{id}")
    public ResponseResult<String> updateBorrowRecord(
            @PathVariable("id") int recordId,
            @RequestBody BorrowRecordsModel borrowRecordsModel) {
        borrowRecordService.update(recordId,
                borrowRecordsModel.getReturnDate(),
                borrowRecordsModel.getStatus());
        return ResponseResult.success("借阅状态更新成功");
    }

    /**
     * 根据用户ID查询借阅记录
     */
    @GetMapping("/user/{userId}")
    public ResponseResult<List<BorrowRecordsModel>> findByUserId(@PathVariable("userId") int userId) {
        return ResponseResult.success(borrowRecordService.findByUserId(userId));
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
