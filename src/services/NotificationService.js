// Notification Service - Push & In-App Notifications
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

export const setNotificationPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      notificationPreferences: {
        creatorLive: preferences.creatorLive !== false,
        premiumContent: preferences.premiumContent !== false,
        chatMention: preferences.chatMention !== false,
        subscriptionReminder: preferences.subscriptionReminder !== false,
        weeklyDigest: preferences.weeklyDigest !== false
      },
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Preferences update failed:', error);
    return { success: false, error: error.message };
  }
};

export const getNotificationPreferences = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));

    if (userSnap.empty) return null;

    return userSnap.docs[0].data().notificationPreferences || {};
  } catch (error) {
    console.error('◉ Preferences fetch failed:', error);
    return {};
  }
};

export const notifyCreatorGoesLive = async (creatorId, creatorName, followers) => {
  try {
    const notification = {
      type: 'creator_live',
      title: `${creatorName} is now streaming!`,
      message: 'Join the scream',
      creatorId: creatorId,
      createdAt: new Date(),
      read: false
    };

    // Send to all followers
    followers.forEach(async (follower) => {
      const notifRef = collection(db, `users/${follower.followerUserId}/notifications`);
      await addDoc(notifRef, notification);
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Live notification failed:', error);
    return { success: false, error: error.message };
  }
};

export const notifyNewPremiumContent = async (creatorId, contentTitle, subscriberIds) => {
  try {
    const notification = {
      type: 'premium_content',
      title: 'New premium content available',
      message: contentTitle,
      creatorId: creatorId,
      createdAt: new Date(),
      read: false
    };

    subscriberIds.forEach(async (userId) => {
      const notifRef = collection(db, `users/${userId}/notifications`);
      await addDoc(notifRef, notification);
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Content notification failed:', error);
    return { success: false, error: error.message };
  }
};

export const notifyChatMention = async (userId, mentionerName, streamId) => {
  try {
    const notifRef = collection(db, `users/${userId}/notifications`);
    await addDoc(notifRef, {
      type: 'chat_mention',
      title: `${mentionerName} mentioned you`,
      message: 'Tap to view',
      streamId: streamId,
      createdAt: new Date(),
      read: false
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Mention notification failed:', error);
    return { success: false, error: error.message };
  }
};

export const sendSubscriptionReminder = async (userId, daysRemaining) => {
  try {
    const notifRef = collection(db, `users/${userId}/notifications`);
    await addDoc(notifRef, {
      type: 'subscription_reminder',
      title: 'Your subscription expires soon',
      message: `${daysRemaining} days remaining`,
      createdAt: new Date(),
      read: false
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Reminder notification failed:', error);
    return { success: false, error: error.message };
  }
};

export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const notifRef = collection(db, `users/${userId}/notifications`);
    const snapshot = await getDocs(notifRef);

    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    // Sort by newest first
    notifications.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return notifications.slice(0, limit);
  } catch (error) {
    console.error('◉ Notifications fetch failed:', error);
    return [];
  }
};

export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const notifRef = doc(db, `users/${userId}/notifications`, notificationId);
    await updateDoc(notifRef, {
      read: true,
      readAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Mark read failed:', error);
    return { success: false, error: error.message };
  }
};

export const clearAllNotifications = async (userId) => {
  try {
    const notifRef = collection(db, `users/${userId}/notifications`);
    const snapshot = await getDocs(notifRef);

    snapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        cleared: true,
        clearedAt: new Date()
      });
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Clear all failed:', error);
    return { success: false, error: error.message };
  }
};

export const getUnreadCount = async (userId) => {
  try {
    const notifRef = collection(db, `users/${userId}/notifications`);
    const q = query(notifRef, where('read', '==', false));
    const snapshot = await getDocs(q);

    return snapshot.size;
  } catch (error) {
    console.error('◉ Unread count fetch failed:', error);
    return 0;
  }
};