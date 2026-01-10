import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../service/AuthService';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  // Если пользователь уже авторизован, перенаправляем на соответствующий дашборд
  React.useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'student') {
        navigate('/student/game');
      }
    }
  }, [user, navigate]);

  if (user) {
    return <div className="loading">Перенаправление...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Wordle Educational Platform</h1>
        <p className="home-subtitle">Образовательная платформа для изучения английского языка</p>

        <div className="home-actions">
          <div className="action-card">
            <h2>Я учитель</h2>
            <div className="action-buttons">
              <button onClick={() => navigate('/register/teacher')} className="action-button primary">
                Зарегистрироваться
              </button>
              <button onClick={() => navigate('/login/teacher')} className="action-button secondary">
                Войти
              </button>
            </div>
          </div>

          <div className="action-card">
            <h2>Я студент</h2>
            <div className="action-buttons">
              <button onClick={() => navigate('/register/student')} className="action-button primary">
                Зарегистрироваться
              </button>
              <button onClick={() => navigate('/login/student')} className="action-button secondary">
                Войти
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

