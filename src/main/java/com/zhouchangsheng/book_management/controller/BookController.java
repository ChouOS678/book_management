package com.zhouchangsheng.book_management.controller;

import com.zhouchangsheng.book_management.domain.BooksModel;
import com.zhouchangsheng.book_management.service.BookService;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 图书控制器 - RESTful API
 */
@RestController
@RequestMapping("/api/books")
public class BookController {

    @Resource
    private BookService bookService;

    /**
     * 获取所有图书
     */
    @GetMapping("/get/all")
    public List<BooksModel> getAllBooks() {
        return bookService.getAllBooks();
    }

    /**
     * 根据ID获取图书
     */
    @GetMapping("/get/{id}")
    public BooksModel getBookById(@PathVariable Integer id) {
        return bookService.getBookById(id);
    }

    /**
     * 添加图书
     */
    @PostMapping("/add")
    public String addBook(@RequestBody BooksModel book) {
        bookService.addBook(book);
        return "图书添加成功";
    }

    /**
     * 更新图书
     */
    @PutMapping("/{id}")
    public String updateBook(@PathVariable Integer id, @RequestBody BooksModel book) {
        book.setBook_id(id);
        bookService.updateBook(book);
        return "图书更新成功";
    }

    /**
     * 删除图书
     */
    @DeleteMapping("/{id}")
    public String deleteBook(@PathVariable Integer id) {
        bookService.deleteBook(id);
        return "图书删除成功";
    }
}
