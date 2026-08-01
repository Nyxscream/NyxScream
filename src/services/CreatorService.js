// Creator Service - Stream & Creator Management
import { db } from './firebase';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getMuxStreamStatus } from './MuxService';

export const createStream = async (userId, streamData) => {
  try {
    const streamsRef = collection(db, `users/${userId}/streams`);
    const docRef = await addDoc(streamsRef, {
      title: streamData.title,
      description: streamData.description,
      category: streamData.category,
      visibility: streamData.visibility || 'theVoid',
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
      viewers: 0,
      likes: 0,
      comments: 0,
      duration: 0
    });

    return { success: true, streamId: docRef.id };
  } catch (error) {
    console.error('◉ Stream creation failed:', error);
    return { success: false, error: error.message };
  }
};

export const goLive = async (userId, streamId) => {
  try {
    const streamRef = doc(db, `users/${userId}/streams`, streamId);
    await updateDoc(streamRef, {
      status: 'echoing',
      liveAt: new Date(),
      isScreaming: true
    });

    // Update user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'shadowProfile.isScreaming': true
    });

    return { success: true, message: 'Stream live' };
  } catch (error) {
    console.error('◉ Go live failed:', error);
    return { success: false, error: error.message };
  }
};

export const endStream = async (userId, streamId) => {
  try {
    const streamRef = doc(db, `users/${userId}/streams`, streamId);
    await updateDoc(streamRef, {
      status: 'ended',
      endedAt: new Date(),
      isScreaming: false
    });

    // Update user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'shadowProfile.isScreaming': false
    });

    return { success: true, message: 'Stream ended' };
  } catch (error) {
    console.error('◉ End stream failed:', error);
    return { success: false, error: error.message };
  }
};

export const getCreatorStreams = async (userId, limit = 20) => {
  try {
    const streamsRef = collection(db, `users/${userId}/streams`);
    const snapshot = await getDocs(streamsRef);

    const streams = [];
    snapshot.forEach((doc) => {
      streams.push({ id: doc.id, ...doc.data() });
    });

    streams.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return streams.slice(0, limit);
  } catch (error) {
    console.error('◉ Streams fetch failed:', error);
    return [];
  }
};

export const updateStreamMetrics = async (userId, streamId, metrics) => {
  try {
    const streamRef = doc(db, `users/${userId}/streams`, streamId);
    await updateDoc(streamRef, {
      viewers: metrics.viewers || 0,
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      duration: metrics.duration || 0,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Metrics update failed:', error);
    return { success: false, error: error.message };
  }
};

export const getCreatorEarnings = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    const userData = userSnap.data();
    return {
      totalEarnings: userData.shadowProfile?.totalEarnings || 0,
      voidAds: userData.shadowProfile?.tributes?.voidAds || 0,
      shadowSubs: userData.shadowProfile?.tributes?.shadowSubs || 0,
      echoTips: userData.shadowProfile?.tributes?.echoTips || 0
    };
  } catch (error) {
    console.error('◉ Earnings fetch failed:', error);
    return null;
  }
};

export const getCreatorDashboard = async (userId) => {
  try {
    const userProfile = await getDoc(doc(db, 'users', userId));
    const streams = await getCreatorStreams(userId);
    const earnings = await getCreatorEarnings(userId);

    if (!userProfile.exists()) return null;

    return {
      profile: userProfile.data(),
      recentStreams: streams.slice(0, 5),
      earnings: earnings,
      totalStreams: streams.length
    };
  } catch (error) {
    console.error('◉ Dashboard fetch failed:', error);
    return null;
  }
};

export const getCreatorTier = (userData) => {
  const totalEchoes = userData?.shadowProfile?.totalEchoes || 0;
  const shadowCount = userData?.shadowProfile?.shadowCount || 0;
  const totalEarnings = userData?.shadowProfile?.totalEarnings || 0;

  if (shadowCount >= 10000 && totalEchoes >= 100 && totalEarnings >= 1000) {
    return 'scream';
  } else if (shadowCount >= 1000 && totalEchoes >= 50 && totalEarnings >= 100) {
    return 'echo';
  } else if (shadowCount >= 100 || totalEchoes >= 10) {
    return 'whisper';
  }
  return 'none';
};

export const updateCreatorProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'shadowProfile.channelName': updates.channelName || '',
      'shadowProfile.whisper': updates.whisper || '',
      updatedAt: new Date()
    });

    return { success: true, message: 'Profile updated' };
  } catch (error) {
    console.error('◉ Creator profile update failed:', error);
    return { success: false, error: error.message };
  }
};