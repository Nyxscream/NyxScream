// User Service - Profile Management
import { db } from './firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('◉ Profile fetch failed:', error);
    return null;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
    return { success: true, message: 'Profile updated' };
  } catch (error) {
    console.error('◉ Profile update failed:', error);
    return { success: false, error: error.message };
  }
};

export const getUserWatchHistory = async (userId, limit = 20) => {
  try {
    const historyRef = collection(db, `users/${userId}/watchHistory`);
    const snapshot = await getDocs(historyRef);

    const history = [];
    snapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() });
    });

    // Sort by most recent first
    history.sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0));

    return history.slice(0, limit);
  } catch (error) {
    console.error('◉ Watch history fetch failed:', error);
    return [];
  }
};

export const getFollowers = async (userId) => {
  try {
    const followersRef = collection(db, `users/${userId}/followers`);
    const snapshot = await getDocs(followersRef);

    const followers = [];
    snapshot.forEach((doc) => {
      followers.push({ id: doc.id, ...doc.data() });
    });

    return followers;
  } catch (error) {
    console.error('◉ Followers fetch failed:', error);
    return [];
  }
};

export const getFollowing = async (userId) => {
  try {
    const followingRef = collection(db, `users/${userId}/following`);
    const snapshot = await getDocs(followingRef);

    const following = [];
    snapshot.forEach((doc) => {
      following.push({ id: doc.id, ...doc.data() });
    });

    return following;
  } catch (error) {
    console.error('◉ Following fetch failed:', error);
    return [];
  }
};

export const followUser = async (userId, targetUserId) => {
  try {
    const followingRef = collection(db, `users/${userId}/following`);
    await addDoc(followingRef, {
      targetUserId: targetUserId,
      followedAt: new Date()
    });

    // Add to target's followers
    const followersRef = collection(db, `users/${targetUserId}/followers`);
    await addDoc(followersRef, {
      followerUserId: userId,
      followedAt: new Date()
    });

    return { success: true, message: 'Following user' };
  } catch (error) {
    console.error('◉ Follow failed:', error);
    return { success: false, error: error.message };
  }
};

export const unfollowUser = async (userId, targetUserId) => {
  try {
    const followingRef = collection(db, `users/${userId}/following`);
    const q = query(followingRef, where('targetUserId', '==', targetUserId));
    const snapshot = await getDocs(q);

    snapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, { unfollowedAt: new Date(), active: false });
    });

    return { success: true, message: 'Unfollowed user' };
  } catch (error) {
    console.error('◉ Unfollow failed:', error);
    return { success: false, error: error.message };
  }
};

export const getFollowerCount = async (userId) => {
  try {
    const followers = await getFollowers(userId);
    return followers.length;
  } catch (error) {
    console.error('◉ Follower count fetch failed:', error);
    return 0;
  }
};

export const getUserStats = async (userId) => {
  try {
    const userProfile = await getUserProfile(userId);
    const followers = await getFollowerCount(userId);
    const watchHistory = await getUserWatchHistory(userId, 100);

    return {
      followers: followers,
      totalStreams: userProfile?.shadowProfile?.totalEchoes || 0,
      watchTime: userProfile?.shadowProfile?.totalWatchTime || 0,
      creatorTier: userProfile?.shadowProfile?.creatorTier || 'none'
    };
  } catch (error) {
    console.error('◉ Stats fetch failed:', error);
    return { followers: 0, totalStreams: 0, watchTime: 0, creatorTier: 'none' };
  }
};