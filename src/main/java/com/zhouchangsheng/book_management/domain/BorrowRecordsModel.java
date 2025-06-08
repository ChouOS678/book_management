package com.zhouchangsheng.book_management.domain;
import java.io.Serializable;
import java.util.Date;

import lombok.Data;
/**
 * 借阅记录实体类
 */
@Data
public class BorrowRecordsModel implements Serializable {

    private int record_id; // 主键ID
    private int book_id; // 图书ID
    private int user_id; // 用户ID
    private Date BorrowDate; // 借阅日期
    private Date DueDate; // 剩余时间
    private Date ReturnDate; // 归还日期
    private String Status; // 借阅状态名称(已借阅/已归还)
}