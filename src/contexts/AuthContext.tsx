import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateGameStats: (gameStats: {
    score: number;
    level: number;
    linesCleared: number;
    playTime: number;
    lineClearStats: { singles: number; doubles: number; triples: number; tetrises: number; };
    gameMode: string;
    maxCombo: number;
    perfectClears: number;
    tSpins: number;
  }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Set up real-time listener for user profile
          const userDocRef = doc(db, 'users', user.uid);
          const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              setUserProfile(doc.data() as UserProfile);
            }
          });

          // Store the unsubscribe function for cleanup
          return () => {
            unsubscribeProfile();
          };
        } catch (profileError) {
          console.error('Error setting up profile listener:', profileError);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleGoogleUser = async (user: User) => {
    // Check if user profile exists
    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!profileDoc.exists()) {
      // Create new profile for Google users
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        fullName: user.displayName || 'Player',
        ...(user.photoURL && { avatarUrl: user.photoURL }), // Only include avatarUrl if it exists
        registrationDate: serverTimestamp() as Timestamp,
        lastLoginDate: serverTimestamp() as Timestamp,
        gameStats: {
          totalGames: 0,
          totalScore: 0,
          totalPlayTime: 0,
          highScore: 0,
          highestLevel: 1,
          averageGameTime: 0,
          averageScore: 0,
          piecesPerMinute: 0,
          totalLinesCleared: 0,
          lineClearStats: {
            singles: 0,
            doubles: 0,
            triples: 0,
            tetrises: 0,
          },
          maxCombo: 0,
          perfectClears: 0,
          tSpins: 0,
          achievements: [],
          modeStats: {
            classic: { games: 0, bestScore: 0, totalPlayTime: 0 },
            'time-attack': { games: 0, bestScore: 0, bestTime: 0, totalPlayTime: 0 },
            survival: { games: 0, bestScore: 0, totalPlayTime: 0 },
            marathon: { games: 0, bestScore: 0, totalPlayTime: 0 },
          }
        },
        recentSessions: [],
        weeklyStats: [],
        monthlyStats: [],
        preferences: {
          defaultGameMode: 'classic' as const,
          soundEnabled: true,
          showGhost: true,
          autoRepeat: true,
        }
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
    } else {
      // Update last login date
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginDate: serverTimestamp()
      });
    }
  };

  const handleMicrosoftUser = async (user: User) => {
    // Check if user profile exists
    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!profileDoc.exists()) {
      // Create new profile for Microsoft users
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        fullName: user.displayName || 'Player',
        ...(user.photoURL && { avatarUrl: user.photoURL }), // Only include avatarUrl if it exists
        registrationDate: serverTimestamp() as Timestamp,
        lastLoginDate: serverTimestamp() as Timestamp,
        gameStats: {
          totalGames: 0,
          totalScore: 0,
          totalPlayTime: 0,
          highScore: 0,
          highestLevel: 1,
          averageGameTime: 0,
          averageScore: 0,
          piecesPerMinute: 0,
          totalLinesCleared: 0,
          lineClearStats: {
            singles: 0,
            doubles: 0,
            triples: 0,
            tetrises: 0,
          },
          maxCombo: 0,
          perfectClears: 0,
          tSpins: 0,
          achievements: [],
          modeStats: {
            classic: { games: 0, bestScore: 0, totalPlayTime: 0 },
            'time-attack': { games: 0, bestScore: 0, bestTime: 0, totalPlayTime: 0 },
            survival: { games: 0, bestScore: 0, totalPlayTime: 0 },
            marathon: { games: 0, bestScore: 0, totalPlayTime: 0 },
          }
        },
        recentSessions: [],
        weeklyStats: [],
        monthlyStats: [],
        preferences: {
          defaultGameMode: 'classic' as const,
          soundEnabled: true,
          showGhost: true,
          autoRepeat: true,
        }
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
    } else {
      // Update last login date
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginDate: serverTimestamp()
      });
    }
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    
    try {
      const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const newProfile: UserProfile = {
      uid: user.uid,
      email,
      fullName,
      registrationDate: serverTimestamp() as Timestamp,
      lastLoginDate: serverTimestamp() as Timestamp,
      gameStats: {
        totalGames: 0,
        totalScore: 0,
        totalPlayTime: 0,
        highScore: 0,
        highestLevel: 1,
        averageGameTime: 0,
        averageScore: 0,
        piecesPerMinute: 0,
        totalLinesCleared: 0,
        lineClearStats: {
          singles: 0,
          doubles: 0,
          triples: 0,
          tetrises: 0,
        },
        maxCombo: 0,
        perfectClears: 0,
        tSpins: 0,
        achievements: [],
        modeStats: {
          classic: { games: 0, bestScore: 0, totalPlayTime: 0 },
          'time-attack': { games: 0, bestScore: 0, bestTime: 0, totalPlayTime: 0 },
          survival: { games: 0, bestScore: 0, totalPlayTime: 0 },
          marathon: { games: 0, bestScore: 0, totalPlayTime: 0 },
        }
      },
      recentSessions: [],
      weeklyStats: [],
      monthlyStats: [],
      preferences: {
        defaultGameMode: 'classic' as const,
        soundEnabled: true,
        showGhost: true,
        autoRepeat: true,
      }
    };
    await setDoc(doc(db, 'users', user.uid), newProfile);
    setUserProfile(newProfile);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    if (currentUser) {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        lastLoginDate: serverTimestamp()
      });
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Add additional scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await handleGoogleUser(result.user);
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      // Handle specific popup blocked errors
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by browser. Please allow popups and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Authentication cancelled by user.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // This happens when multiple popup requests are made
        throw new Error('Another authentication request is in progress.');
      }
      throw error;
    }
  };

  const loginWithMicrosoft = async () => {
    const provider = new OAuthProvider('microsoft.com');
    // Add additional scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    // Optional: Add custom parameters
    provider.setCustomParameters({
      // Force re-consent to make sure users get the consent dialog
      prompt: 'consent',
      // Use 'common' for both personal and work/school accounts
      tenant: 'common'
    });
    
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await handleMicrosoftUser(result.user);
      }
    } catch (error: any) {
      console.error('Error signing in with Microsoft:', error);
      // Handle specific popup blocked errors
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by browser. Please allow popups and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Authentication cancelled by user.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // This happens when multiple popup requests are made
        throw new Error('Another authentication request is in progress.');
      }
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user logged in');
    await updateDoc(doc(db, 'users', currentUser.uid), data);
    // Note: We don't need to manually update local state anymore
    // because the onSnapshot listener will handle it automatically
  };

  const updateGameStats = async (gameStats: {
    score: number;
    level: number;
    linesCleared: number;
    playTime: number;
    lineClearStats: { singles: number; doubles: number; triples: number; tetrises: number; };
    gameMode: string;
    maxCombo: number;
    perfectClears: number;
    tSpins: number;
  }) => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Get current stats to calculate averages and check high scores
      const currentDoc = await getDoc(userRef);
      const currentData = currentDoc.data() as UserProfile;
      const currentStats = currentData.gameStats;
      
      const newTotalGames = currentStats.totalGames + 1;
      const newTotalScore = currentStats.totalScore + gameStats.score;
      const newTotalPlayTime = currentStats.totalPlayTime + gameStats.playTime;
      
      const updates = {
        'gameStats.totalGames': newTotalGames,
        'gameStats.totalScore': newTotalScore,
        'gameStats.totalPlayTime': newTotalPlayTime,
        'gameStats.highScore': Math.max(currentStats.highScore, gameStats.score),
        'gameStats.highestLevel': Math.max(currentStats.highestLevel, gameStats.level),
        'gameStats.averageGameTime': newTotalPlayTime / newTotalGames,
        'gameStats.averageScore': newTotalScore / newTotalGames,
        'gameStats.totalLinesCleared': currentStats.totalLinesCleared + gameStats.linesCleared,
        'gameStats.lineClearStats.singles': currentStats.lineClearStats.singles + gameStats.lineClearStats.singles,
        'gameStats.lineClearStats.doubles': currentStats.lineClearStats.doubles + gameStats.lineClearStats.doubles,
        'gameStats.lineClearStats.triples': currentStats.lineClearStats.triples + gameStats.lineClearStats.triples,
        'gameStats.lineClearStats.tetrises': currentStats.lineClearStats.tetrises + gameStats.lineClearStats.tetrises,
        'gameStats.maxCombo': Math.max(currentStats.maxCombo, gameStats.maxCombo),
        'gameStats.perfectClears': currentStats.perfectClears + gameStats.perfectClears,
        'gameStats.tSpins': currentStats.tSpins + gameStats.tSpins,
        'gameStats.lastGameDate': serverTimestamp(),
      };
      
      await updateDoc(userRef, updates);
      console.log('Game stats updated successfully');
    } catch (error) {
      console.error('Error updating game stats:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    loginWithMicrosoft,
    logout,
    updateProfile,
    updateGameStats,
    refreshProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 