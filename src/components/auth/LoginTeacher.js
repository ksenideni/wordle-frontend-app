import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../service/AuthService';
import './Auth.css';

function LoginTeacher() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await AuthService.loginTeacher(
        formData.email,
        formData.password
      );
      
      // Сохраняем данные пользователя
      // Для Basic Auth используем email для учителей, login для студентов
      const username = user.email || user.login;
      AuthService.saveUser(user, {
        username: username,
        password: formData.password
      });

      // Перенаправляем в зависимости от роли
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/game');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Вход для учителя</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p className="auth-link">
          Нет аккаунта? <a href="/register/teacher">Зарегистрироваться</a>
        </p>
      </div>
    </div>
  );
}

export default LoginTeacher;

