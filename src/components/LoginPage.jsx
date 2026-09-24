import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoginMessage('Пожалуйста, введите корректный email');
      return;
    }
    if (!password) {
      setLoginMessage('Пожалуйста, укажите пароль');
      return;
    }

    try {
      const response = await fetch('/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        setLoginMessage('Успешный вход!');

        const userData = result.user;
        const userForStorage = {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          role: userData.role || 'user',
          city: userData.city || null,
          interests: userData.interests || null,
          is_premium: userData.is_premium === true || userData.is_premium === 1 ? 1 : 0,
          birth_date: userData.birth_date || null,
          tariff_level: userData.tariff_level || 0,   // ✅ ДОБАВИЛИ
        };

        localStorage.setItem('currentUser', JSON.stringify(userForStorage));

       
        const role = userForStorage.role;
        if (role === 'developer') {
          navigate('/developer');
        } else if (role === 'support') {
          navigate('/support');
        } else {
          navigate(`/profile/${email}`);
        }
      } else {
        setLoginMessage(result.message || 'Ошибка входа: неверный email или пароль');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      setLoginMessage('Не удалось подключиться к серверу. Проверьте, запущен ли Apache.');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <h2>Вход на сайт</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {loginMessage && <p className="error-message">{loginMessage}</p>}
          <button type="submit" className="login-btn">Войти</button>
        </form>
        <p className="register-link">
          Нет аккаунта? <Link to="/registration">Зарегистрируйтесь</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;