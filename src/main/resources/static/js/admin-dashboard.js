// 全局变量
const API_BASE_URL = '/book-management/api';
let currentUser = null; // 用于存储当前登录的用户信息 (管理员)
let currentUserId = null; // 用于存储当前登录用户的ID (管理员的ID)

// 获取请求头：包含 Content-Type 和 Authorization (Bearer Token)
function getAuthHeaders() {
    const userString = localStorage.getItem('user'); // 统一使用 'user' 存储
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
        console.warn('No authentication token found. User is not logged in or session expired.');
        // 管理员页面如果缺少token，应强制重定向
        window.location.href = '/book-management/login.html';
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// 初始化函数：页面加载时执行
function init() {
    checkAuth(); // 检查管理员认证状态
    setupEventListeners(); // 设置页面元素的事件监听器
}

// 检查认证状态：从 localStorage 获取用户信息并验证
function checkAuth() {
    console.log('Checking authentication...');
    const userString = localStorage.getItem('user'); // 统一使用 'user' 存储
    console.log('Raw user data from localStorage:', userString);

    if (!userString) {
        console.warn('No user data found in localStorage. Redirecting to login.');
        logout(); // 没有用户数据，视为未登录，直接注销并重定向
        return;
    }

    try {
        const userData = JSON.parse(userString);
        console.log('Parsed user data:', userData);

        // 确保从 localStorage 获取到的用户数据包含 token 和 userId，并且角色是管理员
        if (!userData || !userData.token || userData.userId === undefined || userData.userId === null || userData.role !== '管理员') { // 管理员角色为 '管理员'
            console.warn('Incomplete or unauthorized user data. Redirecting to login.');
            logout(); // 数据不完整或无权限，视为未登录
            return;
        }

        currentUserId = userData.userId; // 设置全局变量 currentUserId
        currentUser = userData; // 存储当前用户所有数据，包括 token 和 role
        console.log('Current admin userId:', currentUserId);

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

// 获取用户信息：通过 API 获取当前管理员的详细信息
async function getUserInfo(userId) {
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
    } catch (error) { //bug!!!!!!!!!!!!!!!!!!
        console.error('Error fetching user info:', error);
        alert(`无法加载用户信息: ${error.message}. 请重新登录`);
        logout(); // 无法获取用户信息，强制重新登录
        return false;
    }
}

// 更新管理员信息显示到页面上
function updateUserInfoDisplay(user) {
    console.log('Updating admin info display with:', user);
    if (!user) {
        console.error('No user data provided');
        return;
    }
    // 根据数据库表设计，管理员的用户名存储在 user_name 字段中
    const displayName = user.user_name || '管理员';
    const adminNameElement = document.getElementById('admin-name');
    if (adminNameElement) {
        adminNameElement.textContent = displayName;
        console.log('Updated admin name to:', displayName);
    } else {
        console.warn('Element with id "admin-name" not found.');
    }
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
            if (sectionId === 'book-management-section') {
                refreshBooks(); // 切换到图书管理时加载数据
            } else if (sectionId === 'user-management-section') {
                refreshUsers(); // 切换到用户管理时加载数据
            } else if (sectionId === 'borrow-records-section') {
                refreshAllBorrowRecords(); // 切换到借阅记录管理时加载数据
            }
        });
    });

    // 注销按钮：点击执行注销操作
    document.getElementById('logout-btn').addEventListener('click', logout);

    // 图书管理功能
    document.getElementById('add-book-btn').addEventListener('click', showAddBookModal);
    document.getElementById('book-search-input').addEventListener('input', searchBooks); // 修正ID
    document.getElementById('add-book-form').addEventListener('submit', addBook); // 确保绑定
    document.getElementById('edit-book-form').addEventListener('submit', editBookSubmitHandler); // 为编辑图书表单添加提交事件

    // 用户管理功能
    document.getElementById('user-search-input').addEventListener('input', searchUsers); // 修正ID
    document.getElementById('add-user-btn').addEventListener('click', showAddUserModal); // 假设有添加用户功能
    document.getElementById('add-user-form').addEventListener('submit', addUser); // 假设有添加用户表单
    document.getElementById('edit-user-form').addEventListener('submit', editUserSubmitHandler); // 为编辑用户表单添加提交事件

    // 借阅记录管理功能
    document.getElementById('record-search-input').addEventListener('input', searchBorrowRecords); // 修正ID
    document.getElementById('change-password-form').addEventListener('submit', changePassword); // 修改密码功能
}

// 搜索图书
async function searchBooks() {
    const query = document.getElementById('book-search-input').value.trim(); // 修正ID

    if (query.length === 0) {
        await refreshBooks(); // 如果搜索框为空，显示所有书籍
        return;
    }

    try {
        // API: GET /api/books/find/all?search={query}
        const response = await fetch(`${API_BASE_URL}/books/find/all?search=${encodeURIComponent(query)}`, {
            headers: getAuthHeaders()
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
        displayBooks(books);
    } catch (error) {
        console.error('Error during book search:', error);
        alert('Failed to complete book search, please try again later.');
    }
}

// 显示图书列表
function displayBooks(books) {
    const tableBody = document.querySelector('#books-table tbody');
    tableBody.innerHTML = '';

    if (!books || books.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No related books found.</td></tr>';
        return;
    }

    // 添加排序功能
    books.sort((a, b) => a.book_id - b.book_id);

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.book_id || 'N/A'}</td>
            <td>${book.title || 'N/A'}</td>
            <td>${book.author || 'N/A'}</td>
            <td>${book.isbn || 'N/A'}</td>
            <td>${book.available_quantity !== undefined ? book.available_quantity : 'N/A'}</td>
            <td>${book.status || 'N/A'}</td>
            <td>
                <button onclick="editBook(${book.book_id})">Edit</button>
                <button onclick="deleteBook(${book.book_id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 刷新图书列表
async function refreshBooks() {
    showLoading(true);
    try {
        // API: GET /api/books/find/all
        const response = await fetch(`${API_BASE_URL}/books/find/all`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error(`Failed to fetch book list: ${response.status} ${response.statusText}`);
        }

        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error('Error fetching book list:', error);
        alert('Failed to load book list, please refresh and try again.');
    } finally {
        showLoading(false);
    }
}

// 显示添加图书模态框
function showAddBookModal() {
    document.getElementById('add-book-modal').style.display = 'block';
    document.querySelector('#add-book-modal h3').textContent = 'Add New Book';
    document.getElementById('add-book-form').reset();
    // 清除错误提示
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

// 添加新书
async function addBook(event) {
    event.preventDefault();
    showLoading(true);

    // 清除所有错误消息
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const isbn = document.getElementById('book-isbn').value.trim();
    const quantity = document.getElementById('book-quantity').value.trim();

    let isValid = true;
    if (!title) {
        showError('book-title', 'Title cannot be empty');
        isValid = false;
    }
    if (!author) {
        showError('book-author', 'Author cannot be empty');
        isValid = false;
    }
    if (!isbn) {
        showError('book-isbn', 'ISBN cannot be empty');
        isValid = false;
    }
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        showError('book-quantity', 'Quantity must be a non-negative number');
        isValid = false;
    }

    if (!isValid) {
        showLoading(false);
        return;
    }

    const bookData = {
        title: title,
        author: author,
        isbn: isbn,
        available_quantity: parsedQuantity,
        status: '可用' // 默认新书状态为“可用”
    };

    try {
        // API: POST /api/books/add
        const response = await fetch(`${API_BASE_URL}/books/add`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bookData)
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || '添加图书失败');
        }

        alert('添加图书成功！');
        closeModal('add-book-modal');
        refreshBooks();
    } catch (error) {
        console.error('Error adding book:', error);
        alert(`添加图书失败： ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 编辑图书 (填充表单并显示模态框)
async function editBook(bookId) {
    showLoading(true);
    try {
        // 获取单个图书的API：GET /books/find/{id}
        const response = await fetch(`${API_BASE_URL}/books/find/${bookId}`, { // API: GET /api/books/find/{id}
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error(`Failed to fetch book for editing: ${response.status} ${response.statusText}`);
        }
        const book = await response.json();

        document.getElementById('edit-book-id').value = book.book_id;
        document.getElementById('edit-book-title').value = book.title;
        document.getElementById('edit-book-author').value = book.author;
        document.getElementById('edit-book-isbn').value = book.isbn;
        document.getElementById('edit-book-quantity').value = book.available_quantity;
        document.getElementById('edit-book-status').value = book.status;

        document.getElementById('edit-book-modal').style.display = 'block';
        document.querySelector('#edit-book-modal h3').textContent = 'Edit Book';
        // 清除错误提示
        document.querySelectorAll('.error-message').forEach(el => el.remove());

    } catch (error) {
        console.error('Error fetching book for edit:', error);
        alert(`Failed to load book data for editing: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 提交编辑图书表单
async function editBookSubmitHandler(event) {
    event.preventDefault();
    showLoading(true);

    // 清除所有错误消息
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    const bookId = document.getElementById('edit-book-id').value;
    const title = document.getElementById('edit-book-title').value.trim();
    const author = document.getElementById('edit-book-author').value.trim();
    const isbn = document.getElementById('edit-book-isbn').value.trim();
    const quantity = document.getElementById('edit-book-quantity').value.trim();
    const status = document.getElementById('edit-book-status').value;

    let isValid = true;
    if (!title) {
        showError('edit-book-title', 'Title cannot be empty');
        isValid = false;
    }
    if (!author) {
        showError('edit-book-author', 'Author cannot be empty');
        isValid = false;
    }
    if (!isbn) {
        showError('edit-book-isbn', 'ISBN cannot be empty');
        isValid = false;
    }
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        showError('edit-book-quantity', 'Quantity must be a non-negative number');
        isValid = false;
    }
    if (!status) {
        showError('edit-book-status', 'Status cannot be empty');
        isValid = false;
    }

    if (!isValid) {
        showLoading(false);
        return;
    }

    const updatedBookData = {
        book_id: parseInt(bookId),
        title: title,
        author: author,
        isbn: isbn,
        available_quantity: parsedQuantity,
        status: status
    };

    try {
        // API: PUT /api/books/update/{id}
        const response = await fetch(`${API_BASE_URL}/books/update/${bookId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedBookData)
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update book');
        }

        alert('图书更新成功！');
        closeModal('edit-book-modal');
        refreshBooks();
    } catch (error) {
        console.error('更新图书时出错:', error);
        alert(`更新图书失败：${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 删除图书
async function deleteBook(bookId) {
    if (!confirm('你确定要下架这本书嘛？')) {
        return;
    }
    showLoading(true);
    try {
        // API: DELETE /api/books/delete/{id}
        const response = await fetch(`${API_BASE_URL}/books/delete/${bookId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete book');
        }

        alert('图书下架成功！');
        refreshBooks();
    } catch (error) {
        console.error('Error deleting book:', error);
        alert(`Failed to delete book: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 搜索用户
async function searchUsers() {
    const query = document.getElementById('user-search-input').value.trim(); // 修正ID

    if (query.length === 0) {
        await refreshUsers(); // 如果搜索框为空，显示所有用户
        return;
    }

    try {
        // API: 搜索用户的API，GET /api/users/find/{name}
        const response = await fetch(`${API_BASE_URL}/users/get/find/${currentUser}`, { // GET /api/users/find/{name}
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error(`User search failed: ${response.status} ${response.statusText}`);
        }
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error during user search:', error);
        alert('Failed to complete user search, please try again later.');
    }
}

// 显示用户列表
function displayUsers(users) {
    const tableBody = document.querySelector('#users-table tbody');
    tableBody.innerHTML = '';

    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.userId || 'N/A'}</td>
            <td>${user.username || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.role || 'N/A'}</td>
            <td>${user.status || 'N/A'}</td>
            <td>
                <button onclick="editUser(${user.userId})">Edit</button>
                <button onclick="deleteUser(${user.userId})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 刷新用户列表
async function refreshUsers() {
    showLoading(true);
    try {
        // API: 获取所有用户的API，/api/users/find/all
        const response = await fetch(`${API_BASE_URL}/users/find/all`, { // GET /api/users/find/all
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error(`Failed to fetch user list: ${response.status} ${response.statusText}`);
        }

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error fetching user list:', error);
        alert('Failed to load user list, please refresh and try again.');
    } finally {
        showLoading(false);
    }
}

// 显示添加用户模态框 (假设有)
function showAddUserModal() {
    document.getElementById('add-user-modal').style.display = 'block';
    document.querySelector('#add-user-modal h3').textContent = 'Add New User';
    document.getElementById('add-user-form').reset();
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

// 添加新用户 (假设有)
async function addUser(event) {
    event.preventDefault();
    showLoading(true);
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    const username = document.getElementById('user-username').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value.trim();
    const role = document.getElementById('user-role').value;

    let isValid = true;
    if (!username) { showError('user-username', 'Username cannot be empty'); isValid = false; }
    if (!email) { showError('user-email', 'Email cannot be empty'); isValid = false; }
    if (!password) { showError('user-password', 'Password cannot be empty'); isValid = false; }
    if (!role) { showError('user-role', 'Role cannot be empty'); isValid = false; }

    if (!isValid) { showLoading(false); return; }

    const userData = { username, email, password, role : "普通用户" }; // 新用户默认“普通用户”

    try {
        // API: 假设 POST /api/users/add
        const response = await fetch(`${API_BASE_URL}/users/add`, { // POST  /api/users/add
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add user');
        }
        alert('User added successfully!');
        closeModal('add-user-modal');
        refreshUsers();
    } catch (error) {
        console.error('Error adding user:', error);
        alert(`Failed to add user: ${error.message}`);
    } finally {
        showLoading(false);
    }
}


// 编辑用户 (填充表单并显示模态框)
async function editUser(userId) {
    showLoading(true);
    try {
        // API: GET /api/users/update/{id}
        const response = await fetch(`${API_BASE_URL}/users/update/${userId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error(`Failed to fetch user for editing: ${response.status} ${response.statusText}`);
        }
        const user = await response.json();

        document.getElementById('edit-user-id').value = user.userId;
        document.getElementById('edit-user-username').value = user.username;
        document.getElementById('edit-user-email').value = user.email;
        document.getElementById('edit-user-role').value = user.role;
        document.getElementById('edit-user-status').value = user.status;

        document.getElementById('edit-user-modal').style.display = 'block';
        document.querySelector('#edit-user-modal h3').textContent = 'Edit User';
        document.querySelectorAll('.error-message').forEach(el => el.remove());

    } catch (error) {
        console.error('Error fetching user for edit:', error);
        alert(`Failed to load user data for editing: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 提交编辑用户表单 (假设有)
async function editUserSubmitHandler(event) {
    event.preventDefault();
    showLoading(true);
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    const userId = document.getElementById('edit-user-id').value;
    const username = document.getElementById('edit-user-username').value.trim();
    const email = document.getElementById('edit-user-email').value.trim();
    const role = document.getElementById('edit-user-role').value;
    const status = document.getElementById('edit-user-status').value;

    let isValid = true;
    if (!username) { showError('edit-user-username', 'Username cannot be empty'); isValid = false; }
    if (!email) { showError('edit-user-email', 'Email cannot be empty'); isValid = false; }
    if (!role) { showError('edit-user-role', 'Role cannot be empty'); isValid = false; }
    if (!status) { showError('edit-user-status', 'Status cannot be empty'); isValid = false; }

    if (!isValid) { showLoading(false); return; }

    const updatedUserData = {
        userId: parseInt(userId),
        username: username,
        email: email,
        role: role,
        // 不包括密码，密码修改应该有单独的接口
    };

    try {
        // API: PUT /api/users/update/{id}
        const response = await fetch(`${API_BASE_URL}/users/update/${currentUserId}`, { // PUT  /api/users/update/{id}
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedUserData)
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user');
        }
        alert('User updated successfully!');
        closeModal('edit-user-modal');
        refreshUsers();
    } catch (error) {
        console.error('Error updating user:', error);
        alert(`Failed to update user: ${error.message}`);
    } finally {
        showLoading(false);
    }
}


// 删除用户 (假设有)
async function deleteUser(userId) {
    if (!confirm('你确定删除这个用户嘛？')) {
        return;
    }
    showLoading(true);
    try {
        // API:  DELETE /api/users/delete/{id}
        const response = await fetch(`${API_BASE_URL}/users/delete/${userId}`, { // DELETE  /api/users/delete/{id}
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || '删除用户失败');
        }
        alert('删除用户成功！');
        refreshUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        alert(`删除用户失败： ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 搜索借阅记录
async function searchBorrowRecords() {
    const query = document.getElementById('record-search-input').value.trim(); // 修正ID

    if (query.length === 0) {
        await refreshAllBorrowRecords(); // 如果搜索框为空，显示所有记录
        return;
    }

    try {
        // API: 按 user_id, record_id 等搜索借阅记录
        // GET /api/records/get/find/{user_id}
        const response = await fetch(`${API_BASE_URL}/records/find/${currentUserId}`, { // GET  /api/records/get/find/{user_id}
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error(`Borrow record search failed: ${response.status} ${response.statusText}`);
        }
        const records = await response.json();
        displayBorrowRecords(records);
    } catch (error) {
        console.error('Error during borrow record search:', error);
        alert('Failed to complete borrow record search, please try again later.');
    }
}

// 显示借阅记录列表
function displayBorrowRecords(records) {
    const tableBody = document.querySelector('#borrow-records-table tbody');
    tableBody.innerHTML = '';

    if (!records || records.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No borrow records found.</td></tr>';
        return;
    }

    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.book_id || 'N/A'}</td>
            <td>${record.user_id || 'N/A'}</td>
            <td>${record.title || 'Unknown'}</td> <td>${new Date(record.borrowDate).toLocaleDateString()}</td>
            <td>${record.returnDate ? new Date(record.returnDate).toLocaleDateString() : 'N/A'}</td>
            <td>${record.status || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// 刷新所有借阅记录
async function refreshAllBorrowRecords() {
    showLoading(true);
    try {
        // API: 获取所有借阅记录的API，例如 /api/records/find/all
        const response = await fetch(`${API_BASE_URL}/records/find/all`, { // GET  /api/records/find/all
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized, please re-login.');
                logout();
                return;
            }
            throw new Error(`Failed to fetch all borrow records: ${response.status} ${response.statusText}`);
        }

        const records = await response.json();
        displayBorrowRecords(records);
    } catch (error) {
        console.error('Error fetching all borrow records:', error);
        alert('Failed to load borrow records, please refresh and try again.');
    } finally {
        showLoading(false);
    }
}


// 修改密码 (管理员修改自己的密码)
async function changePassword(event) {
    event.preventDefault();
    showLoading(true);
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    const currentPassword = document.getElementById('admin-current-password').value; // 修正ID
    const newPassword = document.getElementById('admin-new-password').value; // 修正ID
    const confirmPassword = document.getElementById('admin-confirm-password').value; // 修正ID

    if (newPassword !== confirmPassword) {
        showError('admin-confirm-password', 'New password and confirm password do not match.');
        showLoading(false);
        return;
    }

    if (newPassword.length < 5) {
        showError('admin-new-password', 'New password must be at least 5 characters long!');
        showLoading(false);
        return;
    }

    if (!currentUserId || !currentUser) {
        alert('User information not loaded, cannot change password. Please re-login.');
        showLoading(false);
        return;
    }

    try {
        // API: POST /api/users/changePassword
        const response = await fetch(`${API_BASE_URL}/users/changePassword`, { // POST /api/users/changePassword
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                userId: currentUserId,
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

        alert('密码修改成功！请通过您的新密码重新登录');
        logout(); // 密码修改成功后强制重新登录
        closeModal('change-password-modal'); // 如果有模态框，关闭它
    } catch (error) {
        console.error('Error changing password:', error);
        alert(`密码修改失败，请再次尝试：${error.message}`);
    } finally {
        showLoading(false);
    }
}


// 显示加载状态
function showLoading(show = true) {
    const loadingOverlay = document.getElementById('loading-overlay') || createLoadingOverlay();
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

// 创建加载覆盖层
function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'none';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    // 您需要确保您的CSS中定义了 .spinner 和 .spinner-border 样式
    spinner.innerHTML = `
        <div class="spinner-border text-light" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    `;

    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    return overlay;
}

// 显示错误消息
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Error element with ID "${elementId}" not found.`);
        return;
    }
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.color = 'red';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '5px';
    errorElement.textContent = message;

    // 移除旧的错误消息
    const oldError = element.parentElement.querySelector('.error-message');
    if (oldError) oldError.remove();

    element.parentElement.appendChild(errorElement);
}

// 关闭模态框 (如果您的HTML中包含模态框)
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
    // 隐藏错误消息
    document.querySelectorAll(`#${modalId} .error-message`).forEach(el => el.remove());
}


// 注销：清除 localStorage 中的用户数据并重定向到登录页
function logout() {
    console.log('Logging out...');
    localStorage.removeItem('user'); // 清除存储的用户数据和 token
    window.location.href = '/book-management/login.html'; // 重定向到登录页面
}

// 页面加载时初始化
window.addEventListener('load', () => {
    init();
    // 初始显示图书管理页面并加载所有书籍
    // 确保 DOM 元素存在且可见
    const bookManagementSection = document.getElementById('book-management-section');
    if (bookManagementSection) {
        // 激活侧边栏对应的项
        const sidebarItem = document.querySelector('.sidebar-nav li[data-section="book-management-section"]');
        if (sidebarItem) {
            sidebarItem.classList.add('active');
        }
        bookManagementSection.classList.add('active');
        refreshBooks();
    }
});

// Helper: Close modal when clicking outside of it (for all modals)
window.addEventListener('click', (event) => {
    const modals = ['add-book-modal', 'edit-book-modal', 'add-user-modal', 'edit-user-modal', 'change-password-modal']; // Add all your modal IDs here
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && event.target === modal) {
            closeModal(modalId);
        }
    });
});

// Helper: Close modal when escape key is pressed
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const modals = ['add-book-modal', 'edit-book-modal', 'add-user-modal', 'edit-user-modal', 'change-password-modal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && modal.style.display === 'block') {
                closeModal(modalId);
            }
        });
    }
});