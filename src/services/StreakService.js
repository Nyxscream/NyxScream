// Streak Service - Track daily engagement for 90-day monetization requirement
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export const recordDailyActivity = async (userId) => {
  try {
    const today = new Date().toDateString();
    
    // Check if already recorded today
    const streakRef = collection(db, `users/${userId}/dailyActivity`);
    const q = query(streakRef, where('date', '==', today));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return { status: 'already_recorded', message: 'Activity already recorded today' };
    }
    
    // Record today's activity
    await addDoc(streakRef, {
      date: today,
      timestamp: serverTimestamp(),
      activity: 'login',
      points: 1
    });
    
    return { status: 'recorded', message: 'Daily activity recorded!' };
  } catch (error) {
    console.error('◉ Daily activity recording failed:', error);
    return { status: 'error', message: error.message };
  }
};

export const getStreakDays = async (userId) => {
  try {
    const streakRef = collection(db, `users/${userId}/dailyActivity`);
    const snapshot = await getDocs(streakRef);
    
    if (snapshot.empty) return 0;
    
    const activities = [];
    snapshot.forEach((doc) => {
      activities.push(doc.data());
    });
    
    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Count consecutive days
    let streakCount = 0;
    let expectedDate = new Date();
    
    for (let activity of activities) {
      const activityDate = new Date(activity.date);
      const daysDiff = Math.floor((expectedDate - activityDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        streakCount++;
        expectedDate = new Date(activityDate);
      } else {
        break;
      }
    }
    
    return streakCount;
  } catch (error) {
    console.error('◉ Streak calculation failed:', error);
    return 0;
  }
};

export const getStreakStatus = async (userId) => {
  try {
    const streakDays = await getStreakDays(userId);
    const canMonetize = streakDays >= 90;
    
    const daysRemaining = Math.max(0, 90 - streakDays);
    
    return {
      currentStreak: streakDays,
      canMonetize: canMonetize,
      daysRemaining: daysRemaining,
      percentage: Math.round((streakDays / 90) * 100),
      status: canMonetize ? 'MONETIZATION UNLOCKED' : `${daysRemaining} days until monetization`,
      badge: canMonetize ? '✨ VERIFIED CREATOR' : '🌑 BUILDING STREAK'
    };
  } catch (error) {
    console.error('◉ Streak status failed:', error);
    return null;
  }
};

export const resetStreakIfMissedDay = async (userId) => {
  try {
    const lastActivityRef = collection(db, `users/${userId}/dailyActivity`);
    const snapshot = await getDocs(lastActivityRef);
    
    if (snapshot.empty) return { reset: false, message: 'No activity recorded' };
    
    let lastActivity = null;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!lastActivity || new Date(data.date) > new Date(lastActivity.date)) {
        lastActivity = data;
      }
    });
    
    const lastActivityDate = new Date(lastActivity.date);
    const today = new Date();
    const daysSinceLast = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLast > 1) {
      // Streak broken - update user
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        streakBroken: true,
        streakBrokenAt: new Date(),
        previousStreak: await getStreakDays(userId)
      });
      return { reset: true, message: 'Streak broken - missed a day!' };
    }
    
    return { reset: false, message: 'Streak active' };
  } catch (error) {
    console.error('◉ Streak reset check failed:', error);
    return { reset: false, error: error.message };
  }
};

export const getStreakHistory = async (userId) => {
  try {
    const streakRef = collection(db, `users/${userId}/dailyActivity`);
    const snapshot = await getDocs(streakRef);
    
    const history = [];
    snapshot.forEach((doc) => {
      history.push(doc.data());
    });
    
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return history;
  } catch (error) {
    console.error('◉ Streak history fetch failed:', error);
    return [];
  }
};

export const getMonetizationStatus = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
    
    if (userSnap.empty) return { eligible: false, reason: 'User not found' };
    
    const userData = userSnap.docs[0].data();
    
    // Check Academy
    if (!userData.academyCompleted) {
      return { eligible: false, reason: 'Complete NYX Academy first' };
    }
    
    // Check 90-day streak
    const streakStatus = await getStreakStatus(userId);
    if (!streakStatus.canMonetize) {
      return { 
        eligible: false, 
        reason: `${streakStatus.daysRemaining} days remaining in streak requirement`,
        progress: streakStatus.percentage
      };
    }
    
    return { 
      eligible: true, 
      reason: 'Ready to monetize!',
      message: 'Your account is eligible for monetization'
    };
  } catch (error) {
    console.error('◉ Monetization status check failed:', error);
    return { eligible: false, reason: error.message };
  }
};