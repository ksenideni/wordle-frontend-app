import React, { useState, useEffect } from 'react';
import ClassService from '../../service/ClassService';
import DictionaryService from '../../service/DictionaryService';
import ChallengeService from '../../service/ChallengeService';
import './Teacher.css';

function ChallengeCreation() {
  const [classes, setClasses] = useState([]);
  const [dictionaries, setDictionaries] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    classId: '',
    dictionaryId: '',
    date: new Date().toISOString().split('T')[0],
    word: '',
    challengeType: 'class', // 'class', 'individual', 'all_individual'
    wordSource: 'dictionary' // 'dictionary' or 'explicit' - для 'class' и 'individual'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
    loadDictionaries();
  }, []);

  useEffect(() => {
    if (formData.classId) {
      loadClassStudents(formData.classId);
    }
  }, [formData.classId]);

  const loadClasses = async () => {
    try {
      const data = await ClassService.getClasses();
      setClasses(data.classes || []);
    } catch (err) {
      setError('Ошибка при загрузке классов');
    }
  };

  const loadDictionaries = async () => {
    try {
      const data = await DictionaryService.getDictionaries();
      setDictionaries(data.dictionaries || []);
    } catch (err) {
      console.error('Ошибка при загрузке словарей:', err);
    }
  };

  const loadClassStudents = async (classId) => {
    try {
      const classData = await ClassService.getClass(classId);
      setSelectedClass(classData);
      const studentsData = await ClassService.getClassStudents(classId);
      setStudents(studentsData.students || []);
    } catch (err) {
      setError('Ошибка при загрузке студентов');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let result;
      const date = formData.date || null;
      
      // Для 'class' и 'individual': если выбрано явное слово, словарь не нужен
      // Для 'all_individual': всегда нужен словарь
      let dictionaryId = null;
      let word = null;
      
      if (formData.challengeType === 'all_individual') {
        // Для индивидуальных вызовов всегда нужен словарь
        dictionaryId = formData.dictionaryId ? parseInt(formData.dictionaryId) : null;
        if (!dictionaryId) {
          setError('Выберите словарь для создания индивидуальных вызовов');
          setLoading(false);
          return;
        }
      } else if (formData.wordSource === 'explicit') {
        // Явное слово указано
        word = formData.word.trim().toUpperCase();
        if (!word || word.length !== 5) {
          setError('Укажите слово из 5 букв');
          setLoading(false);
          return;
        }
        dictionaryId = null; // Словарь не нужен при явном слове
      } else {
        // Выбрать из словаря
        dictionaryId = formData.dictionaryId ? parseInt(formData.dictionaryId) : null;
        if (!dictionaryId) {
          setError('Выберите словарь для случайного слова');
          setLoading(false);
          return;
        }
        word = null;
      }

      if (formData.challengeType === 'class') {
        result = await ChallengeService.createClassChallenge(
          parseInt(formData.classId),
          date,
          dictionaryId,
          word
        );
        setSuccess(`Вызов для класса создан! ID: ${result.id}`);
      } else if (formData.challengeType === 'all_individual') {
        result = await ChallengeService.createIndividualChallenges(
          parseInt(formData.classId),
          date,
          dictionaryId
        );
        setSuccess(`Создано ${result.created_count} индивидуальных вызовов`);
      } else if (formData.challengeType === 'individual') {
        const studentId = e.target.studentId?.value;
        if (!studentId) {
          setError('Выберите студента');
          setLoading(false);
          return;
        }
        result = await ChallengeService.createStudentChallenge(
          parseInt(studentId),
          date,
          dictionaryId, // Может быть null, если указано слово
          word
        );
        setSuccess(`Индивидуальный вызов создан! ID: ${result.id}`);
      }

      // Сброс формы
      setFormData({
        classId: formData.classId,
        dictionaryId: '',
        date: new Date().toISOString().split('T')[0],
        word: '',
        challengeType: formData.challengeType,
        wordSource: 'dictionary'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании вызова');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="challenge-creation">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="challenge-form">
        <div className="challenge-form-section">
          <div className="challenge-form-section-title">Основные параметры</div>
          
          <div className="form-group">
            <label>Тип вызова:</label>
            <select
              value={formData.challengeType}
              onChange={(e) => {
                const newType = e.target.value;
                setFormData({ 
                  ...formData, 
                  challengeType: newType,
                  wordSource: (newType === 'class' || newType === 'individual') ? 'dictionary' : formData.wordSource
                });
              }}
              required
            >
              <option value="class">Для всего класса (одно слово)</option>
              <option value="all_individual">Индивидуальные для всех студентов</option>
              <option value="individual">Индивидуальный для одного студента</option>
            </select>
          </div>

          <div className="form-group">
            <label>Класс:</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              required
            >
              <option value="">Выберите класс</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {formData.challengeType === 'individual' && (
            <div className="form-group">
              <label>Студент:</label>
              <select name="studentId" required>
                <option value="">Выберите студента</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName || student.first_name} {student.lastName || student.last_name} ({student.login})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Дата:</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <small>Оставьте пустым для сегодняшней даты</small>
          </div>
        </div>

        <div className="challenge-form-section">
          <div className="challenge-form-section-title">Источник слова</div>

          {/* Для 'all_individual' всегда нужен словарь */}
          {formData.challengeType === 'all_individual' && (
            <div className="form-group">
              <label>Словарь:</label>
              <select
                value={formData.dictionaryId}
                onChange={(e) => setFormData({ ...formData, dictionaryId: e.target.value })}
                required
              >
                <option value="">Выберите словарь</option>
                {dictionaries.map((dict) => (
                  <option key={dict.id} value={dict.id}>
                    {dict.name} ({dict.wordCount || 0} слов)
                  </option>
                ))}
              </select>
              <small>Будут созданы индивидуальные вызовы со случайными словами для каждого студента</small>
            </div>
          )}

          {/* Для 'class' и 'individual': выбор между словарем и явным словом */}
          {(formData.challengeType === 'class' || formData.challengeType === 'individual') && (
            <>
              <div className="form-group">
                <label>Источник слова:</label>
                <select
                  value={formData.wordSource}
                  onChange={(e) => {
                    const newWordSource = e.target.value;
                    setFormData({ 
                      ...formData, 
                      wordSource: newWordSource,
                      dictionaryId: newWordSource === 'explicit' ? '' : formData.dictionaryId,
                      word: newWordSource === 'dictionary' ? '' : formData.word
                    });
                  }}
                >
                  <option value="dictionary">Выбрать случайное слово из словаря</option>
                  <option value="explicit">Указать слово явно</option>
                </select>
              </div>

              {formData.wordSource === 'dictionary' && (
                <div className="form-group">
                  <label>Словарь:</label>
                  <select
                    value={formData.dictionaryId}
                    onChange={(e) => setFormData({ ...formData, dictionaryId: e.target.value })}
                    required
                  >
                    <option value="">Выберите словарь</option>
                    {dictionaries.map((dict) => (
                      <option key={dict.id} value={dict.id}>
                        {dict.name} ({dict.wordCount || 0} слов)
                      </option>
                    ))}
                  </select>
                  <small>Будет выбрано случайное слово из выбранного словаря</small>
                </div>
              )}

              {formData.wordSource === 'explicit' && (
                <div className="form-group">
                  <label>Слово:</label>
                  <input
                    type="text"
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value.toUpperCase() })}
                    maxLength={5}
                    placeholder="Введите слово из 5 букв"
                    required
                  />
                  <small>Укажите слово из 5 букв, которое будет использоваться для всех</small>
                </div>
              )}
            </>
          )}
        </div>

        <button type="submit" disabled={loading} className="create-button">
          {loading ? 'Создание...' : 'Создать вызов'}
        </button>
      </form>
    </div>
  );
}

export default ChallengeCreation;

