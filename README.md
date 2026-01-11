# Wordle Educational Platform - Frontend

Frontend для образовательной платформы изучения английского языка через игру Wordle.

## Технологии

- React 18
- Redux Toolkit
- React Router DOM
- Axios

## Требования

- Node.js 16+
- npm 8+

## Быстрый старт

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Настройте URL бэкенда (опционально):
   
   Создайте файл `.env` в корне проекта:
   ```
   REACT_APP_API_BASE_URL=http://localhost:8080
   ```
   
   По умолчанию используется `http://localhost:8080`

3. Запустите приложение:
   ```bash
   npm start
   ```

4. Приложение будет доступно на `http://localhost:3000`

## Backend

Backend приложение находится в отдельном репозитории: [wordle-backend-app](https://github.com/ksenideni/wordle-backend-app)

**Важно:** Перед запуском frontend убедитесь, что backend запущен и доступен на `http://localhost:8080`

## Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `build/`

## Структура проекта

```
src/
├── components/     # React компоненты
│   ├── auth/      # Аутентификация
│   ├── teacher/   # Интерфейс учителя
│   ├── student/   # Интерфейс студента
│   ├── game/      # Игровые компоненты
│   └── common/    # Общие компоненты
├── service/        # Сервисы для работы с API
├── reducers/       # Redux reducers
└── store/          # Redux store
