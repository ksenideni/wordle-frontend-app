import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../service/AuthService';
import RankingService from '../../service/RankingService';
import './Student.css';

function StreakCalendar({ streakHistory }) {
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Создаем Map для быстрого доступа к данным по дате
  const historyMap = useMemo(() => {
    const map = new Map();
    streakHistory.forEach(day => {
      map.set(day.date, day.completed);
    });
    return map;
  }, [streakHistory]);

  // Формируем календарную сетку (ровно 5 недель = 35 дней, включая текущую неделю)
  const calendarGrid = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    
    // Определяем день недели сегодня (0 = воскресенье, 1 = понедельник, ...)
    let dayOfWeek = today.getDay();
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Преобразуем: вс=0 -> вс=6, пн=1 -> пн=0
    
    // Находим понедельник текущей недели
    const thisWeekMonday = new Date(today);
    thisWeekMonday.setDate(today.getDate() - dayOfWeek);
    thisWeekMonday.setHours(0, 0, 0, 0);
    
    // Вычисляем понедельник, который будет началом календаря (5 недель назад от текущей недели)
    const calendarStartMonday = new Date(thisWeekMonday);
    calendarStartMonday.setDate(thisWeekMonday.getDate() - 28); // 28 дней = 4 полные недели назад
    calendarStartMonday.setHours(0, 0, 0, 0);
    
    // Добавляем ровно 35 дней (5 недель × 7 дней = 35 дней)
    // От понедельника 5-й недели назад до воскресенья текущей недели включительно
    for (let i = 0; i < 35; i++) {
      const date = new Date(calendarStartMonday);
      date.setDate(calendarStartMonday.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      // Проверяем, находится ли этот день в диапазоне последних 35 дней от сегодня
      // (показываем только дни до сегодня включительно)
      if (date > today) {
        // День еще не наступил - показываем как пустой
        days.push({ date: null, completed: false, isEmpty: true });
      } else {
        // Форматируем дату в YYYY-MM-DD с учетом локального времени
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const completed = historyMap.get(dateStr) || false;
        days.push({ date: date, dateStr: dateStr, completed: completed, isEmpty: false });
      }
    }
    
    return days;
  }, [historyMap]);

  // Группируем дни по неделям
  const weeks = useMemo(() => {
    const weeksArray = [];
    for (let i = 0; i < calendarGrid.length; i += 7) {
      weeksArray.push(calendarGrid.slice(i, i + 7));
    }
    return weeksArray;
  }, [calendarGrid]);

  const formatDay = (date) => {
    if (!date) return '';
    return date.getDate();
  };

  const formatTooltip = (day) => {
    if (day.isEmpty) return '';
    const dateStr = day.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    return day.completed ? `${dateStr} - Участвовал` : `${dateStr} - Не участвовал`;
  };

  return (
    <div className="streak-calendar-wrapper">
      <div className="calendar-container">
        <div className="calendar-header-row">
          <div className="week-day-spacer"></div>
          <div className="week-days-row">
            {weekDays.map(day => (
              <div key={day} className="week-day-header">{day}</div>
            ))}
          </div>
        </div>
        <div className="calendar-grid-container">
          <div className="calendar-weeks-column">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="week-number"></div>
            ))}
          </div>
          <div className="calendar-grid">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="calendar-week">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`calendar-day ${day.isEmpty ? 'empty' : ''} ${day.completed ? 'completed' : 'missed'}`}
                    title={formatTooltip(day)}
                  >
                    {!day.isEmpty && <span className="day-number">{formatDay(day.date)}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color completed"></div>
          <span>Участвовал</span>
        </div>
        <div className="legend-item">
          <div className="legend-color missed"></div>
          <span>Не участвовал</span>
        </div>
      </div>
    </div>
  );
}

function StudentRanking() {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const [myStats, setMyStats] = useState(null);
  const [classRanking, setClassRanking] = useState([]);
  const [globalRanking, setGlobalRanking] = useState([]);
  const [streaks, setStreaks] = useState(null);
  const [activeTab, setActiveTab] = useState('my-stats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем свою статистику
      const stats = await RankingService.getMyStats();
      setMyStats(stats);

      // Загружаем рейтинг класса
      const classId = user?.classId;
      if (classId) {
        const classRank = await RankingService.getClassRanking(classId);
        setClassRanking(classRank.rankings || []);
      }

      // Загружаем глобальный рейтинг
      const globalRank = await RankingService.getGlobalRanking(50);
      setGlobalRanking(globalRank.rankings || []);

      // Загружаем стрики (35 дней для заполнения всех клеток календаря)
      const streaksData = await RankingService.getStreaks(35);
      setStreaks(streaksData);
    } catch (err) {
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="student-ranking">
        <div className="loading">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="student-ranking">
      <header className="game-header">
        <h1>Рейтинг и статистика</h1>
        <div className="user-info">
          <span>{user?.firstName} {user?.lastName}</span>
          <div className="header-buttons">
            <button onClick={() => navigate('/student/game')} className="nav-button">
              Игра
            </button>
            <button onClick={handleLogout} className="logout-button">Выйти</button>
          </div>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="ranking-tabs">
        <button
          className={activeTab === 'my-stats' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('my-stats')}
        >
          Моя статистика
        </button>
        <button
          className={activeTab === 'class' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('class')}
        >
          Рейтинг класса
        </button>
        <button
          className={activeTab === 'global' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('global')}
        >
          Глобальный рейтинг
        </button>
        <button
          className={activeTab === 'streaks' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('streaks')}
        >
          Стрики
        </button>
      </div>

      <div className="ranking-content">
        {activeTab === 'my-stats' && myStats && (
          <div className="stats-card">
            <h2>Моя статистика</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Всего очков</div>
                <div className="stat-value">{myStats.totalPoints || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Очки за сегодня</div>
                <div className="stat-value">{myStats.dailyPoints || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Текущий стрик</div>
                <div className="stat-value">{myStats.currentStreak || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Лучший стрик</div>
                <div className="stat-value">{myStats.longestStreak || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Место в классе</div>
                <div className="stat-value">#{myStats.classRank || '-'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Глобальное место</div>
                <div className="stat-value">#{myStats.globalRank || '-'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Всего вызовов</div>
                <div className="stat-value">{myStats.totalChallenges || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Завершено</div>
                <div className="stat-value">{myStats.completedChallenges || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Среднее попыток</div>
                <div className="stat-value">{(myStats.averageAttempts || 0).toFixed(1) || '-'}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'class' && (
          <div className="ranking-card">
            <h2>Рейтинг класса</h2>
            <div className="ranking-list">
              {classRanking.length === 0 ? (
                <div className="empty-message">Нет данных для отображения</div>
              ) : (
                classRanking.map((student, index) => (
                  <div key={student.userId} className="ranking-item">
                    <div className="rank-number">#{student.classRank || index + 1}</div>
                    <div className="rank-info">
                      <div className="rank-name">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="rank-details">
                        <span>Очков: {student.totalPoints || 0}</span>
                        <span>Стрик: {student.currentStreak || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'global' && (
          <div className="ranking-card">
            <h2>Глобальный рейтинг</h2>
            <div className="ranking-list">
              {globalRanking.length === 0 ? (
                <div className="empty-message">Нет данных для отображения</div>
              ) : (
                globalRanking.map((player, index) => (
                  <div key={player.userId} className="ranking-item">
                    <div className="rank-number">#{player.globalRank || index + 1}</div>
                    <div className="rank-info">
                      <div className="rank-name">
                        {player.firstName} {player.lastName}
                      </div>
                      <div className="rank-details">
                        <span>Очков: {player.totalPoints || 0}</span>
                        <span>Класс: {player.className || '-'}</span>
                        <span>Стрик: {player.currentStreak || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'streaks' && streaks && (
          <div className="streaks-card">
            <h2>История стриков</h2>
            <div className="streaks-info">
              <div className="streak-stat">
                <div className="streak-label">Текущий стрик</div>
                <div className="streak-value">{streaks.currentStreak || 0}</div>
              </div>
              <div className="streak-stat">
                <div className="streak-label">Лучший стрик</div>
                <div className="streak-value">{streaks.longestStreak || 0}</div>
              </div>
            </div>
            <StreakCalendar streakHistory={streaks.streakHistory || []} />
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentRanking;

