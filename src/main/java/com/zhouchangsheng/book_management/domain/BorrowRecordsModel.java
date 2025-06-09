package com.zhouchangsheng.book_management.domain;

import java.io.Serializable;
import java.util.Date;

import lombok.Data;

/**
 * 借阅记录实体类
 */
@Data
public class BorrowRecordsModel implements Serializable {

    private int recordId; // 主键ID
    private int bookId; // 图书ID
    private int userId; // 用户ID
    private Date borrowDate; // 借阅日期
    private Date dueDate; // 剩余时间
    private Date returnDate; // 归还日期
    private String status; // 借阅状态名称(已借阅/已归还)
}
