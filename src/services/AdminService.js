// Admin Service - Monitor & manage platform
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export const banUser = async (userId, reason, duration = 'permanent') => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'banned',
      bannedReason: reason,
      bannedAt: new Date(),
      banDuration: duration,
      bannedUntil: duration === 'permanent' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Log action
    await logAdminAction('ban_user', userId, reason);

    return { success: true, message: `User ${userId} banned` };
  } catch (error) {
    console.error('◉ Ban user failed:', error);
    return { success: false, error: error.message };
  }
};

export const unbanUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'active',
      bannedReason: null,
      bannedAt: null
    });

    await logAdminAction('unban_user', userId, 'User unbanned');

    return { success: true, message: `User ${userId} unbanned` };
  } catch (error) {
    console.error('◉ Unban user failed:', error);
    return { success: false, error: error.message };
  }
};

export const removeContent = async (contentId, reason) => {
  try {
    const videoRef = doc(db, 'videos', contentId);
    await updateDoc(videoRef, {
      status: 'removed',
      removalReason: reason,
      removedAt: new Date()
    });

    await logAdminAction('remove_content', contentId, reason);

    return { success: true, message: 'Content removed' };
  } catch (error) {
    console.error('◉ Remove content failed:', error);
    return { success: false, error: error.message };
  }
};

export const getReportedContent = async () => {
  try {
    const reportsRef = collection(db, 'reportedContent');
    const q = query(reportsRef, where('status', '==', 'pending'));
    const snapshot = await getDocs(q);

    const reports = [];
    snapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, reports };
  } catch (error) {
    console.error('◉ Get reports failed:', error);
    return { success: false, error: error.message };
  }
};

export const resolveReport = async (reportId, action, reason) => {
  try {
    const reportRef = doc(db, 'reportedContent', reportId);
    await updateDoc(reportRef, {
      status: 'resolved',
      action: action, // 'removed', 'warned', 'banned', 'dismissed'
      resolvedAt: new Date(),
      resolutionReason: reason
    });

    await logAdminAction('resolve_report', reportId, reason);

    return { success: true, message: 'Report resolved' };
  } catch (error) {
    console.error('◉ Resolve report failed:', error);
    return { success: false, error: error.message };
  }
};

export const logAdminAction = async (action, targetId, details) => {
  try {
    const logsRef = collection(db, 'adminAuditLogs');
    await addDoc(logsRef, {
      action: action,
      targetId: targetId,
      details: details,
      timestamp: new Date(),
      adminId: 'SYSTEM' // Replace with actual admin ID
    });
  } catch (error) {
    console.error('◉ Log action failed:', error);
  }
};

export const getAuditLogs = async (limit = 50) => {
  try {
    const logsRef = collection(db, 'adminAuditLogs');
    const q = query(logsRef);
    const snapshot = await getDocs(q);

    const logs = [];
    snapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, logs: logs.slice(0, limit) };
  } catch (error) {
    console.error('◉ Get audit logs failed:', error);
    return { success: false, error: error.message };
  }
};

export const getBannedUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('status', '==', 'banned'));
    const snapshot = await getDocs(q);

    const bannedUsers = [];
    snapshot.forEach((doc) => {
      bannedUsers.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, bannedUsers };
  } catch (error) {
    console.error('◉ Get banned users failed:', error);
    return { success: false, error: error.message };
  }
};

export const getSystemStats = async () => {
  try {
    // Simulated stats - in production, use aggregation
    return {
      totalUsers: 12450,
      activeNow: 3847,
      totalCreators: 2156,
      liveNow: 127,
      reportedContent: 89,
      bannedUsers: 34
    };
  } catch (error) {
    console.error('◉ Get stats failed:', error);
    return null;
  }
};

export const warnUser = async (userId, reason) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      warnings: (Math.random() * 3) | 0, // Mock warning count
      lastWarningAt: new Date(),
      lastWarningReason: reason
    });

    await logAdminAction('warn_user', userId, reason);

    return { success: true, message: 'User warned' };
  } catch (error) {
    console.error('◉ Warn user failed:', error);
    return { success: false, error: error.message };
  }
};
