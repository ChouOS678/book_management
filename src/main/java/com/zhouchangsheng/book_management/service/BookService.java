package com.zhouchangsheng.book_management.service;

import com.zhouchangsheng.book_management.dao.BookDao;
import com.zhouchangsheng.book_management.domain.BooksModel;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 图书业务层
 */
@Service
public class BookService {

    @Resource
    private BookDao bookDao;

    /**
     * 获取所有图书
     */
    public List<BooksModel> getAllBooks() {
        return bookDao.findAll();
    }

    /**
     * 根据ID获取图书
     */
    public BooksModel getBookById(Integer bookId) {
        return bookDao.findById(bookId);
    }

    /**
     * 添加图书
     */
    public void addBook(BooksModel book) {
        bookDao.save(book);
    }

    /**
     * 更新图书
     */
    public void updateBook(BooksModel book) {
        bookDao.update(book);
    }

    /**
     * 删除图书
     */
    public void deleteBook(Integer bookId) {
        bookDao.deleteById(bookId);
    }

    /**
     * 检查图书是否可借
     */
    public boolean isAvailable(Integer book_id) {
        BooksModel book = bookDao.findById(book_id);
        return book != null && book.getAvailable_quantity() > 0;
    }

    /**
     * 更新图书库存
     */
    public void updateQuantity(Integer quantity) {
        bookDao.updateQuantity(quantity);
    }
}
