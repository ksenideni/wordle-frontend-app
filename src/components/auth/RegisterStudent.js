import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../service/AuthService';
import './Auth.css';

function RegisterStudent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    login: '',
    password: '',
    confirmPassword: '',
    classId: ''
  });
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await AuthService.getPublicClasses();
      setClasses(data.classes || []);
    } catch (err) {
      setError('Ошибка при загрузке классов');
    } finally {
      setLoadingClasses(false);
    }
  };

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

    if (!formData.classId) {
      setError('Выберите класс');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.registerStudent(
        formData.firstName,
        formData.lastName,
        formData.login,
        formData.password,
        parseInt(formData.classId)
      );
      
      console.log('User registered:', user); // Для отладки
      
      // Сохраняем данные пользователя
      // Для Basic Auth используем email для учителей, login для студентов
      const username = user.email || user.login;
      AuthService.saveUser(user, {
        username: username,
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
        <h2>Регистрация студента</h2>
        <form onSubmit={handleSubmit}>
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
            <label>Логин:</label>
            <input
              type="text"
              name="login"
              value={formData.login}
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
          <div className="form-group">
            <label>Класс:</label>
            {loadingClasses ? (
              <div>Загрузка классов...</div>
            ) : (
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
              >
                <option value="">Выберите класс</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.teacherName || cls.teacher_name || 'Учитель'})
                  </option>
                ))}
              </select>
            )}
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="auth-link">
          Уже есть аккаунт? <a href="/login/student">Войти</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterStudent;

