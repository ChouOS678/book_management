import request from '@/utils/request';

// 获取所有借阅记录
export function getAllRecords() {
    return request({
        url: '/api/records/find/all',
        method: 'get'
    });
}

// 根据 ID 获取记录
export function getRecordById(id) {
    return request({
        url: `/api/records/find/id?id=${id}`,
        method: 'get'
    });
}

// 添加记录
export function addRecord(data) {
    return request({
        url: '/api/records/add',
        method: 'post',
        data
    });
}

// 更新记录
export function updateRecord(data) {
    return request({
        url: '/api/records/update',
        method: 'post',
        data
    });
}
