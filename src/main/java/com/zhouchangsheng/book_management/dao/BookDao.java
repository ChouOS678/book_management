package com.zhouchangsheng.book_management.dao;

import com.zhouchangsheng.book_management.domain.BooksModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 图书数据访问层
 */
@Repository
public class BookDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 查询所有图书（查）
     */
    public List<BooksModel> findAll() {
        String sql = "SELECT * FROM books";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            BooksModel book = new BooksModel();
            book.setBook_id(rs.getInt("book_id"));
            book.setTitle(rs.getString("title"));
            book.setIsbn(rs.getString("isbn"));
            book.setAuthor(rs.getString("author"));
            book.setAvailable_quantity(rs.getInt("available_quantity"));
            return book;
        });
    }

    /**
     * 根据ID查询图书（查）
     */
    public BooksModel findById(Integer bookId) {
        String sql = "SELECT * FROM books WHERE book_id = ?";
        List<BooksModel> books = jdbcTemplate.query(sql, (rs, rowNum) -> {
            BooksModel book = new BooksModel();
            book.setBook_id(rs.getInt("book_id"));
            book.setTitle(rs.getString("title"));
            book.setAuthor(rs.getString("author"));
            book.setAvailable_quantity(rs.getInt("available_quantity"));
            return book;
        }, bookId);
        return books.isEmpty() ? null : books.get(0);
    }

    /**
     * 保存图书(增)
     */
    public void save(BooksModel book) {
        String sql = "INSERT INTO books(available_quantity, title, author, isbn, status) VALUES(?,?,?,?,?)";
        jdbcTemplate.update(sql, book.getAvailable_quantity(), book.getTitle(), book.getAuthor(), book.getIsbn(), book.getStatus());
    }

    /**
     * 更新图书（改）
     */
    public void update(BooksModel book) {
        String sql = "UPDATE books SET title=?, author=?, available_quantity=? WHERE book_id=?";
        jdbcTemplate.update(sql, book.getTitle(), book.getAuthor(),
                book.getAvailable_quantity(), book.getBook_id());
    }

    /**
     * 删除图书（删）
     */
    public void deleteById(Integer bookId) {
        String sql = "DELETE FROM books WHERE book_id = ?";
        jdbcTemplate.update(sql, bookId);
    }

    /**
     * 更新图书库存（改）
     */
    public void updateQuantity(Integer quantity) {
        String sql = "UPDATE books SET available_quantity = ?";
        jdbcTemplate.update(sql, quantity);
    }
}
