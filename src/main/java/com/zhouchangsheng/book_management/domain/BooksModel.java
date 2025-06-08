package com.zhouchangsheng.book_management.domain;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.io.Serializable;

/**
 * 图书实体类，用于表示图书的基本信息。
 */
@Data
@AllArgsConstructor // 生成全参构造方法
@NoArgsConstructor // 生成无参构造方法
public class BooksModel implements Serializable {

    private Integer book_id; // 图书ID
    private Integer available_quantity; // 图书可借阅数量
    private String title; // 图书标题
    private String author; // 图书作者
    private String isbn; // ISBN号
    private String status; // 图书状态（可用/已借出）
}
