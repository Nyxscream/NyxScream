// Analytics Service - Stream & User Analytics
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export const trackStreamView = async (userId, streamId, duration) => {
  try {
    const analyticsRef = collection(db, 'analytics/streams/views');
    await addDoc(analyticsRef, {
      userId: userId,
      streamId: streamId,
      duration: duration,
      viewedAt: new Date(),
      timestamp: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('◉ View tracking failed:', error);
    return { success: false, error: error.message };
  }
};

export const trackEngagement = async (streamId, userId, action, value = 1) => {
  try {
    const engagementRef = collection(db, 'analytics/engagement');
    await addDoc(engagementRef, {
      streamId: streamId,
      userId: userId,
      action: action, // 'like', 'comment', 'share', 'tip'
      value: value,
      timestamp: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Engagement tracking failed:', error);
    return { success: false, error: error.message };
  }
};

export const getStreamAnalytics = async (streamId) => {
  try {
    const viewsRef = collection(db, 'analytics/streams/views');
    const q = query(viewsRef, where('streamId', '==', streamId));
    const snapshot = await getDocs(q);

    let totalViews = 0;
    let totalWatchTime = 0;
    const uniqueViewers = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalViews++;
      totalWatchTime += data.duration || 0;
      uniqueViewers.add(data.userId);
    });

    return {
      totalViews: totalViews,
      uniqueViewers: uniqueViewers.size,
      totalWatchTime: Math.round(totalWatchTime / 60), // Convert to minutes
      averageWatchTime: uniqueViewers.size > 0 ? Math.round(totalWatchTime / uniqueViewers.size / 60) : 0
    };
  } catch (error) {
    console.error('◉ Analytics fetch failed:', error);
    return { totalViews: 0, uniqueViewers: 0, totalWatchTime: 0, averageWatchTime: 0 };
  }
};

export const getUserAnalytics = async (userId) => {
  try {
    const viewsRef = collection(db, 'analytics/streams/views');
    const q = query(viewsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    let totalWatchTime = 0;
    let streamCount = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalWatchTime += data.duration || 0;
      streamCount.add(data.streamId);
    });

    return {
      totalStreamsWatched: streamCount.size,
      totalWatchTime: Math.round(totalWatchTime / 60),
      averageWatchTime: streamCount.size > 0 ? Math.round(totalWatchTime / streamCount.size / 60) : 0
    };
  } catch (error) {
    console.error('◉ User analytics fetch failed:', error);
    return { totalStreamsWatched: 0, totalWatchTime: 0, averageWatchTime: 0 };
  }
};

export const getCreatorAnalytics = async (creatorId, streams) => {
  try {
    let totalViews = 0;
    let totalEngagement = 0;
    let uniqueViewers = new Set();

    // Get views for all creator's streams
    for (const stream of streams) {
      const analytics = await getStreamAnalytics(stream.id);
      totalViews += analytics.totalViews;
      uniqueViewers.add(...Array.from(analytics.uniqueViewers || []));
    }

    // Get engagement
    const engagementRef = collection(db, 'analytics/engagement');
    const q = query(engagementRef, where('streamId', 'in', streams.map(s => s.id)));
    const engSnapshot = await getDocs(q);
    totalEngagement = engSnapshot.size;

    return {
      totalViews: totalViews,
      totalEngagement: totalEngagement,
      uniqueViewers: uniqueViewers.size,
      averageViewsPerStream: streams.length > 0 ? Math.round(totalViews / streams.length) : 0
    };
  } catch (error) {
    console.error('◉ Creator analytics fetch failed:', error);
    return { totalViews: 0, totalEngagement: 0, uniqueViewers: 0, averageViewsPerStream: 0 };
  }
};

export const trackRevenue = async (creatorId, amount, source, metadata = {}) => {
  try {
    const revenueRef = collection(db, 'analytics/revenue');
    await addDoc(revenueRef, {
      creatorId: creatorId,
      amount: amount,
      source: source, // 'ads', 'subs', 'tips'
      metadata: metadata,
      timestamp: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Revenue tracking failed:', error);
    return { success: false, error: error.message };
  }
};

export const getRevenueAnalytics = async (creatorId) => {
  try {
    const revenueRef = collection(db, 'analytics/revenue');
    const q = query(revenueRef, where('creatorId', '==', creatorId));
    const snapshot = await getDocs(q);

    let totalRevenue = 0;
    const revenueBySource = { ads: 0, subs: 0, tips: 0 };

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalRevenue += data.amount || 0;
      if (data.source && revenueBySource.hasOwnProperty(data.source)) {
        revenueBySource[data.source] += data.amount || 0;
      }
    });

    return {
      totalRevenue: totalRevenue,
      revenueBySource: revenueBySource,
      topSource: Object.keys(revenueBySource).reduce((a, b) => 
        revenueBySource[a] > revenueBySource[b] ? a : b
      )
    };
  } catch (error) {
    console.error('◉ Revenue analytics fetch failed:', error);
    return { totalRevenue: 0, revenueBySource: { ads: 0, subs: 0, tips: 0 }, topSource: 'ads' };
  }
};