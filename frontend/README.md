# Medical App Frontend

React-based frontend application for the Medical App.

## Tech Stack

- React 18 with TypeScript
- Material UI for components
- TipTap for rich text editing
- Socket.IO client for real-time communication
- Simple Peer for WebRTC video calls
- AWS Amplify UI components
- Formik & Yup for form handling

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Chat/           # Chat functionality
│   ├── Patients/       # Patient management
│   ├── Settings/       # Application settings
│   └── VideoCall/      # Video calling components
├── utils/              # Utility functions
│   ├── api/           # API utilities
│   └── video/         # Video/WebRTC utilities
├── styles/            # CSS styles
├── App.tsx            # Main App component
└── index.tsx          # Application entry point
```

## Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_SIGNALING_SERVER_URL=ws://localhost:3001
```

## AWS Amplify Configuration

The application uses AWS Amplify for authentication and backend services. Configuration files:

- `src/aws-exports.js` - AWS configuration (auto-generated)
- `src/amplifyconfiguration.json` - Amplify configuration

## Features

- User authentication with AWS Cognito
- Real-time chat functionality
- Video calling with WebRTC
- Patient card management
- Rich text editing for patient notes
- Material Design UI 