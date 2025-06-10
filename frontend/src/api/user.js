import request from '@/utils/request';

// 获取用户详情
export function getUserById(id) {
    return request({
        url: `/api/users/${id}`,
        method: 'get'
    });
}

// 获取用户列表
export function getAllUsers() {
    return request({
        url: '/api/users',
        method: 'get'
    });
}

// 添加用户
export function addUser(data) {
    return request({
        url: '/api/users',
        method: 'post',
        data
    });
}

// 修改用户
export function updateUser(id, data) {
    return request({
        url: `/api/users/${id}`,
        method: 'put',
        data
    });
}

// 删除用户
export function deleteUser(id) {
    return request({
        url: `/api/users/${id}`,
        method: 'delete'
    });
}

// 用户注册
export function registerUser(data) {
    return request({
        url: '/api/users/register',
        method: 'post',
        data
    });
}

// 用户登录
export function loginUser(data) {
    return request({
        url: '/api/users/login',
        method: 'post',
        data
    });
}
