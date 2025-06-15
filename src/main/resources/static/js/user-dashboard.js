// 全局变量
const API_BASE_URL = '/book-management/api';
let currentUser = null; // 用于存储当前登录的用户信息
let currentUserId = null; // 用于存储当前登录用户的ID

// 获取请求头：包含 Content-Type 和 Authorization (Bearer Token)
function getAuthHeaders() {
    const userString = localStorage.getItem('user');
    let token = null;
    if (userString) {
        try {
            const user = JSON.parse(userString);
            token = user.token; // 从 localStorage 中解析出的 user 对象获取 token
        } catch (e) {
            console.error("Error parsing user data from localStorage:", e);
            // 如果解析失败，说明 localStorage 中的数据可能损坏，清除它
            localStorage.removeItem('user');
        }
    }

    if (!token) {
        // 如果没有找到 token，给出警告，并可以重定向到登录页
        console.warn('No authentication token found. User is not logged in or session expired.');
        // window.location.href = '/book-management/login.html'; // 强制重定向
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '' // 如果 token 存在则添加 Bearer 前缀
    };
}

// 初始化函数：页面加载时执行
function init() {
    checkAuth(); // 检查用户认证状态
    setupEventListeners(); // 设置页面元素的事件监听器
}

// 检查认证状态：从 localStorage 获取用户信息并验证
function checkAuth() {
    console.log('Checking authentication...');
    const userString = localStorage.getItem('user');
    console.log('Raw user data from localStorage:', userString);

    if (!userString) {
        console.warn('No user data found in localStorage. Redirecting to login.');
        logout(); // 没有用户数据，视为未登录，直接注销并重定向
        return;
    }

    try {
        const userData = JSON.parse(userString);
        console.log('Parsed user data:', userData);

        // 确保从 localStorage 获取到的用户数据包含 token 和 userId
        if (!userData || !userData.token || userData.userId === undefined || userData.userId === null) {
            console.warn('Incomplete user data or missing token/userId. Redirecting to login.');
            logout(); // 数据不完整，视为未登录
            return;
        }

        currentUserId = userData.userId; // 设置全局变量 currentUserId
        currentUser = userData; // 存储当前用户所有数据，包括 token
        console.log('Current userId:', currentUserId);

        // API 通常需要数字类型的 ID，确保 currentUserId 是数字
        const parsedUserId = parseInt(currentUserId);
        if (isNaN(parsedUserId)) {
            console.error('Invalid user ID format in localStorage:', currentUserId);
            throw new Error('Invalid user ID format');
        }
        console.log('Parsed userId for API call:', parsedUserId);

        // 获取完整的用户信息（以防 localStorage 中的数据不完整或过期）
        getUserInfo(parsedUserId);
    } catch (error) {
        console.error('Authentication check error:', error);
        logout(); // 认证检查失败，重定向到登录页
    }
}

// 获取用户信息：通过 API 获取当前用户的详细信息
async function getUserInfo(userId) {
    // 确保 userId 是数字类型
    const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
    if (isNaN(numericUserId)) {
        console.error('getUserInfo: Invalid user ID format:', userId);
        alert('无效的用户ID格式，请重新登录。');
        logout();
        return false;
    }

    try {
        // API: GET /api/users/find/id/{id}
        const response = await fetch(`${API_BASE_URL}/users/find/id/${numericUserId}`, {
            headers: getAuthHeaders() // 携带 token
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token 无效或过期，或者没有权限
                alert('您的会话已过期或无权访问，请重新登录。');
                logout(); // 清理并重定向
                return false;
            }
            throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
        }

        const user = await response.json();
        currentUser = user; // 更新全局 currentUser 为后端返回的最新用户数据
        updateUserInfoDisplay(user); // 更新页面上显示的用户信息
        return true;
    } catch (error) {
        console.error('Error fetching user info:', error);
        alert(`无法加载用户信息: ${error.message}. 请重新登录`);
        logout(); // 无法获取用户信息，强制重新登录
        return false;
    }
}


// 刷新令牌 (需要后端支持 /auth/refresh 接口并返回新的 token)。
async function refreshToken() {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.refreshToken) {
            console.warn('No refresh token found.');
            throw new Error('Missing refresh token');
        }

        console.log('Attempting to refresh token...');
        // 假设后端有 /auth/refresh 接口
        const response = await fetch(`${API_BASE_URL}/users/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refreshToken: userData.refreshToken,
                // 根据后端要求，发送当前 access token 用于验证
                accessToken: userData.token // 需要 PUT /users/auth/current-token 接口验证当前 token
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to refresh token: ${errorData.message || response.statusText}`);
        }

        const { token: newToken, refreshToken: newRefreshToken } = await response.json(); // 假设返回新的 token 和 refreshToken
        userData.token = newToken; // 更新 localStorage 中的 token
        if (newRefreshToken) { // 如果后端也返回了新的 refreshToken，也要更新
            userData.refreshToken = newRefreshToken;
        }
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Token refreshed successfully.');
    } catch (error) {
        console.error('Error refreshing token:', error);
        alert('Failed to refresh token, please re-login.');
        logout(); // 刷新失败通常意味着需要强制重新登录
        throw error;
    }
}

// 更新个人信息显示到页面上
function updateUserInfoDisplay(user) {
    // 确保 DOM 元素存在，以避免 null 引用错误
    const userNameElement = document.getElementById('user-name');
    const profileUsernameElement = document.getElementById('profile-username');
    const profileEmailElement = document.getElementById('profile-email');
    const profileRoleElement = document.getElementById('profile-role');

    if (userNameElement) userNameElement.textContent = user.userName;
    if (profileUsernameElement) profileUsernameElement.textContent = user.userName;
    if (profileEmailElement) profileEmailElement.textContent = user.email;
    if (profileRoleElement) profileRoleElement.textContent = user.role;
}

// 设置事件监听器
function setupEventListeners() {
    // 侧边栏导航：点击切换内容区域
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-nav li').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));

            item.classList.add('active');
            const sectionId = item.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');

            // 针对不同的 section 触发数据加载
            if (sectionId === 'borrow-search-section') {
                // 当切换到搜索页面时，如果搜索框为空，默认显示所有书籍
                if (!document.getElementById('search-input').value) {
                    fetchAllBooks();
                } else {
                    // 如果有搜索词，则执行搜索
                    performSearch();
                }
            } else if (sectionId === 'current-borrowings-section') {
                refreshCurrentBorrowings(); // 切换到当前借阅时加载数据
            } else if (sectionId === 'borrow-history-section') {
                refreshBorrowHistory(); // 切换到借阅历史时加载数据
            }
        });
    });

    // 搜索功能：输入时触发搜索，筛选类型改变时触发搜索
    document.getElementById('search-input').addEventListener('input', performSearch);
    document.getElementById('filter-type').addEventListener('change', performSearch);

    // 注销按钮：点击执行注销操作
    document.getElementById('logout-btn').addEventListener('click', logout);

    // 修改密码表单提交：阻止默认提交行为并调用修改密码函数
    document.getElementById('change-password-form').addEventListener('submit', changePassword);

    // 更新信息按钮：目前是占位功能
    document.getElementById('update-profile-btn').addEventListener('click', () => {
        alert('此功能在演示中不可用。在实际应用中，这里会打开一个编辑表单来更新用户信息。');
    });

    // 页面加载时默认加载当前借阅和借阅历史
    // 放在这里，确保 DOM 已加载且事件监听器已设置
    refreshCurrentBorrowings();
    refreshBorrowHistory();
}

//业务功能模块！！！！！！！！！！！
// 执行搜索：根据输入和筛选条件获取书籍
async function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    const filterType = document.getElementById('filter-type').value;

    if (query.length < 2 && query.length > 0) { // 如果输入不足2个字符，且不为空，则清除结果
        clearSearchResults();
        return;
    }
    if (query.length === 0) { // 如果搜索框为空，显示所有书籍
        await fetchAllBooks();
        return;
    }

    let endpoint = '/books/find/all'; // 基础 endpoint

    // 根据 filterType 构建查询参数
    const params = new URLSearchParams();
    switch(filterType) {
        case 'title':
            params.append('title', query);
            break;
        case 'author':
            params.append('author', query);
            break;
        case 'isbn':
            params.append('isbn', query);
            break;
        default: // 'all' 或未选择时，使用 'search' 参数
            params.append('search', query);
    }

    try {
        // API: GET /api/books/find/all?title={query}&author={query}&isbn={query}&search={query}
        const response = await fetch(`${API_BASE_URL}${endpoint}?${params.toString()}`, {
            headers: getAuthHeaders() // 携带 token
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error(`Search failed: ${response.status} ${response.statusText}`);
        }
        const books = await response.json();
        displaySearchResults(books);
    } catch (error) {
        console.error('Error during search:', error);
        alert('Failed to complete search, please try again later.');
    }
}

// 获取所有书籍：用于搜索框为空时显示所有书籍
async function fetchAllBooks() {
    try {
        // API: GET /api/books/find/all
        const response = await fetch(`${API_BASE_URL}/books/find/all`, {
            headers: getAuthHeaders() // 携带 token
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error(`Failed to fetch all books: ${response.status} ${response.statusText}`);
        }
        const books = await response.json();
        displaySearchResults(books); // 使用相同的函数显示结果
    } catch (error) {
        console.error('Error fetching all books:', error);
        alert('Failed to load book list, please try again later.');
    }
}

// 显示搜索结果到页面
function displaySearchResults(books) {
    const container = document.getElementById('search-results');
    container.innerHTML = ''; // 清空旧结果

    if (!books || books.length === 0) {
        container.innerHTML = '<p class="no-results">No related books found.</p>';
        return;
    }

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <h3>${book.title || 'N/A'}</h3>
            <p>Author: ${book.author || 'N/A'}</p>
            <p>ISBN: ${book.isbn || 'N/A'}</p>
            <p>Stock: ${book.available_quantity !== undefined ? book.available_quantity : 'N/A'}</p>
            <button onclick="borrowBook(${book.book_id})" ${book.available_quantity <= 0 ? 'disabled' : ''}>Borrow</button>
        `;
        // 借阅按钮在库存为0时禁用
        container.appendChild(bookCard);
    });
}

// 清除搜索结果
function clearSearchResults() {
    document.getElementById('search-results').innerHTML = '';
}

// 借阅图书：发送借阅请求
async function borrowBook(bookId) {
    if (!confirm('Confirm to borrow this book?')) {
        return;
    }

    // 确保当前用户ID已加载
    if (!currentUserId) {
        alert('User information not loaded, please refresh the page or re-login.');
        logout(); // 如果没有用户ID，强制重新登录
        return;
    }

    const borrowData = {
        book_id: bookId, // API: BorrowRecordsModel 使用 book_id
        user_id: currentUserId, // API: BorrowRecordsModel 使用 user_id
        status: '已借阅', // API: BorrowRecordsModel 使用“已借阅”
        borrowDate: new Date().toISOString() // API: BorrowRecordsModel 使用 borrowDate
    };

    try {
        // API: POST /api/records/add
        const response = await fetch(`${API_BASE_URL}/records/add`, {
            method: 'POST',
            headers: getAuthHeaders(), // 携带 token
            body: JSON.stringify(borrowData)
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('会话超时或未认证，请再次登录.');
                logout();
                return;
            }
            const errorData = await response.json(); // 尝试解析后端返回的错误信息
            throw new Error(errorData.message || '借书失败');
        }

        alert('借书成功!');
        refreshCurrentBorrowings(); // 刷新当前借阅列表
        // 刷新搜索结果以更新库存显示
        const currentQuery = document.getElementById('search-input').value;
        if (currentQuery) performSearch(); else fetchAllBooks();

    } catch (error) {
        console.error('Error borrowing book:', error);
        alert(`Borrow failed, please try again later: ${error.message}`);
    }
}

// 获取当前用户的借阅记录
async function refreshCurrentBorrowings() {
    if (!currentUserId) {
        console.warn('currentUserId is null, skipping refreshCurrentBorrowings.');
        return;
    }
    try {
        // API: 按用户ID获取记录的接口，/records/find/{userId}
        const response = await fetch(`${API_BASE_URL}/records/find/${currentUserId}`, {
            headers: getAuthHeaders() // 携带 token
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error(`Failed to get current borrowings: ${response.status} ${response.statusText}`);
        }
        const records = await response.json();
        displayCurrentBorrowings(records.filter(r => r.status !== '已归还')); // 过滤出未归还的
    } catch (error) {
        console.error('Error fetching current borrowings:', error);
        // 不弹窗，静默失败，因为这个数据加载可能不是关键路径
    }
}

// 显示当前借阅记录到表格
function displayCurrentBorrowings(records) {
    const tableBody = document.querySelector('#current-borrowings-table tbody');
    tableBody.innerHTML = ''; // 清空旧记录

    if (!records || records.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No current borrowing records.</td></tr>';
        return;
    }

    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.title || 'Unknown Title'}</td> <td>${new Date(record.borrowDate).toLocaleDateString()}</td>
            <td>
                <button onclick="returnBook(${record.record_id})" ${record.status === '已归还' ? 'disabled' : ''}>Return</button>
            </td>
        `;
        // 注意: record_id 假设是后端返回的字段名 (基于BorrowRecordsModel)
        tableBody.appendChild(row);
    });
}

// 归还书籍：发送归还请求
async function returnBook(recordId) {
    if (!confirm('Confirm to return this book?')) {
        return;
    }

    try {
        // API: PUT /api/records/update (要求整个 BorrowRecordsModel)
        // 首先需要获取该记录的完整信息，然后修改 status 和 returnDate
        const getRecordResponse = await fetch(`${API_BASE_URL}/records/find/${recordId}`, { // API: GET /api/records/find/{id}
            headers: getAuthHeaders() // 携带 token
        });

        if (!getRecordResponse.ok) {
            if (getRecordResponse.status === 401 || getRecordResponse.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error('Failed to fetch record details for return.');
        }
        const recordToUpdate = await getRecordResponse.json();

        // 更新记录状态和归还日期
        recordToUpdate.status = '已归还';
        recordToUpdate.returnDate = new Date().toISOString(); // ISO 8601 格式

        const updateResponse = await fetch(`${API_BASE_URL}/records/update`, {
            method: 'PUT', // 使用 PUT 方法进行更新
            headers: getAuthHeaders(), // 携带 token
            body: JSON.stringify(recordToUpdate) // 发送完整的更新对象
        });

        if (!updateResponse.ok) {
            if (updateResponse.status === 401 || updateResponse.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Return failed');
        }

        alert('Book returned successfully!');
        await refreshCurrentBorrowings(); // 刷新当前借阅列表
        await refreshBorrowHistory(); // 刷新借阅历史

    } catch (error) {
        console.error('Error returning book:', error);
        alert(`Return failed, please try again later: ${error.message}`);
    }
}

// 刷新借阅历史：获取当前用户的所有已归还借阅记录
async function refreshBorrowHistory() {
    if (!currentUserId) {
        console.warn('currentUserId is null, skipping refreshBorrowHistory.');
        return;
    }
    try {
        // 根据用户id查询借阅记录后端接口: /records/find/{userId}?status=已归还
        const response = await fetch(`${API_BASE_URL}/records/find/${currentUserId}?status=已归还`, {
            headers: getAuthHeaders() // 携带 token
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error(`Failed to get borrowing history: ${response.status} ${response.statusText}`);
        }
        const records = await response.json();
        displayBorrowHistory(records);
    } catch (error) {
        console.error('Error fetching borrowing history:', error);
    }
}

// 显示借阅历史记录到表格
function displayBorrowHistory(history) {
    const tableBody = document.querySelector('#borrow-history-table tbody');
    tableBody.innerHTML = ''; // 清空旧记录

    if (!history || history.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">没有借阅历史</td></tr>';
        return;
    }

    history.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.title || 'Unknown Title'}</td> <td>${new Date(record.borrowDate).toLocaleDateString()}</td>
            <td>${record.returnDate ? new Date(record.returnDate).toLocaleDateString() : 'N/A'}</td>
            <td>${record.status}</td>
        `;
        tableBody.appendChild(row);
    });
}

// 修改密码
async function changePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('New password and confirm password do not match.');
        return;
    }

    if (newPassword.length < 5) {
        alert('New password must be at least 5 characters long!');
        return;
    }

    if (!currentUserId || !currentUser) {
        alert('User information not loaded, cannot change password. Please re-login.');
        return;
    }

    try {
        //  修改用户信息接口：POST /api/users/changePassword/{id} 接口
        const response = await fetch(`${API_BASE_URL}/users/changePassword/${currentUserId}`, {
            method: 'POST',
            headers: getAuthHeaders(), // 携带 token
            body: JSON.stringify({
                userId: currentUserId, // 或 userName: currentUser.userName
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Password change failed');
        }

        alert('修改密码成功!');
        // 密码修改成功后，通常需要强制用户重新登录，以确保旧的 token 失效
        logout();
        closeModal('change-password-modal'); // 如果有模态框，关闭它
    } catch (error) {
        console.error('修改密码失败：', error);
        alert(`修改密码失败，请重试 ： ${error.message}`);
    }
}

// 更新用户资料（基于API打开一个编辑表单来更新用户信息）
function updateProfileInfo(user) {
    // 填充表单字段
    document.getElementById('edit-profile-username').value = user.userName;
    document.getElementById('edit-profile-email').value = user.email;

    // 获取模态框
    const modal = document.getElementById('update-profile-modal');
    if (!modal) {
        console.error('Update profile modal not found in DOM');
        alert('页面元素缺失，请检查界面结构');
        return;
    }

    // 显示模态框
    modal.style.display = 'block';

    // 防止重复绑定事件，先移除再绑定
    const form = modal.querySelector('form');
    const submitButton = modal.querySelector('button[type="submit"]');

    // 移除旧的监听器（如果存在）
    const oldListener = submitButton.dataset.listenerAttached;
    if (oldListener) {
        submitButton.removeEventListener('click', updateProfileSubmitHandler);
    }

    // 提交事件处理函数
    const updateProfileSubmitHandler = async function(e) {
        e.preventDefault();

        // 获取最新的输入值
        const updatedData = {
            userName: document.getElementById('edit-profile-username').value.trim(),
            email: document.getElementById('edit-profile-email').value.trim()
        };

        // 简单验证
        if (!updatedData.userName || !updatedData.email) {
            alert('用户名和邮箱不能为空');
            return;
        }

        try {
            // API: PUT /api/users/update/{id}
            const response = await fetch(`${API_BASE_URL}/users/update/${user.userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    alert('会话已过期或无权操作，请重新登录');
                    logout();
                    return;
                }
                throw new Error(`更新失败: ${response.status}`);
            }

            const result = await response.json();
            alert('资料更新成功');

            // 更新全局变量中的用户信息
            currentUser = { ...currentUser, ...updatedData };
            updateUserInfoDisplay(currentUser); // 更新页面显示

            closeModal('update-profile-modal'); // 关闭模态框
        } catch (error) {
            console.error('更新用户资料时出错:', error);
            alert(`更新失败: ${error.message}`);
        }
    };

    // 绑定新的监听器
    submitButton.addEventListener('click', updateProfileSubmitHandler);
    submitButton.dataset.listenerAttached = 'true';
}

// 注销：清除 localStorage 中的用户数据并重定向到登录页
function logout() {
    console.log('Logging out...');
    localStorage.removeItem('user'); // 清除存储的用户数据和 token
    // 根据需要清除其他相关的本地存储项
    window.location.href = '/book-management/login.html'; // 重定向到登录页面
}

// 关闭模态框 (如果您的HTML中包含模态框)
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 页面加载时初始化
window.addEventListener('load', () => {
    init();
    // 初始显示搜索所有书籍（如果搜索框为空）
    // 确保 search-input 元素存在且页面可见
    if (document.getElementById('search-input') && !document.getElementById('search-input').value) {
        fetchAllBooks();
    }
});