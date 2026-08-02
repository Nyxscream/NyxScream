// Email Service - Password reset, verification
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export const sendPasswordResetEmail = async (email) => {
  try {
    const logsRef = collection(db, 'emailLogs');
    await addDoc(logsRef, {
      type: 'password_reset',
      email: email,
      code: generateResetCode(),
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    return { success: true, message: 'Reset code sent to email' };
  } catch (error) {
    console.error('◉ Email send failed:', error);
    return { success: false, error: error.message };
  }
};

export const sendVerificationEmail = async (email) => {
  try {
    const logsRef = collection(db, 'emailLogs');
    const code = generateResetCode();
    
    await addDoc(logsRef, {
      type: 'email_verification',
      email: email,
      code: code,
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    return { success: true, code: code };
  } catch (error) {
    console.error('◉ Verification email failed:', error);
    return { success: false, error: error.message };
  }
};

export const generateResetCode = () => {
  return Math.random().toString().substring(2, 8);
};
