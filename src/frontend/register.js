/**
 * 注册页面逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const strengthBar = document.querySelector('.strength-bar');
  const strengthText = document.querySelector('.strength-text');

  // 检查是否已登录
  if (authService.isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  // 密码强度检查
  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const strength = checkPasswordStrength(password);
    updateStrengthIndicator(strength);
  });

  // 表单提交
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 验证输入
    if (!name || !email || !password || !confirmPassword) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    // 验证密码匹配
    if (password !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    // 验证密码强度
    const strength = checkPasswordStrength(password);
    if (strength.score < 3) {
      showNotification('Password is too weak. Please use a stronger password.', 'error');
      return;
    }

    // 禁用按钮
    const submitButton = registerForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';

    try {
      const result = await authService.register(email, password, name);

      if (result.success) {
        showNotification('Registration successful!', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        showNotification(result.message || 'Registration failed', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Register';
      }
    } catch (error) {
      showNotification('An error occurred. Please try again.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = 'Register';
    }
  });

  // 检查密码强度
  function checkPasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    return {
      score,
      max: 6
    };
  }

  // 更新强度指示器
  function updateStrengthIndicator(strength) {
    const percentage = (strength.score / strength.max) * 100;
    strengthBar.style.width = `${percentage}%`;

    if (strength.score <= 2) {
      strengthBar.style.backgroundColor = '#ff4444';
      strengthText.textContent = 'Weak';
    } else if (strength.score <= 4) {
      strengthBar.style.backgroundColor = '#ffbb33';
      strengthText.textContent = 'Medium';
    } else {
      strengthBar.style.backgroundColor = '#00C851';
      strengthText.textContent = 'Strong';
    }
  }

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
