// Moderation Service - Toxicity Detection & Shadowbanning
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const TOXICITY_THRESHOLD = 0.7; // 70% confidence = flag message
const TOXIC_KEYWORDS = ['hate', 'kill', 'die', 'stupid', 'idiot', 'abuse', 'spam'];

export const checkMessageToxicity = async (message) => {
  try {
    let toxicityScore = 0;
    const lowerMessage = message.toLowerCase();

    // Simple keyword check
    TOXIC_KEYWORDS.forEach((keyword) => {
      if (lowerMessage.includes(keyword)) {
        toxicityScore += 0.3;
      }
    });

    // Check for excessive caps
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (capsRatio > 0.7) {
      toxicityScore += 0.2;
    }

    // Check for repeated characters
    if (/(.)\1{4,}/.test(message)) {
      toxicityScore += 0.15;
    }

    // Clamp score between 0 and 1
    toxicityScore = Math.min(toxicityScore, 1);

    return {
      score: toxicityScore,
      isToxic: toxicityScore >= TOXICITY_THRESHOLD,
      severity: toxicityScore > 0.8 ? 'high' : toxicityScore > 0.5 ? 'medium' : 'low'
    };
  } catch (error) {
    console.error('◉ Toxicity check failed:', error);
    return { score: 0, isToxic: false, severity: 'low' };
  }
};

export const shadowbanUser = async (userId, reason = 'toxicity') => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      shadowbanned: true,
      shadowbanReason: reason,
      shadowbanDate: new Date(),
      visible: false
    });

    // Log shadowban
    const logsRef = collection(db, 'moderationLogs');
    await addDoc(logsRef, {
      action: 'shadowban',
      userId: userId,
      reason: reason,
      timestamp: new Date(),
      status: 'active'
    });

    return { success: true, message: '◉ User shadowbanned' };
  } catch (error) {
    console.error('◉ Shadowban failed:', error);
    return { success: false, error: error.message };
  }
};

export const hideToxicMessage = async (messageId, streamId) => {
  try {
    const messageRef = doc(db, `streams/${streamId}/messages`, messageId);
    await updateDoc(messageRef, {
      hidden: true,
      hiddenReason: 'toxicity_detected',
      hiddenAt: new Date()
    });

    return { success: true, message: '◉ Message hidden from other users' };
  } catch (error) {
    console.error('◉ Hide message failed:', error);
    return { success: false, error: error.message };
  }
};

export const issueWarning = async (userId, reason) => {
  try {
    const warningsRef = collection(db, `users/${userId}/warnings`);
    await addDoc(warningsRef, {
      reason: reason,
      issuedAt: new Date(),
      status: 'active'
    });

    // Log warning
    const logsRef = collection(db, 'moderationLogs');
    await addDoc(logsRef, {
      action: 'warning',
      userId: userId,
      reason: reason,
      timestamp: new Date(),
      status: 'active'
    });

    return { success: true, message: '◉ Warning issued' };
  } catch (error) {
    console.error('◉ Warning issue failed:', error);
    return { success: false, error: error.message };
  }
};

export const getUserWarnings = async (userId) => {
  try {
    const warningsRef = collection(db, `users/${userId}/warnings`);
    const q = query(warningsRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);

    const warnings = [];
    snapshot.forEach((doc) => {
      warnings.push({ id: doc.id, ...doc.data() });
    });

    return warnings;
  } catch (error) {
    console.error('◉ Warnings fetch failed:', error);
    return [];
  }
};

export const isShadowbanned = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));

    if (userSnap.empty) return false;

    const userData = userSnap.docs[0].data();
    return userData.shadowbanned === true;
  } catch (error) {
    console.error('◉ Shadowban check failed:', error);
    return false;
  }
};