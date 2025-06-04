# Tetris New Twist

A modern take on the classic Tetris game with user authentication, profiles, and competitive features.

## Features

- Classic Tetris gameplay with modern graphics
- User authentication and profiles
- Leaderboards and competitive play
- Progress tracking and statistics
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Enable Storage for avatar uploads
5. Get your Firebase configuration from Project Settings > General > Your Apps > Web App
6. Create a `.env` file in the project root with the following variables:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tetris-new-twist.git
cd tetris-new-twist
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Deploy Firebase security rules:
```bash
firebase deploy --only firestore:rules,storage:rules
```

## Game Controls

- Left Arrow / A: Move piece left
- Right Arrow / D: Move piece right
- Down Arrow / S: Move piece down
- Up Arrow / W: Rotate piece
- Space: Hard drop
- P: Pause game
- R: Restart game
- Z: Undo move

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 