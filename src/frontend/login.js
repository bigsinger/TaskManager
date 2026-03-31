/**
 * 登录页面逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // 检查是否已登录
  if (authService.isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  // 表单提交
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // 验证输入
    if (!email || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    // 禁用按钮
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    try {
      const result = await authService.login(email, password);

      if (result.success) {
        showNotification('Login successful!', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        showNotification(result.message || 'Login failed', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      }
    } catch (error) {
      showNotification('An error occurred. Please try again.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = 'Login';
    }
  });

  // 显示通知
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
});
