import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  Auth
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp, onSnapshot, Firestore } from 'firebase/firestore';
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
    // Check if Firebase auth is available
    if (!auth) {
      console.warn('Firebase auth not available - running in demo mode');
      setLoading(false);
      return;
    }

    // Set a timeout to ensure loading doesn't hang forever
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth loading timeout - showing content anyway');
      setLoading(false);
    }, 3000); // 3 second timeout

    try {
      const unsubscribe = onAuthStateChanged(auth as Auth, async (user) => {
        clearTimeout(loadingTimeout); // Clear timeout since auth loaded
        setCurrentUser(user);
        if (user && db) {
          try {
            // Set up real-time listener for user profile
            const userDocRef = doc(db as Firestore, 'users', user.uid);
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

      return () => {
        clearTimeout(loadingTimeout);
        unsubscribe();
      };
    } catch (error) {
      console.error('Firebase auth initialization error:', error);
      clearTimeout(loadingTimeout);
      setLoading(false); // Show content even if Firebase fails
    }
  }, []);

  const refreshProfile = async () => {
    if (!currentUser || !db) return;
    
    try {
      const profileDoc = await getDoc(doc(db as Firestore, 'users', currentUser.uid));
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    if (!auth || !db) throw new Error('Firebase not configured');
    
    const { user } = await createUserWithEmailAndPassword(auth as Auth, email, password);
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
    await setDoc(doc(db as Firestore, 'users', user.uid), newProfile);
    setUserProfile(newProfile);
  };

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    
    await signInWithEmailAndPassword(auth as Auth, email, password);
    if (currentUser && db) {
      await updateDoc(doc(db as Firestore, 'users', currentUser.uid), {
        lastLoginDate: serverTimestamp()
      });
    }
  };

  const loginWithGoogle = async () => {
    if (!auth || !db) throw new Error('Firebase not configured');
    
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth as Auth, provider);
    
    // Check if user profile exists
    const profileDoc = await getDoc(doc(db as Firestore, 'users', user.uid));
    
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
      await setDoc(doc(db as Firestore, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
    } else {
      // Update last login date
      await updateDoc(doc(db as Firestore, 'users', user.uid), {
        lastLoginDate: serverTimestamp()
      });
    }
  };

  const logout = () => {
    if (!auth) throw new Error('Firebase not configured');
    return signOut(auth as Auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !db) throw new Error('Firebase not configured or no user logged in');
    await updateDoc(doc(db as Firestore, 'users', currentUser.uid), data);
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