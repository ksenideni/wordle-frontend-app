import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../service/AuthService';
import ClassManagement from './ClassManagement';
import DictionaryManagement from './DictionaryManagement';
import ChallengeCreation from './ChallengeCreation';
import './Teacher.css';

function TeacherDashboard() {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const [activeTab, setActiveTab] = useState('classes'); // По умолчанию первая вкладка

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  const tabs = [
    { id: 'classes', label: 'Управление классами' },
    { id: 'dictionaries', label: 'Управление словарями' },
    { id: 'challenges', label: 'Создание вызовов' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'classes':
        return <ClassManagement />;
      case 'dictionaries':
        return <DictionaryManagement />;
      case 'challenges':
        return <ChallengeCreation />;
      default:
        return <ClassManagement />;
    }
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
      <nav className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default TeacherDashboard;

