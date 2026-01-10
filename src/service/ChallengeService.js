import axios from 'axios';
import AuthService from './AuthService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

class ChallengeService {
  // Получить вызов на сегодня (для студента)
  static async getTodayChallenge() {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.get(
      `${API_BASE_URL}/challenges/today`,
      authHeader
    );
    return response.data;
  }

  // Создать вызов для класса (учитель)
  static async createClassChallenge(classId, date = null, dictionaryId = null, word = null) {
    const authHeader = AuthService.getAuthHeader();
    const body = {};
    if (date) body.date = date;
    if (dictionaryId) body.dictionaryId = dictionaryId;
    if (word) body.word = word;
    
    const response = await axios.post(
      `${API_BASE_URL}/challenges/class/${classId}`,
      body,
      authHeader
    );
    return response.data;
  }

  // Создать индивидуальный вызов для студента (учитель)
  static async createStudentChallenge(studentId, date = null, dictionaryId = null, word = null) {
    const authHeader = AuthService.getAuthHeader();
    const body = {};
    if (date) body.date = date;
    if (dictionaryId) body.dictionaryId = dictionaryId;
    if (word) body.word = word;
    
    const response = await axios.post(
      `${API_BASE_URL}/challenges/student/${studentId}`,
      body,
      authHeader
    );
    return response.data;
  }

  // Создать индивидуальные вызовы для всех студентов класса (учитель)
  static async createIndividualChallenges(classId, date = null, dictionaryId = null) {
    const authHeader = AuthService.getAuthHeader();
    const body = {};
    if (date) body.date = date;
    if (dictionaryId) body.dictionaryId = dictionaryId;
    
    const response = await axios.post(
      `${API_BASE_URL}/challenges/class/${classId}/individual`,
      body,
      authHeader
    );
    return response.data;
  }

  // Получить историю вызовов
  static async getHistory(startDate = null, endDate = null, limit = 30) {
    const authHeader = AuthService.getAuthHeader();
    const params = { limit };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axios.get(
      `${API_BASE_URL}/challenges/history`,
      { ...authHeader, params }
    );
    return response.data;
  }
}

export default ChallengeService;

