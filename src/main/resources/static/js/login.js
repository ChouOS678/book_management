// 登录输入验证
function validateLoginInput(username, password) {
    if (!username || !password) {
        alert('用户名和密码必须填写！');
        return false;
    }
    if (username.length < 4 || username.length > 20) {
        alert('用户名长度必须在4-20个字符之间！');
        return false;
    }
    if (password.length < 5) {
        alert('密码长度必须至少5个字符！');
        return false;
    }
    return true;
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // 输入验证
    if (!validateLoginInput(username, password)) {
        return;
    }

    try {
        const response = await fetch('/book-management/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                role: document.querySelector('input[name="role"]:checked').value
            })
        });

        console.log('Login response status:', response.status);
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText);
                throw new Error(errorData.message || '登录失败');
            } catch (e) {
                // 如果responseText不是有效的JSON，直接使用它作为错误信息
                throw new Error(`服务器返回错误: ${response.status} ${response.statusText}\n${responseText}`);
            }
        }

        const data = JSON.parse(responseText); // 解析后端返回的 LoginResponse 对象

        // 登录成功处理
        if (response.ok) {
            console.log('Login response data:', data);

            // *** 新增：存储 token ***
            if (data.token) {
                localStorage.setItem('authToken', data.token); // 将 token 存储在 localStorage
                console.log('Token stored:', data.token);
            } else {
                console.warn('登录成功但未在响应中找到 token。');
            }

            // 存储用户数据
            try {
                // 包含user对象
                const userData = {
                    userId: data.user.userId,
                    username: data.user.userName, // 注意这里是userName而不是username
                    role: data.user.role,
                    token: data.token // 存储token
                };

                console.log('Storing user data:', userData);
                localStorage.setItem('user', JSON.stringify(userData));

                console.log('Redirecting to dashboard...');
                // 根据后端返回的角色进行页面跳转
                window.location.href = userData.role === '管理员'
                    ? '/book-management/admin-dashboard.html'
                    : '/book-management/user-dashboard.html';

            } catch (error) {
                console.error('用户数据保存失败:', error);
                alert('登录状态保存失败，请重试');
            }
        } else {
            // 理论上这里不会执行，因为 !response.ok 已经在前面处理了
            alert(`登录失败: ${data.message || '请检查用户名和密码'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`登录过程中发生错误: ${error.message}`);
    }
});