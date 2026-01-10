import axios from 'axios';
import AuthService from './AuthService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

class AttemptService {
  // Сделать попытку угадать слово
  static async makeAttempt(challengeId, guessedWord) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.post(
      `${API_BASE_URL}/attempts`,
      {
        challengeId,
        guessedWord
      },
      authHeader
    );
    return response.data;
  }

  // Получить попытки для вызова
  static async getAttempts(challengeId) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.get(
      `${API_BASE_URL}/attempts/challenge/${challengeId}`,
      authHeader
    );
    return response.data;
  }

  // Старые методы для обратной совместимости (используются в wordleSlice)
  static async postAttempt(word) {
    // Этот метод больше не используется в новом API
    // Оставлен для обратной совместимости
    console.warn('postAttempt is deprecated. Use makeAttempt instead.');
    throw new Error('This method is deprecated. Please use makeAttempt with challengeId.');
  }
}

export default AttemptService;
