import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../service/AuthService';
import './Teacher.css';

function TeacherDashboard() {
  const navigate = useNavigate();
  const user = AuthService.getUser();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <h1>Панель учителя</h1>
        <div className="user-info">
          <span>{user?.firstName || user?.first_name} {user?.lastName || user?.last_name}</span>
          <button onClick={handleLogout} className="logout-button">Выйти</button>
        </div>
      </header>
      <nav className="dashboard-nav">
        <button onClick={() => navigate('/teacher/classes')} className="nav-button">
          Управление классами
        </button>
        <button onClick={() => navigate('/teacher/dictionaries')} className="nav-button">
          Управление словарями
        </button>
        <button onClick={() => navigate('/teacher/challenges')} className="nav-button">
          Создание вызовов
        </button>
      </nav>
    </div>
  );
}

export default TeacherDashboard;

