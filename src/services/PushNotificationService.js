// Push Notification Service
import * as Notifications from 'expo-notifications';
import { db } from './firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const initializePushNotifications = async (userId) => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { success: false, error: 'Permission denied' };
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Save token to user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      expoPushToken: token,
      pushNotificationsEnabled: true,
      updatedAt: new Date()
    });

    return { success: true, token: token };
  } catch (error) {
    console.error('◉ Push notification init failed:', error);
    return { success: false, error: error.message };
  }
};

export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: 'default',
        badge: 1
      },
      trigger: { seconds: 1 }
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Local notification failed:', error);
    return { success: false, error: error.message };
  }
};

export const sendCreatorLiveNotification = async (creatorName, streamTitle) => {
  return sendLocalNotification(
    `${creatorName} is now LIVE!`,
    streamTitle,
    { type: 'creator_live', creatorName, streamTitle }
  );
};

export const sendNewContentNotification = async (creatorName, contentTitle) => {
  return sendLocalNotification(
    `New content from ${creatorName}`,
    contentTitle,
    { type: 'new_content', creatorName, contentTitle }
  );
};

export const sendTributeNotification = async (tipper, amount) => {
  return sendLocalNotification(
    `💜 You received a tribute!`,
    `${tipper} sent $${amount}`,
    { type: 'tribute', tipper, amount }
  );
};

export const sendChatMentionNotification = async (mentioner, streamTitle) => {
  return sendLocalNotification(
    `@${mentioner} mentioned you`,
    `in ${streamTitle}`,
    { type: 'chat_mention', mentioner, streamTitle }
  );
};

export const disablePushNotifications = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pushNotificationsEnabled: false,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Disable notifications failed:', error);
    return { success: false, error: error.message };
  }
};

export const setPushNotificationCategories = async (userId, categories) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'pushNotificationPreferences.creatorLive': categories.includes('creatorLive'),
      'pushNotificationPreferences.newContent': categories.includes('newContent'),
      'pushNotificationPreferences.tributes': categories.includes('tributes'),
      'pushNotificationPreferences.mentions': categories.includes('mentions'),
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Set categories failed:', error);
    return { success: false, error: error.message };
  }
};
