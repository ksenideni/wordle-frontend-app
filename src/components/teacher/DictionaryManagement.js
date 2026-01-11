import React, { useState, useEffect, useRef } from 'react';
import DictionaryService from '../../service/DictionaryService';
import ConfirmDialog from '../common/ConfirmDialog';
import './Teacher.css';

function DictionaryManagement() {
  const [dictionaries, setDictionaries] = useState([]);
  const [selectedDictionary, setSelectedDictionary] = useState(null);
  const [selectedDictionaryId, setSelectedDictionaryId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    theme: '',
    words: ''
  });
  const [newWords, setNewWords] = useState('');
  const [wordsToRemove, setWordsToRemove] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dictionaryToDelete, setDictionaryToDelete] = useState(null);
  const currentRequestRef = useRef(null);

  useEffect(() => {
    loadDictionaries();
  }, []);

  useEffect(() => {
    if (selectedDictionaryId) {
      loadDictionaryDetails(selectedDictionaryId);
    } else {
      setSelectedDictionary(null);
      currentRequestRef.current = null;
    }
  }, [selectedDictionaryId]);

  const loadDictionaries = async () => {
    try {
      const data = await DictionaryService.getDictionaries();
      setDictionaries(data.dictionaries || []);
    } catch (err) {
      setError('Ошибка при загрузке словарей');
    }
  };

  const loadDictionaryDetails = async (dictionaryId) => {
    currentRequestRef.current = dictionaryId;
    try {
      setSelectedDictionary(null); // Показываем состояние загрузки
      const data = await DictionaryService.getDictionary(dictionaryId);
      // Обновляем только если запрос все еще актуален
      if (currentRequestRef.current === dictionaryId) {
        setSelectedDictionary(data);
      }
    } catch (err) {
      setError('Ошибка при загрузке словаря');
      if (currentRequestRef.current === dictionaryId) {
        setSelectedDictionary(null);
        setSelectedDictionaryId(null);
      }
    }
  };

  const handleCreateDictionary = async (e) => {
    e.preventDefault();
    setError('');
    
    const wordsArray = formData.words
      .split(',')
      .map((w) => w.trim().toUpperCase())
      .filter((w) => w.length === 5);

    if (wordsArray.length === 0) {
      setError('Добавьте хотя бы одно слово из 5 букв');
      return;
    }

    setLoading(true);
    try {
      await DictionaryService.createDictionary(formData.name, formData.theme, wordsArray);
      await loadDictionaries();
      setShowCreateForm(false);
      setFormData({ name: '', theme: '', words: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании словаря');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWords = async () => {
    if (!selectedDictionary?.id) return;
    
    const newWordsArray = newWords
      .split(',')
      .map((w) => w.trim().toUpperCase())
      .filter((w) => w.length === 5);

    if (newWordsArray.length === 0) {
      setError('Добавьте хотя бы одно слово из 5 букв');
      return;
    }

    // Получаем текущие слова из словаря
    const currentWords = selectedDictionary.words || [];
    
    // Объединяем текущие слова с новыми, убираем дубликаты
    const allWords = [...new Set([...currentWords, ...newWordsArray])];

    setLoading(true);
    try {
      // Отправляем полный объединенный список через POST (заменяет все слова)
      await DictionaryService.addWords(selectedDictionary.id, allWords);
      // Перезагружаем детали словаря, не изменяя selectedDictionaryId
      const dictionaryId = selectedDictionary.id;
      const data = await DictionaryService.getDictionary(dictionaryId);
      if (currentRequestRef.current === dictionaryId) {
        setSelectedDictionary(data);
      }
      setNewWords('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при добавлении слов');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWords = async () => {
    if (!selectedDictionary?.id) return;
    
    const wordsToRemoveArray = wordsToRemove
      .split(',')
      .map((w) => w.trim().toUpperCase())
      .filter((w) => w.length === 5);

    if (wordsToRemoveArray.length === 0) {
      setError('Укажите слова для удаления');
      return;
    }

    // Получаем текущие слова из словаря
    const currentWords = selectedDictionary.words || [];
    
    // Создаем Set для быстрого поиска удаляемых слов
    const wordsToRemoveSet = new Set(wordsToRemoveArray);
    
    // Фильтруем: оставляем только те слова, которых нет в списке удаляемых
    const remainingWords = currentWords.filter(word => !wordsToRemoveSet.has(word));

    if (remainingWords.length === currentWords.length) {
      setError('Указанные слова не найдены в словаре');
      return;
    }

    setLoading(true);
    try {
      // Отправляем новый список без удаленных слов через POST (заменяет все слова)
      await DictionaryService.addWords(selectedDictionary.id, remainingWords);
      // Перезагружаем детали словаря, не изменяя selectedDictionaryId
      const dictionaryId = selectedDictionary.id;
      const data = await DictionaryService.getDictionary(dictionaryId);
      if (currentRequestRef.current === dictionaryId) {
        setSelectedDictionary(data);
      }
      setWordsToRemove('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при удалении слов');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (dictionaryId) => {
    const dictionary = dictionaries.find(d => d.id === dictionaryId);
    setDictionaryToDelete(dictionary);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!dictionaryToDelete) return;

    try {
      await DictionaryService.deleteDictionary(dictionaryToDelete.id);
      await loadDictionaries();
      if (selectedDictionaryId === dictionaryToDelete.id) {
        setSelectedDictionary(null);
        setSelectedDictionaryId(null);
      }
      setShowDeleteConfirm(false);
      setDictionaryToDelete(null);
      setError('');
    } catch (err) {
      console.error('Delete dictionary error:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка при удалении словаря');
      setShowDeleteConfirm(false);
      setDictionaryToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDictionaryToDelete(null);
  };

  return (
    <div className="dictionary-management">
      <ConfirmDialog
        show={showDeleteConfirm}
        title="Удаление словаря"
        message={`Вы уверены, что хотите удалить словарь "${dictionaryToDelete?.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      
      {error && <div className="error-message">{error}</div>}

      <div className="dictionaries-layout">
        <div className="dictionaries-list">
          <div className="list-header">
            <h3>Словари</h3>
            <button onClick={() => setShowCreateForm(true)} className="add-button">
              + Создать словарь
            </button>
          </div>

          {showCreateForm && (
            <div className="form-card">
              <h4>Создать новый словарь</h4>
              <form onSubmit={handleCreateDictionary}>
                <div className="form-group">
                  <label>Название:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Тема:</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Слова (через запятую, по 5 букв):</label>
                  <textarea
                    value={formData.words}
                    onChange={(e) => setFormData({ ...formData, words: e.target.value })}
                    placeholder="TIGER, OCEAN, FOREST, RIVER"
                    required
                    rows={4}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={loading} className="save-button">
                    Создать
                  </button>
                  <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-button">
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="dictionaries-items">
            {dictionaries.length === 0 ? (
              <div className="empty-list-message">
                Пока нет словарей. Создайте первый словарь.
              </div>
            ) : (
              dictionaries.map((dict) => (
                <div
                  key={dict.id}
                  className={`dictionary-item ${selectedDictionaryId === dict.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedDictionaryId(dict.id);
                    setSelectedDictionary(null); // Сбрасываем детали, чтобы показать загрузку
                  }}
                >
                  <div className="dictionary-name">{dict.name}</div>
                  <div className="dictionary-info">
                    <span>Тема: {dict.theme}</span>
                    <span>Слов: {dict.wordCount || 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedDictionaryId ? (
          <div className="dictionary-details">
            {selectedDictionary ? (
              <>
                <div className="details-header">
                  <h3>{selectedDictionary.name}</h3>
                  <button
                    onClick={() => handleDeleteClick(selectedDictionary.id)}
                    className="delete-button"
                  >
                    Удалить
                  </button>
                </div>

                <div className="dictionary-info-section">
                  <div className="info-item">
                    <strong>Тема:</strong> {selectedDictionary.theme}
                  </div>
                  <div className="info-item">
                    <strong>Количество слов:</strong> {selectedDictionary.wordCount || (selectedDictionary.words?.length || 0)}
                  </div>
                </div>

                <div className="words-section">
                  <h4>Слова в словаре</h4>
                  <div className="words-list">
                    {selectedDictionary.words && selectedDictionary.words.length > 0 ? (
                      selectedDictionary.words.map((word, index) => (
                        <span key={index} className="word-tag">
                          {word}
                        </span>
                      ))
                    ) : (
                      <div className="empty-message">Слова не найдены</div>
                    )}
                  </div>
                </div>

                <div className="words-actions">
                  <div className="action-group">
                    <h4>Добавить слова</h4>
                    <textarea
                      value={newWords}
                      onChange={(e) => setNewWords(e.target.value)}
                      placeholder="HELLO, JUICE, PLANT"
                      rows={3}
                    />
                    <button onClick={handleAddWords} disabled={loading} className="add-words-button">
                      Добавить
                    </button>
                  </div>

                  <div className="action-group">
                    <h4>Удалить слова</h4>
                    <textarea
                      value={wordsToRemove}
                      onChange={(e) => setWordsToRemove(e.target.value)}
                      placeholder="HELLO, APPLE"
                      rows={3}
                    />
                    <button onClick={handleRemoveWords} disabled={loading} className="remove-words-button">
                      Удалить
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="loading">Загрузка словаря...</div>
            )}
          </div>
        ) : (
          <div className="dictionary-details empty-details">
            <div>Выберите словарь для просмотра деталей</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DictionaryManagement;

