// Moderator Decision Service - Human makes final call
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

export const reviewAIFlag = async (flagId, moderatorDecision) => {
  try {
    const { action, reason, duration } = moderatorDecision;
    // action: 'approve_ban', 'approve_warning', 'dismiss', 'false_positive'

    const decisionRef = collection(db, 'moderatorDecisions');
    await addDoc(decisionRef, {
      flagId: flagId,
      decision: action,
      reason: reason,
      decidedAt: new Date(),
      decidedBy: 'MODERATOR_ID', // Replace with actual moderator ID
      duration: duration || null
    });

    // Update flag status
    const flagRef = doc(db, 'aiFlags', flagId);
    await updateDoc(flagRef, {
      status: 'reviewed',
      moderatorAction: action
    });

    // Execute action based on decision
    if (action === 'approve_ban') {
      await executeUserBan(flagId, duration, reason);
    } else if (action === 'approve_warning') {
      await warnUser(flagId, reason);
    } else if (action === 'false_positive') {
      await logFalsePositive(flagId);
    }

    return { success: true, message: `Action: ${action}` };
  } catch (error) {
    console.error('◉ Review flag failed:', error);
    return { success: false, error: error.message };
  }
};

const executeUserBan = async (flagId, duration, reason) => {
  console.log(`🚫 BAN USER - Duration: ${duration}, Reason: ${reason}`);
  // Implementation
};

const warnUser = async (flagId, reason) => {
  console.log(`⚠️ WARN USER - Reason: ${reason}`);
  // Implementation
};

const logFalsePositive = async (flagId) => {
  try {
    const falsePositivesRef = collection(db, 'falsePositives');
    await addDoc(falsePositivesRef, {
      flagId: flagId,
      loggedAt: new Date(),
      reason: 'Moderator determined flag was incorrect'
    });

    console.log('📊 False positive logged - AI model will learn from this');
  } catch (error) {
    console.error('◉ Log false positive failed:', error);
  }
};

export const getModeratorQueue = async () => {
  try {
    // Get all pending flags for moderators to review
    return { success: true };
  } catch (error) {
    console.error('◉ Get queue failed:', error);
    return { success: false, error: error.message };
  }
};

export const assignFlagToModerator = async (flagId, moderatorId) => {
  try {
    const flagRef = doc(db, 'aiFlags', flagId);
    await updateDoc(flagRef, {
      assignedTo: moderatorId,
      assignedAt: new Date(),
      status: 'in_review'
    });

    return { success: true, message: 'Flag assigned' };
  } catch (error) {
    console.error('◉ Assign flag failed:', error);
    return { success: false, error: error.message };
  }
};
