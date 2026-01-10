import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../service/AuthService';
import ChallengeService from '../../service/ChallengeService';
import AttemptService from '../../service/AttemptService';
import Wordboard from '../game/wordboard/wordboard';
import KeyBoard from '../keyboard';
import Notification from '../common/Notification';
import { useDispatch, useSelector } from 'react-redux';
import { setChallenge, addAttempt, resetGame, addToBuffer, deleteFromBuffer } from '../../reducers/wordleSlice';
import './Student.css';

function StudentGame() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = AuthService.getUser();
  const [challenge, setChallengeState] = useState(null);
  const [currentWord, setCurrentWord] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [wordHint, setWordHint] = useState('');

  const buffer = useSelector(state => state.wordleGame.buffer);

  useEffect(() => {
    loadTodayChallenge();
  }, []);

  const loadTodayChallenge = async () => {
    try {
      setLoading(true);
      const challengeData = await ChallengeService.getTodayChallenge();
      setChallengeState(challengeData);
      
      // Инициализируем игру в Redux
      dispatch(resetGame());
      
      // Если есть попытки, добавляем их
      if (challengeData.attempts && challengeData.attempts.length > 0) {
        challengeData.attempts.forEach((attempt) => {
          const colors = attempt.result.positions.map((pos) => pos.color);
          dispatch(addAttempt({
            word: attempt.guessedWord || attempt.guessed_word,
            colors: colors
          }));
        });
      }

      // Проверяем, завершена ли игра
      const isCompleted = challengeData.isCompleted || challengeData.is_completed;
      setGameCompleted(isCompleted);
      
      // Показываем правильное слово ТОЛЬКО если игра завершена
      if (isCompleted && challengeData.word) {
        setCurrentWord(challengeData.word);
      } else {
        // Если игра не завершена, НЕ показываем правильное слово
        setCurrentWord('');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('На сегодня нет активного вызова. Обратитесь к учителю.');
      } else {
        setError('Ошибка при загрузке вызова');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWordSubmit = useCallback(async (word) => {
    // В Redux buffer - это строка, но из клавиатуры может прийти массив
    let wordString;
    if (typeof word === 'string') {
      wordString = word;
    } else if (Array.isArray(word)) {
      wordString = word.join('');
    } else {
      setError('Некорректный формат слова');
      return;
    }
    
    if (!wordString || wordString.length !== 5) {
      // Если букв меньше 5, показываем подсказку вместо ошибки
      if (wordString && wordString.length > 0 && wordString.length < 5) {
        setWordHint(`Недостаточно букв (${wordString.length}/5)`);
        setTimeout(() => {
          setWordHint('');
        }, 2000);
      } else {
        setError('Слово должно содержать 5 букв');
      }
      return;
    }

    if (gameCompleted) {
      setError('Вызов уже завершен');
      return;
    }

    if (!challenge) {
      return;
    }

    setSubmitting(true);
    setError('');
    setWordHint(''); // Очищаем подсказку при начале отправки корректного слова

    try {
      const attemptData = await AttemptService.makeAttempt(challenge.id, wordString.toUpperCase());
      
      // Добавляем попытку в Redux
      const colors = attemptData.result.positions.map((pos) => pos.color);
      const guessedWord = attemptData.guessedWord || attemptData.guessed_word;
      dispatch(addAttempt({
        word: guessedWord,
        colors: colors
      }));

      const isCorrect = attemptData.result.isCorrect !== undefined ? attemptData.result.isCorrect : attemptData.result.is_correct;
      const attemptNumber = attemptData.attemptNumber || attemptData.attempt_number;
      const remainingAttempts = attemptData.remainingAttempts !== undefined ? attemptData.remainingAttempts : attemptData.remaining_attempts;

      if (isCorrect) {
        setGameCompleted(true);
        // При правильном ответе показываем угаданное слово (оно и есть правильное)
        setCurrentWord(guessedWord);
        setChallengeState({
          ...challenge,
          isCompleted: true,
          is_completed: true,
          word: guessedWord,
          remainingAttempts: remainingAttempts,
          remaining_attempts: remainingAttempts
        });
        const attemptText = attemptNumber === 1 ? 'попытку' : 
                           attemptNumber < 5 ? 'попытки' : 'попыток';
        setNotification({
          show: true,
          message: `🎉 Поздравляем! Вы угадали слово "${guessedWord}" за ${attemptNumber} ${attemptText}! Получено очков: ${attemptData.points}`,
          type: 'success'
        });
        // Автоматически скрываем уведомление через 5 секунд
        setTimeout(() => {
          setNotification({ show: false, message: '', type: 'success' });
        }, 5000);
      } else if (remainingAttempts === 0) {
        setGameCompleted(true);
        // Загружаем вызов снова, чтобы получить правильное слово
        const updatedChallenge = await ChallengeService.getTodayChallenge();
        setCurrentWord(updatedChallenge.word);
        setChallengeState(updatedChallenge);
        setNotification({
          show: true,
          message: `Попытки закончились. Правильное слово: ${updatedChallenge.word}`,
          type: 'info'
        });
        // Автоматически скрываем уведомление через 5 секунд
        setTimeout(() => {
          setNotification({ show: false, message: '', type: 'info' });
        }, 5000);
      } else {
        setChallengeState({
          ...challenge,
          remainingAttempts: remainingAttempts,
          remaining_attempts: remainingAttempts
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при отправке попытки');
    } finally {
      setSubmitting(false);
    }
  }, [challenge, gameCompleted, dispatch]);

  // Обработка физической клавиатуры
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Игнорируем ввод, если игра завершена или происходит отправка
      if (gameCompleted || submitting || !challenge) {
        return;
      }

      // Игнорируем, если пользователь вводит текст в поле ввода
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = event.key;
      const keyLower = key.toLowerCase();
      const code = event.code || '';

      // Обработка Backspace/Delete (проверяем до обработки букв)
      // Проверяем как event.key, так и event.code для надежности
      const isBackspace = key === 'Backspace' || 
                         keyLower === 'backspace' || 
                         code === 'Backspace' || 
                         code === 'NumpadBackspace';
      const isDelete = key === 'Delete' || 
                      keyLower === 'delete' || 
                      code === 'Delete' || 
                      code === 'NumpadDelete';
      
      if ((isBackspace || isDelete)) {
        // Проверяем buffer.length после проверки клавиши, чтобы не блокировать событие зря
        if (buffer.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          dispatch(deleteFromBuffer());
        }
        return;
      }
      
      // Обработка Enter
      if (key === 'Enter' || keyLower === 'enter') {
        event.preventDefault();
        event.stopPropagation();
        
        if (buffer.length === 5) {
          // Слово полное - отправляем
          setWordHint(''); // Очищаем подсказку
          handleWordSubmit(buffer);
        } else if (buffer.length > 0 && buffer.length < 5) {
          // Букв мало - показываем подсказку
          setWordHint(`Недостаточно букв (${buffer.length}/5)`);
          // Автоматически скрываем подсказку через 2 секунды
          setTimeout(() => {
            setWordHint('');
          }, 2000);
        }
        return;
      }
      
      // Обработка букв (английские и русские)
      // В Redux buffer - это строка
      if (keyLower.match(/[а-яёa-z]/) && buffer.length < 5) {
        event.preventDefault();
        event.stopPropagation();
        dispatch(addToBuffer(key.toUpperCase()));
        // Очищаем подсказку при вводе новой буквы
        setWordHint('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [buffer, gameCompleted, submitting, challenge, dispatch, handleWordSubmit]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="student-game">
        <div className="loading">Загрузка вызова...</div>
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="student-game">
        <header className="game-header">
          <h1>Wordle для студентов</h1>
          <div className="user-info">
            <span>{user?.firstName || user?.first_name} {user?.lastName || user?.last_name}</span>
            <button onClick={handleLogout} className="logout-button">Выйти</button>
          </div>
        </header>
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/student/ranking')} className="nav-button">
            Посмотреть рейтинг
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-game">
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ show: false, message: '', type: 'success' })}
      />
      <header className="game-header">
        <h1>Wordle для студентов</h1>
        <div className="user-info">
          <span>{user?.firstName || user?.first_name} {user?.lastName || user?.last_name}</span>
          <div className="header-buttons">
            <button onClick={() => navigate('/student/ranking')} className="nav-button">
              Рейтинг
            </button>
            <button onClick={handleLogout} className="logout-button">Выйти</button>
          </div>
        </div>
      </header>

      <div className="game-info">
        {challenge && (
          <>
            <div className="info-item">
              <strong>Осталось попыток:</strong> {challenge.remainingAttempts !== undefined ? challenge.remainingAttempts : (challenge.remaining_attempts || 0)}
            </div>
            {gameCompleted && currentWord && (
              <div className="completed-word">
                <strong>Правильное слово:</strong> {currentWord}
              </div>
            )}
          </>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="game-container">
        <Wordboard />
        {wordHint && <div className="word-hint">{wordHint}</div>}
        <div className="keyboard-wrapper">
          <KeyBoard onSubmitWord={handleWordSubmit} disabled={submitting || gameCompleted} />
        </div>
      </div>
    </div>
  );
}

export default StudentGame;

