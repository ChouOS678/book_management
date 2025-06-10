import request from '@/utils/request';

// 获取所有图书
export function getAllBooks() {
    return request({
        url: '/api/books/get/all',
        method: 'get'
    });
}

// 根据 ID 获取图书
export function getBookById(id) {
    return request({
        url: `/api/books/get/${id}`,
        method: 'get'
    });
}

// 添加图书
export function addBook(data) {
    return request({
        url: '/api/books/add',
        method: 'post',
        data
    });
}

// 修改图书
export function updateBook(id, data) {
    return request({
        url: `/api/books/${id}`,
        method: 'put',
        data
    });
}

// 删除图书
export function deleteBook(id) {
    return request({
        url: `/api/books/${id}`,
        method: 'delete'
    });
}
