# Tetris New Twist

A modern take on the classic Tetris game with competitive features and social elements.

## Features

- Modern Tetris gameplay with enhanced graphics
- User authentication and profiles (Email/Password, Google Auth & Microsoft Auth)
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
   - Go to "Sign-in method" tab
   - Enable **Email/Password** provider
   - Enable **Google** provider:
     - Click on Google
     - Toggle "Enable"
     - Add your project's authorized domains (usually `localhost` for development and your production domain)
     - Download the configuration if needed
   - Enable **Microsoft** provider:
     - **Step 1: Get Firebase Auth Domain**
       - In Firebase Console, go to Authentication > Settings > Authorized domains
       - Copy your Firebase Auth domain (looks like: `yourproject.firebaseapp.com`)
     
     - **Step 2: Create Azure AD Application**
       - Go to [Azure Portal](https://portal.azure.com/)
       - Navigate to **"Azure Active Directory"** > **"App registrations"**
       - Click **"New registration"**
       - Enter application name (e.g., "Tetris Game")
       - Under **"Supported account types"**, select **"Accounts in any organizational directory and personal Microsoft accounts (personal Microsoft accounts, e.g. Skype, Xbox)"**
       - Under **"Redirect URI"**:
         - Select **"Web"** from dropdown
         - Enter: `https://yourproject.firebaseapp.com/__/auth/handler`
         - Replace `yourproject` with your actual Firebase project ID
       - Click **"Register"**
     
     - **Step 3: Configure Application**
       - In your newly created app, go to **"Overview"**
       - Copy the **"Application (client) ID"** - you'll need this for Firebase
       - Copy the **"Directory (tenant) ID"** (optional, but recommended)
       
     - **Step 4: Create Client Secret**
       - Go to **"Certificates & secrets"** in the left menu
       - Click **"New client secret"**
       - Add a description (e.g., "Firebase Auth Secret")
       - Choose expiration (recommended: 24 months)
       - Click **"Add"**
       - **IMPORTANT**: Copy the **"Value"** (not the "Secret ID") immediately - it won't be shown again
       
     - **Step 5: Set API Permissions (Optional but Recommended)**
       - Go to **"API permissions"**
       - Click **"Add a permission"**
       - Select **"Microsoft Graph"**
       - Choose **"Delegated permissions"**
       - Add: `User.Read`, `profile`, `email`, `openid`
       - Click **"Add permissions"**
       
     - **Step 6: Configure Firebase**
       - Back in Firebase Console, click on **"Microsoft"** provider
       - Toggle **"Enable"**
       - Paste the **Application (client) ID** from Step 3
       - Paste the **client secret VALUE** from Step 4 (not the Secret ID!)
       - Click **"Save"**
       
     - **Step 7: Add Authorized Domains**
       - Add your domains (localhost for development, your production domain)

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

## Troubleshooting Microsoft Authentication

If you encounter `AADSTS7000215: Invalid client secret` error:

1. **Check you're using the secret VALUE, not the Secret ID**
   - In Azure Portal, go to your app > Certificates & secrets
   - Create a new client secret if the old one expired
   - Copy the "Value" field (not the "Secret ID")
   - Update this value in Firebase Console

2. **Verify the Redirect URI**
   - Must be exactly: `https://yourproject.firebaseapp.com/__/auth/handler`
   - Replace `yourproject` with your actual Firebase project ID

3. **Check Application Type**
   - Should support "personal Microsoft accounts" if you want Outlook/Hotmail users

4. **Verify Firebase Configuration**
   - Application ID and Client Secret must match exactly with Azure AD 