export const checkBrowserCompatibility = () => {
  const issues: string[] = [];
  
  // Check if popups are supported
  try {
    const popup = window.open('', '_blank', 'width=1,height=1');
    if (popup) {
      popup.close();
    } else {
      issues.push('Popup windows appear to be blocked');
    }
  } catch (error) {
    issues.push('Popup support test failed');
  }
  
  // Check storage availability
  try {
    const testKey = '__auth_test__';
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
  } catch (error) {
    issues.push('SessionStorage is not available');
  }
  
  try {
    const testKey = '__auth_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
  } catch (error) {
    issues.push('LocalStorage is not available');
  }
  
  // Check if third-party cookies are enabled
  const isThirdPartyCookiesDisabled = () => {
    try {
      // This is a simplified check
      return !navigator.cookieEnabled;
    } catch {
      return true;
    }
  };
  
  if (isThirdPartyCookiesDisabled()) {
    issues.push('Third-party cookies may be disabled');
  }
  
  return {
    isCompatible: issues.length === 0,
    issues
  };
};

export const getAuthErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error occurred';
  
  const errorCode = error.code || '';
  const errorMessage = error.message || '';
  
  // Firebase Auth error codes
  switch (errorCode) {
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/popup-closed-by-user':
      return 'Authentication was cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Another authentication request is already in progress.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    default:
      // Return the original message if it's user-friendly, otherwise a generic message
      if (errorMessage && errorMessage.length < 100 && !errorMessage.includes('Error:')) {
        return errorMessage;
      }
      return 'Authentication failed. Please try again.';
  }
}; 