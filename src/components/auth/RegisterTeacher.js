import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../service/AuthService';
import './Auth.css';

function RegisterTeacher() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.registerTeacher(
        formData.email,
        formData.firstName,
        formData.lastName,
        formData.password
      );
      
      console.log('User registered:', user); // Для отладки
      
      // Сохраняем данные пользователя
      AuthService.saveUser(user, {
        username: formData.email,
        password: formData.password
      });

      // Перенаправляем в зависимости от роли
      // Проверяем роль в разных форматах для совместимости
      const role = user.role?.toLowerCase() || '';
      if (role === 'teacher' || role === 'role_teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/game');
      }
    } catch (err) {
      console.error('Registration error:', err); // Для отладки
      setError(err.response?.data?.message || err.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Регистрация учителя</h2>
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
            <label>Имя:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Фамилия:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
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
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Подтвердите пароль:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="auth-link">
          Уже есть аккаунт? <a href="/login/teacher">Войти</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterTeacher;

