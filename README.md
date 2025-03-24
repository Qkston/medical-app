# Medical App

A modern web application for medical services built with React and AWS Amplify.

## Features

- User authentication and authorization via AWS Cognito
- Real-time communication capabilities using Socket.IO
- Rich text editing with TipTap
- Material UI components for polished user interface
- TypeScript for enhanced code reliability

## Tech Stack

- React 18
- TypeScript
- AWS Amplify
- Material UI
- TipTap Editor
- Socket.IO
- WebRTC (Simple Peer)
- Formik & Yup for form handling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AWS account (for Amplify services)


## TODO

- [DONE] Оновити імпортовані таблиці бази даних в @amplify/backend/storage папці
- [DONE] Перенести лямбда функції в @amplify/backend/function папку
- [ ] Перенести налаштування API Gateway в @amplify/backend/api папку
- [ ] Сформувати тестовий стенд для тестування amplify build перед деплоєм

### Patient Card functionality

- [ ] Оновити таким чином, щоб це була форма, а не редактор текстку
- [ ] Для кожного виклику створювати нову форму
- [ ] Виділити основні поля, які потрібно заповнити
- [ ] Продумати збереження та оновлення даних
