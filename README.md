# Tetris New Twist

A modern take on the classic Tetris game with competitive features and social elements.

## Features

- Modern Tetris gameplay with enhanced graphics
- User authentication and profiles
- Real-time leaderboards
- Game statistics tracking
- Progressive difficulty levels
- Undo functionality
- Next piece preview
- Touch-friendly controls for mobile

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hezamwa/hezamwa-tetris-new-twist.git
cd hezamwa-tetris-new-twist
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase (required for authentication features):
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication and Firestore Database
   - Copy your Firebase configuration
   - Create a `.env` file in the project root with your Firebase config:
   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

4. Start the development server:
```bash
npm start
```

The app will run on [http://localhost:3000](http://localhost:3000).

## Firebase Setup (Detailed)

To enable user authentication and profile features:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Authentication**
   - In your Firebase project, go to Authentication
   - Click "Get started"
   - Enable Email/Password and Google sign-in methods

3. **Create Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Start in test mode (configure security rules later)

4. **Enable Storage** (for avatar uploads)
   - Go to Storage
   - Click "Get started"
   - Use default settings

5. **Get Configuration**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the web icon to add a web app
   - Copy the configuration object

6. **Configure Environment Variables**
   - Create `.env` file in project root
   - Add your Firebase configuration as shown above

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technologies Used

- React 18
- TypeScript
- Material-UI (MUI)
- Firebase (Authentication, Firestore, Storage)
- React Router
- Styled Components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 