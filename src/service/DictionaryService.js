import axios from 'axios';
import AuthService from './AuthService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

class DictionaryService {
  // Создать словарь
  static async createDictionary(name, theme, words) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.post(
      `${API_BASE_URL}/dictionaries`,
      { name, theme, words },
      authHeader
    );
    return response.data;
  }

  // Получить список словарей
  static async getDictionaries(theme = null, global = null) {
    const authHeader = AuthService.getAuthHeader();
    const params = {};
    if (theme) params.theme = theme;
    if (global !== null) params.global = global;
    
    const response = await axios.get(
      `${API_BASE_URL}/dictionaries`,
      { ...authHeader, params }
    );
    return response.data;
  }

  // Получить словарь с словами
  static async getDictionary(dictionaryId) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.get(
      `${API_BASE_URL}/dictionaries/${dictionaryId}`,
      authHeader
    );
    return response.data;
  }

  // Добавить слова в словарь
  static async addWords(dictionaryId, words) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.post(
      `${API_BASE_URL}/dictionaries/${dictionaryId}/words`,
      { words },
      authHeader
    );
    return response.data;
  }

  // Удалить слова из словаря
  static async removeWords(dictionaryId, words) {
    const authHeader = AuthService.getAuthHeader();
    const response = await axios.delete(
      `${API_BASE_URL}/dictionaries/${dictionaryId}/words`,
      { ...authHeader, data: { words } }
    );
    return response.data;
  }

  // Удалить словарь
  static async deleteDictionary(dictionaryId) {
    const authHeader = AuthService.getAuthHeader();
    if (!authHeader || !authHeader.headers) {
      throw new Error('Authentication required');
    }
    await axios.delete(
      `${API_BASE_URL}/dictionaries/${dictionaryId}`,
      {
        headers: authHeader.headers
      }
    );
  }
}

export default DictionaryService;

