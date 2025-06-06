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
  if (!error || !error.code) {
    return 'An unexpected error occurred. Please try again.';
  }

  switch (error.code) {
    // Email/Password errors
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    
    // Google Auth errors
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups and try again.';
    case 'auth/popup-closed-by-user':
      return 'Authentication was cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Another authentication request is in progress. Please wait and try again.';
    
    // Microsoft Auth specific errors
    case 'auth/invalid-credential':
      if (error.message && error.message.includes('microsoft.com')) {
        return 'Microsoft authentication is not properly configured. Please contact support.';
      }
      return 'Authentication failed. Please try again.';
    case 'auth/microsoft-oauth-error':
      return 'Microsoft authentication failed. Please try again or use a different sign-in method.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials. Please try signing in with your original method.';
    
    // Generic OAuth errors
    case 'auth/oauth-error':
      return 'Authentication service error. Please try again later.';
    case 'auth/invalid-oauth-provider':
      return 'Authentication provider configuration error. Please contact support.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for authentication.';
    
    // Firestore errors
    case 'firestore/permission-denied':
      return 'Permission denied. Please make sure you are signed in.';
    case 'firestore/unavailable':
      return 'Service is temporarily unavailable. Please try again.';
    
    default:
      console.error('Unhandled auth error:', error);
      // Check if it's a Microsoft-specific error based on message content
      if (error.message && (
        error.message.includes('AADSTS') || 
        error.message.includes('microsoft.com') ||
        error.message.includes('Invalid client secret')
      )) {
        return 'Microsoft authentication configuration error. Please contact support or try a different sign-in method.';
      }
      return 'Authentication failed. Please try again or contact support if the problem persists.';
  }
}; 