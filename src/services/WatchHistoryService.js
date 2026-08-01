// Watch History Service - Viewing Tracking
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, orderBy } from 'firebase/firestore';

export const addToWatchHistory = async (userId, echoId, echoData) => {
  try {
    const historyRef = collection(db, `users/${userId}/watchHistory`);
    
    const docRef = await addDoc(historyRef, {
      echoId: echoId,
      title: echoData.title || 'Untitled',
      thumbnail: echoData.thumbnail || null,
      watchedAt: new Date(),
      progress: 0,
      duration: echoData.duration || 0,
      status: 'watching'
    });

    return { success: true, historyId: docRef.id };
  } catch (error) {
    console.error('◉ History add failed:', error);
    return { success: false, error: error.message };
  }
};

export const updateWatchProgress = async (userId, historyId, progress) => {
  try {
    const historyRef = doc(db, `users/${userId}/watchHistory`, historyId);
    await updateDoc(historyRef, {
      progress: progress,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Progress update failed:', error);
    return { success: false, error: error.message };
  }
};

export const getContinueWatching = async (userId, limit = 10) => {
  try {
    const historyRef = collection(db, `users/${userId}/watchHistory`);
    const q = query(historyRef, where('progress', '<', 100), orderBy('watchedAt', 'desc'));
    const snapshot = await getDocs(q);

    const items = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    return items.slice(0, limit);
  } catch (error) {
    console.error('◉ Continue watching fetch failed:', error);
    return [];
  }
};

export const getWatchHistory = async (userId, limit = 50) => {
  try {
    const historyRef = collection(db, `users/${userId}/watchHistory`);
    const snapshot = await getDocs(historyRef);

    const items = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    // Sort by most recent
    items.sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0));

    return items.slice(0, limit);
  } catch (error) {
    console.error('◉ History fetch failed:', error);
    return [];
  }
};

export const addToBookmarks = async (userId, echoId, echoData) => {
  try {
    const bookmarksRef = collection(db, `users/${userId}/bookmarks`);
    
    const docRef = await addDoc(bookmarksRef, {
      echoId: echoId,
      title: echoData.title || 'Untitled',
      thumbnail: echoData.thumbnail || null,
      bookmarkedAt: new Date(),
      category: echoData.category || 'general'
    });

    return { success: true, bookmarkId: docRef.id };
  } catch (error) {
    console.error('◉ Bookmark add failed:', error);
    return { success: false, error: error.message };
  }
};

export const getBookmarks = async (userId, limit = 50) => {
  try {
    const bookmarksRef = collection(db, `users/${userId}/bookmarks`);
    const snapshot = await getDocs(bookmarksRef);

    const items = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    // Sort by most recent
    items.sort((a, b) => (b.bookmarkedAt || 0) - (a.bookmarkedAt || 0));

    return items.slice(0, limit);
  } catch (error) {
    console.error('◉ Bookmarks fetch failed:', error);
    return [];
  }
};

export const removeFromBookmarks = async (userId, bookmarkId) => {
  try {
    const bookmarkRef = doc(db, `users/${userId}/bookmarks`, bookmarkId);
    await updateDoc(bookmarkRef, {
      removedAt: new Date(),
      active: false
    });

    return { success: true };
  } catch (error) {
    console.error('◉ Bookmark removal failed:', error);
    return { success: false, error: error.message };
  }
};

export const getWatchStats = async (userId) => {
  try {
    const history = await getWatchHistory(userId, 1000);
    
    const totalWatched = history.length;
    const totalMinutes = history.reduce((sum, item) => sum + (item.progress || 0), 0);
    const averageProgress = totalWatched > 0 ? Math.round(totalMinutes / totalWatched) : 0;

    return {
      totalWatched,
      totalMinutes,
      averageProgress
    };
  } catch (error) {
    console.error('◉ Watch stats fetch failed:', error);
    return { totalWatched: 0, totalMinutes: 0, averageProgress: 0 };
  }
};

export const clearWatchHistory = async (userId) => {
  try {
    const historyRef = collection(db, `users/${userId}/watchHistory`);
    const snapshot = await getDocs(historyRef);

    snapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        cleared: true,
        clearedAt: new Date()
      });
    });

    return { success: true, message: 'Watch history cleared' };
  } catch (error) {
    console.error('◉ History clear failed:', error);
    return { success: false, error: error.message };
  }
};