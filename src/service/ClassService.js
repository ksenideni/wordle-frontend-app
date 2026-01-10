import axios from 'axios';
import AuthService from './AuthService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

class ClassService {
  // Создать класс
  static async createClass(name) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.post(
      `${API_BASE_URL}/classes`,
      { name },
      authHeader
    );
    return response.data;
  }

  // Получить список классов учителя
  static async getClasses() {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.get(
      `${API_BASE_URL}/classes`,
      authHeader
    );
    return response.data;
  }

  // Получить информацию о классе
  static async getClass(classId) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.get(
      `${API_BASE_URL}/classes/${classId}`,
      authHeader
    );
    return response.data;
  }

  // Обновить класс
  static async updateClass(classId, name) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.put(
      `${API_BASE_URL}/classes/${classId}`,
      { name },
      authHeader
    );
    return response.data;
  }

  // Удалить класс
  static async deleteClass(classId) {
    const authHeader = AuthService.getAuthHeader();
    await axios.delete(
      `${API_BASE_URL}/classes/${classId}`,
      authHeader
    );
  }

  // Регенерировать код приглашения
  static async regenerateInvitationCode(classId) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.post(
      `${API_BASE_URL}/classes/${classId}/regenerate-code`,
      {},
      authHeader
    );
    return response.data;
  }

  // Получить список студентов класса
  static async getClassStudents(classId) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.get(
      `${API_BASE_URL}/classes/${classId}/students`,
      authHeader
    );
    return response.data;
  }

  // Удалить студента из класса
  static async removeStudent(classId, studentId) {
    const authHeader = AuthService.getAuthHeader();
    await axios.delete(
      `${API_BASE_URL}/classes/${classId}/students/${studentId}`,
      authHeader
    );
  }
}

export default ClassService;

