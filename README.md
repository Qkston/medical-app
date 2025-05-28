# Medical App

A modern web application for medical services with separated frontend and backend architecture.

## Project Structure

```
medical-app/
├── frontend/                  # React TypeScript додаток
│   ├── src/                   # React source code
│   ├── public/                # Static assets
│   ├── Dockerfile             # Frontend Docker configuration
│   ├── nginx.conf             # Nginx configuration for production
│   ├── package.json           # Frontend dependencies
│   └── tsconfig.json          # TypeScript configuration
├── signaling-server/          # Node.js Socket.IO сервер
│   ├── utils/                 # Server utilities
│   ├── Dockerfile             # Signaling server Docker configuration
│   ├── healthcheck.js         # Health check script
│   ├── index.js               # Server entry point
│   └── package.json           # Server dependencies
├── amplify/                   # AWS Amplify backend configuration (не докеризований)
├── .devcontainer/             # VS Code DevContainer configuration
│   └── devcontainer.json
├── docker-compose.yml         # Основна Docker конфігурація
├── docker-compose.dev.yml     # Development Docker конфігурація
├── .dockerignore              # Docker ignore rules
├── package.json               # Root package with Docker scripts
└── README.md                  # This file
```

## Features

- User authentication and authorization via AWS Cognito
- Real-time communication capabilities using Socket.IO
- Rich text editing with TipTap
- Material UI components for polished user interface
- TypeScript for enhanced code reliability
- WebRTC video calling functionality
- **Dockerized development environment with hot reload**
- **VS Code DevContainer support**

## Tech Stack

### Frontend
- React 18
- TypeScript
- Material UI
- TipTap Editor
- Socket.IO Client
- WebRTC (Simple Peer)
- Formik & Yup for form handling

### Backend
- AWS Amplify
- Node.js signaling server with Socket.IO
- AWS Cognito for authentication
- AWS DynamoDB for data storage

### DevOps
- Docker & Docker Compose
- Multi-stage Dockerfiles
- VS Code DevContainers
- Nginx for production

## 🚀 Getting Started

### Prerequisites

- Docker Desktop
- VS Code (для DevContainer)
- Node.js (v16 or higher) - якщо запускаєте локально
- AWS account (for Amplify services)

### 🐳 Docker Development (Recommended)

#### Quick Start

```bash
# Запуск development середовища з hot reload
npm run dev:build

# Або використовуючи Docker Compose напряму
docker-compose -f docker-compose.dev.yml up --build
```

#### Available Docker Scripts

```bash
npm run dev           # Запуск development
npm run dev:build     # Запуск з перебудовою образів
npm run dev:down      # Зупинка
npm run dev:logs      # Перегляд логів
npm run frontend:logs # Логи тільки frontend
npm run signaling:logs # Логи тільки signaling server
npm run clean         # Повне очищення (контейнери, volumes, образи)
```

### 🛠 VS Code DevContainer

1. Встановіть розширення "Dev Containers" у VS Code
2. Відкрийте команду `Ctrl+Shift+P` > "Dev Containers: Reopen in Container"
3. VS Code автоматично налаштує development середовище

#### DevContainer Features
- ✅ Автоматичне встановлення всіх розширень
- ✅ Консистентне середовище розробки
- ✅ Hot reload для frontend
- ✅ Налаштований TypeScript та ESLint
- ✅ Автоматичне форматування коду

### 📋 Available Services

| Сервіс | Порт | URL | Опис |
|--------|------|-----|-----|
| Frontend | 3000 | http://localhost:3000 | React додаток |
| Signaling Server | 8080 | http://localhost:8080 | Socket.IO сервер |

### 🔥 Hot Reload та Live Development

#### Frontend
- Зміни в коді автоматично відображаються без перезапуску
- Fast Refresh увімкнений
- Source maps для зручного дебагу

#### Signaling Server
- Використовує nodemon для автоматичного перезапуску
- Зміни в коді застосовуються миттєво

## 📝 Environment Variables

### Frontend (React)
```env
REACT_APP_SIGNALING_SERVER_URL=http://localhost:8080
CHOKIDAR_USEPOLLING=true
FAST_REFRESH=true
GENERATE_SOURCEMAP=true
```

### Signaling Server
```env
NODE_ENV=development
PORT=8080
ALLOWED_ORIGIN=http://localhost:3000
```

## 💻 Local Development (без Docker)

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Signaling Server Setup

```bash
cd signaling-server
npm install
npm run dev  # Uses nodemon for hot reload
```

### AWS Amplify Setup

```bash
amplify init
amplify push
```

## 🐳 Production Deployment

### Using Docker

```bash
# Відредагуйте docker-compose.yml (розкоментуйте production сервіси)
npm run prod:build
```

### Manual Deployment

1. Build frontend: `cd frontend && npm run build`
2. Deploy to your hosting provider
3. Configure signaling server with production environment variables

## 🔍 Troubleshooting

### Frontend не оновлюється автоматично
- Перевірте, чи встановлена змінна `CHOKIDAR_USEPOLLING=true`
- На Windows може знадобитися додати `WATCHPACK_POLLING=true`

### Signaling Server не запускається
- Перевірте, чи порт 8080 не зайнятий іншим процесом
- Подивіться логи: `npm run signaling:logs`

### VS Code DevContainer не працює
- Переконайтесь, що Docker Desktop запущений
- Встановіть розширення "Dev Containers"
- Спробуйте перебудувати контейнер: `Ctrl+Shift+P` > "Dev Containers: Rebuild Container"

### Port conflicts
```bash
# Check if ports are in use
netstat -an | findstr :3000
netstat -an | findstr :8080

# Stop conflicting services
npm run dev:down
```

## 📦 AWS Amplify

AWS Amplify залишається поза Docker, оскільки:
- Amplify CLI потребує локального доступу до AWS credentials
- Краще працює в host системі
- Не впливає на development workflow

Amplify команди виконуйте в host системі:
```bash
amplify status
amplify push
amplify pull
```

## ⚡ Performance Tips

1. **Docker Desktop на Windows**: Увімкніть WSL 2 для кращої продуктивності
2. **Volume mounting**: Node_modules винесені в окремі volumes для швидкості
3. **Build cache**: Docker використовує multi-stage builds для оптимізації

## 📝 TODO

### Infrastructure
- [DONE] Оновити імпортовані таблиці бази даних в @amplify/backend/storage папці
- [DONE] Перенести лямбда функції в @amplify/backend/function папку
- [DONE] Реорганізувати структуру проекту з виділенням фронтенду
- [DONE] Dockerize the application with separate containers for frontend and signaling server
- [DONE] Setup VS Code DevContainer for consistent development environment
- [ ] Перенести налаштування API Gateway в @amplify/backend/api папку
- [ ] Сформувати тестовий стенд для тестування amplify build перед деплоєм

### Patient Card functionality
- [ ] Оновити таким чином, щоб це була форма, а не редактор тексту
- [ ] Для кожного виклику створювати нову форму
- [ ] Виділити основні поля, які потрібно заповнити
- [ ] Продумати збереження та оновлення даних

## 🤝 Contributing

1. Clone the repository
2. Use Docker development environment: `npm run dev:build`
3. Make your changes
4. Test in both frontend and signaling server containers
5. Submit a pull request
