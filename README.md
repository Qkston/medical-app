# Medical App

A modern web application for medical services with separated frontend and backend architecture.

## Project Structure

```
medical-app/
├── frontend/                  # React frontend application
│   ├── src/                   # React source code
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── tsconfig.json          # TypeScript configuration
├── signaling-server/          # WebRTC signaling server
├── amplify/                   # AWS Amplify backend configuration
└── README.md                  # This file
```

## Features

- User authentication and authorization via AWS Cognito
- Real-time communication capabilities using Socket.IO
- Rich text editing with TipTap
- Material UI components for polished user interface
- TypeScript for enhanced code reliability
- WebRTC video calling functionality

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
- Node.js signaling server
- AWS Cognito for authentication
- AWS DynamoDB for data storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AWS account (for Amplify services)

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
npm start
```

### AWS Amplify Setup

```bash
amplify init
amplify push
```

## Development

1. Start the signaling server: `cd signaling-server && npm start`
2. Start the frontend: `cd frontend && npm start`
3. The application will be available at `http://localhost:3000`

## TODO

- [DONE] Оновити імпортовані таблиці бази даних в @amplify/backend/storage папці
- [DONE] Перенести лямбда функції в @amplify/backend/function папку
- [DONE] Реорганізувати структуру проекту з виділенням фронтенду
- [ ] Перенести налаштування API Gateway в @amplify/backend/api папку
- [ ] Сформувати тестовий стенд для тестування amplify build перед деплоєм

### Patient Card functionality

- [ ] Оновити таким чином, щоб це була форма, а не редактор тексту
- [ ] Для кожного виклику створювати нову форму
- [ ] Виділити основні поля, які потрібно заповнити
- [ ] Продумати збереження та оновлення даних
