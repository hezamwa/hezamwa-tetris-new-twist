import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
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
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
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
        avatarUrl: user.photoURL || undefined,
        registrationDate: serverTimestamp() as Timestamp,
        lastLoginDate: serverTimestamp() as Timestamp,
        gameStats: {
          highScore: 0,
          gameCount: 0,
          highestLevel: 1,
          totalScore: 0,
          totalPlayTime: 0
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
        highScore: 0,
        gameCount: 0,
        highestLevel: 1,
        totalScore: 0,
        totalPlayTime: 0
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

  const logout = () => {
    return signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user logged in');
    await updateDoc(doc(db, 'users', currentUser.uid), data);
    // Note: We don't need to manually update local state anymore
    // because the onSnapshot listener will handle it automatically
  };

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    refreshProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 