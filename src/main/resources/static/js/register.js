// 输入验证函数
function validateInput(username, password, email) {
    if (!username || !password || !email) {
        alert('所有字段都必须填写！');
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
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        alert('请输入有效的邮箱地址！');
        return false;
    }
    return true;
}

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const email = document.getElementById('reg-email').value.trim();

    // 输入验证
    if (!validateInput(username, password, email)) {
        return;
    }

    try {
        const response = await fetch('/book-management/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: username,
                password: password,
                email: email,
                role: '普通用户'
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            alert('注册成功！请返回登录页面登录。');
            window.location.href = '/book-management/login.html';
        } else {
            // 显示后端返回的具体错误信息
            alert(`注册失败: ${result.message || '请检查输入信息'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`注册过程中发生错误: ${error.message}`);
    }
});
