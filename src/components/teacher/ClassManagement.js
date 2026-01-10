import React, { useState, useEffect } from 'react';
import ClassService from '../../service/ClassService';
import DictionaryService from '../../service/DictionaryService';
import ConfirmDialog from '../common/ConfirmDialog';
import './Teacher.css';

function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [dictionaries, setDictionaries] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ show: false, type: '', id: null, name: '' });

  useEffect(() => {
    loadClasses();
    loadDictionaries();
  }, []);

  useEffect(() => {
    if (selectedClass?.id) {
      loadClassDetails(selectedClass.id);
    }
  }, [selectedClass?.id]); // Загружаем детали только при изменении ID класса

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

  const loadClassDetails = async (classId) => {
    try {
      setShowEditForm(false); // Закрываем форму редактирования при выборе нового класса
      const classData = await ClassService.getClass(classId);
      setSelectedClass(classData);
      setFormData({
        name: classData.name
      });
      
      // Студенты теперь загружаются вместе с информацией о классе в getClass
      setStudents(classData.students || []);
    } catch (err) {
      setError('Ошибка при загрузке информации о классе');
      setStudents([]);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await ClassService.createClass(formData.name);
      await loadClasses();
      setShowCreateForm(false);
      setFormData({ name: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании класса');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await ClassService.updateClass(
        selectedClass.id,
        formData.name
      );
      await loadClasses();
      await loadClassDetails(selectedClass.id);
      setShowEditForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении класса');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = (classId) => {
    const classToDelete = classes.find(c => c.id === classId);
    setDeleteDialog({
      show: true,
      type: 'class',
      id: classId,
      name: classToDelete?.name || 'класс'
    });
  };

  const handleRemoveStudent = (studentId) => {
    const studentToRemove = students.find(s => s.id === studentId);
    const studentName = studentToRemove 
      ? `${studentToRemove.firstName || studentToRemove.first_name} ${studentToRemove.lastName || studentToRemove.last_name}`
      : 'студента';
    setDeleteDialog({
      show: true,
      type: 'student',
      id: studentId,
      name: studentName
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.type === 'class') {
      try {
        await ClassService.deleteClass(deleteDialog.id);
        await loadClasses();
        if (selectedClass?.id === deleteDialog.id) {
          setSelectedClass(null);
          setStudents([]);
        }
        setDeleteDialog({ show: false, type: '', id: null, name: '' });
        setError(''); // Очищаем ошибки при успехе
      } catch (err) {
        // Показываем ошибку от бэкенда или стандартное сообщение
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Ошибка при удалении класса';
        setError(errorMessage);
        setDeleteDialog({ show: false, type: '', id: null, name: '' });
      }
    } else if (deleteDialog.type === 'student') {
      try {
        await ClassService.removeStudent(selectedClass.id, deleteDialog.id);
        await loadClassDetails(selectedClass.id);
        setDeleteDialog({ show: false, type: '', id: null, name: '' });
        setError(''); // Очищаем ошибки при успехе
      } catch (err) {
        // Показываем ошибку от бэкенда или стандартное сообщение
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Ошибка при удалении студента';
        setError(errorMessage);
        setDeleteDialog({ show: false, type: '', id: null, name: '' });
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ show: false, type: '', id: null, name: '' });
  };

  return (
    <div className="class-management">
      <ConfirmDialog
        show={deleteDialog.show}
        title={deleteDialog.type === 'class' ? 'Удаление класса' : 'Удаление студента'}
        message={deleteDialog.type === 'class' 
          ? `Вы уверены, что хотите удалить класс "${deleteDialog.name}"? Это действие нельзя отменить.`
          : `Вы уверены, что хотите удалить ${deleteDialog.name} из класса? Это действие нельзя отменить.`
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
      />
      
      <h2>Управление классами</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="classes-layout">
        <div className="classes-list">
          <div className="list-header">
            <h3>Классы</h3>
            <button onClick={() => setShowCreateForm(true)} className="add-button">
              + Создать класс
            </button>
          </div>
          
          {showCreateForm && (
            <div className="form-card">
              <h4>Создать новый класс</h4>
              <form onSubmit={handleCreateClass}>
                <div className="form-group">
                  <label>Название класса:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
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

          <div className="classes-items">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className={`class-item ${selectedClass?.id === cls.id ? 'active' : ''} ${cls.isMine ? 'my-class' : ''}`}
                onClick={() => setSelectedClass(cls)}
              >
                <div className="class-name">{cls.name}</div>
                <div className="class-info">
                  <span>Студентов: {cls.studentCount !== undefined ? cls.studentCount : (cls.student_count || 0)}</span>
                  {cls.teacherName && (
                    <span>Учитель: {cls.teacherName}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedClass && (
          <div className="class-details">
            <div className="details-header">
              <h3>{selectedClass.name}</h3>
              {selectedClass.isMine && (
                <div className="details-actions">
                  <button onClick={() => setShowEditForm(true)} className="edit-button">
                    Редактировать
                  </button>
                  <button onClick={() => handleDeleteClass(selectedClass.id)} className="delete-button">
                    Удалить
                  </button>
                </div>
              )}
            </div>

            {showEditForm && selectedClass.isMine && (
              <div className="form-card">
                <h4>Редактировать класс</h4>
                <form onSubmit={handleUpdateClass}>
                  <div className="form-group">
                    <label>Название класса:</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" disabled={loading} className="save-button">
                      Сохранить
                    </button>
                    <button type="button" onClick={() => setShowEditForm(false)} className="cancel-button">
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="class-info-section">
              <div className="info-item">
                <strong>Учитель:</strong> {selectedClass.teacherName || 'Неизвестно'}
              </div>
              {selectedClass.isMine && (
                <div className="info-item">
                  <strong>Это ваш класс</strong>
                </div>
              )}
            </div>

            <div className="students-section">
              <h4>Студенты</h4>
              <div className="students-list">
                {students.length === 0 ? (
                  <div className="empty-message">В классе пока нет студентов</div>
                ) : (
                  students.map((student) => (
                    <div key={student.id} className="student-item">
                      <div className="student-info">
                        <span className="student-name">
                          {student.firstName || student.first_name} {student.lastName || student.last_name}
                        </span>
                        <span className="student-login">{student.login}</span>
                      </div>
                      {selectedClass.isMine && (
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
                          className="remove-student-button"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {!selectedClass.isMine && (
              <div className="info-message">
                <p>Это класс другого учителя. Вы можете просматривать информацию о классе и список студентов, но не можете редактировать класс.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassManagement;

