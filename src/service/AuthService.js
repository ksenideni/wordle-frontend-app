import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

class AuthService {
  // Регистрация учителя
  static async registerTeacher(email, firstName, lastName, password) {
    const response = await axios.post(`${API_BASE_URL}/auth/register/teacher`, {
      email,
      firstName,
      lastName,
      password
    });
    return response.data;
  }

  // Регистрация студента
  static async registerStudent(firstName, lastName, login, password, classId) {
    const response = await axios.post(`${API_BASE_URL}/auth/register/student`, {
      firstName,
      lastName,
      login,
      password,
      classId
    });
    return response.data;
  }

  // Вход (универсальный для учителя и студента)
  static async login(username, password) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password
    });
    return response.data;
  }

  // Вход учителя (для обратной совместимости)
  static async loginTeacher(email, password) {
    return this.login(email, password);
  }

  // Вход студента (для обратной совместимости)
  static async loginStudent(login, password) {
    return this.login(login, password);
  }

  // Получить список классов для регистрации
  static async getPublicClasses() {
    const response = await axios.get(`${API_BASE_URL}/classes/public`);
    return response.data;
  }

  // Создать Basic Auth заголовок
  static createAuthHeader(username, password) {
    const credentials = btoa(`${username}:${password}`);
    return {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    };
  }

  // Сохранить данные пользователя в localStorage
  static saveUser(user, credentials) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('credentials', JSON.stringify(credentials));
  }

  // Получить данные пользователя из localStorage
  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Получить credentials из localStorage
  static getCredentials() {
    const credStr = localStorage.getItem('credentials');
    return credStr ? JSON.parse(credStr) : null;
  }

  // Получить заголовок авторизации для запросов
  static getAuthHeader() {
    const credentials = this.getCredentials();
    if (!credentials) return {};
    return this.createAuthHeader(credentials.username, credentials.password);
  }

  // Выход
  static logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('credentials');
  }

  // Проверить, авторизован ли пользователь
  static isAuthenticated() {
    return !!this.getUser();
  }
}

export default AuthService;

