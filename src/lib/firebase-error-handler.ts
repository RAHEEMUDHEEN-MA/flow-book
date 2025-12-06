import { FirebaseError } from 'firebase/app';

export interface FirebaseErrorInfo {
  title: string;
  message: string;
  action?: string;
}

export function getFirebaseErrorInfo(error: unknown): FirebaseErrorInfo {
  if (!(error instanceof FirebaseError)) {
    return {
      title: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  switch (error.code) {
    case 'auth/invalid-api-key':
      return {
        title: 'Configuration Error',
        message: 'Firebase API key is invalid or missing. Please check your environment variables.',
        action: 'Contact support or check your .env file',
      };

    case 'auth/network-request-failed':
      return {
        title: 'Network Error',
        message: 'Unable to connect to Firebase. Please check your internet connection.',
        action: 'Try again',
      };

    case 'auth/too-many-requests':
      return {
        title: 'Too Many Requests',
        message: 'Too many failed attempts. Please try again later.',
        action: 'Wait a few minutes',
      };

    case 'auth/user-not-found':
      return {
        title: 'User Not Found',
        message: 'No account found with this email address.',
        action: 'Sign up instead',
      };

    case 'auth/wrong-password':
      return {
        title: 'Invalid Credentials',
        message: 'The password you entered is incorrect.',
        action: 'Try again or reset password',
      };

    case 'auth/email-already-in-use':
      return {
        title: 'Email Already Registered',
        message: 'An account with this email already exists.',
        action: 'Sign in instead',
      };

    case 'auth/weak-password':
      return {
        title: 'Weak Password',
        message: 'Password should be at least 6 characters.',
        action: 'Choose a stronger password',
      };

    case 'auth/invalid-email':
      return {
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        action: 'Check your email format',
      };

    case 'auth/operation-not-allowed':
      return {
        title: 'Operation Not Allowed',
        message: 'This sign-in method is not enabled.',
        action: 'Contact support',
      };

    case 'auth/popup-blocked':
      return {
        title: 'Popup Blocked',
        message: 'Sign-in popup was blocked by your browser.',
        action: 'Allow popups and try again',
      };

    case 'auth/popup-closed-by-user':
      return {
        title: 'Sign-in Cancelled',
        message: 'You closed the sign-in window.',
        action: 'Try again',
      };

    case 'permission-denied':
      return {
        title: 'Permission Denied',
        message: 'You do not have permission to access this resource.',
        action: 'Sign in or contact support',
      };

    case 'unavailable':
      return {
        title: 'Service Unavailable',
        message: 'Firebase service is temporarily unavailable.',
        action: 'Try again in a moment',
      };

    default:
      return {
        title: 'Error',
        message: error.message || 'An error occurred. Please try again.',
        action: 'Try again',
      };
  }
}

export function logFirebaseError(error: unknown, context?: string): void {
  const errorInfo = getFirebaseErrorInfo(error);
  console.error(`[Firebase Error${context ? ` - ${context}` : ''}]:`, {
    ...errorInfo,
    originalError: error,
  });
}
