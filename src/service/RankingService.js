import axios from 'axios';
import AuthService from './AuthService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

class RankingService {
  // Получить рейтинг класса
  static async getClassRanking(classId, period = 'all') {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.get(
      `${API_BASE_URL}/rankings/class/${classId}`,
      { ...authHeader, params: { period } }
    );
    return response.data;
  }

  // Получить глобальный рейтинг
  static async getGlobalRanking(limit = 100) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.get(
      `${API_BASE_URL}/rankings/global`,
      { ...authHeader, params: { limit } }
    );
    return response.data;
  }

  // Получить статистику пользователя
  static async getUserStats(userId) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.get(
      `${API_BASE_URL}/rankings/user/${userId}`,
      authHeader
    );
    return response.data;
  }

  // Получить свою статистику
  static async getMyStats() {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.get(
      `${API_BASE_URL}/rankings/me`,
      authHeader
    );
    return response.data;
  }

  // Получить график стриков
  static async getStreaks(days = 30) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.get(
      `${API_BASE_URL}/rankings/me/streaks`,
      { ...authHeader, params: { days } }
    );
    return response.data;
  }
}

export default RankingService;

