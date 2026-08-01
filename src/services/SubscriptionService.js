// Subscription Service - Tier Management
import { db } from './firebase';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';

const TIER_HIERARCHY = {
  none: { name: 'Free', price: 0, level: 0 },
  void: { name: 'Void', price: 6.99, level: 1 },
  shadow: { name: 'Shadow', price: 12.99, level: 2 },
  abyss: { name: 'Abyss', price: 19.99, level: 3 }
};

export const getUserSubscription = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    const userData = userSnap.data();
    const essenceTier = userData.essence?.tier || 'none';

    return {
      tier: essenceTier,
      status: userData.essence?.status || 'inactive',
      monthEnd: userData.essence?.moonCycleEnd || null,
      stripeId: userData.essence?.stripeEssenceId || null
    };
  } catch (error) {
    console.error('◉ Subscription fetch failed:', error);
    return null;
  }
};

export const hasAccessToTier = (userTier, requiredTier) => {
  const userLevel = TIER_HIERARCHY[userTier]?.level || 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier]?.level || 0;
  return userLevel >= requiredLevel;
};

export const upgradeSubscription = async (userId, newTier) => {
  try {
    const userRef = doc(db, 'users', userId);
    const currentSubscription = await getUserSubscription(userId);

    // Check if downgrading
    const currentLevel = TIER_HIERARCHY[currentSubscription?.tier]?.level || 0;
    const newLevel = TIER_HIERARCHY[newTier]?.level || 0;

    if (newLevel < currentLevel) {
      return { success: false, error: 'Cannot downgrade subscription' };
    }

    // Update subscription
    await updateDoc(userRef, {
      'essence.tier': newTier,
      'essence.status': 'active',
      'essence.moonCycleEnd': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    });

    // Log upgrade
    const logsRef = collection(db, `users/${userId}/subscriptionLogs`);
    await addDoc(logsRef, {
      action: 'upgrade',
      fromTier: currentSubscription?.tier || 'none',
      toTier: newTier,
      timestamp: new Date()
    });

    return { success: true, message: `Upgraded to ${TIER_HIERARCHY[newTier].name}` };
  } catch (error) {
    console.error('◉ Upgrade failed:', error);
    return { success: false, error: error.message };
  }
};

export const cancelSubscription = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'essence.tier': 'none',
      'essence.status': 'cancelled',
      'essence.cancelledAt': new Date(),
      updatedAt: new Date()
    });

    return { success: true, message: 'Subscription cancelled' };
  } catch (error) {
    console.error('◉ Cancellation failed:', error);
    return { success: false, error: error.message };
  }
};

export const getTierBenefits = (tier) => {
  const benefits = {
    none: {
      adSupported: true,
      resolution: '720p',
      devices: 1,
      offline: false
    },
    void: {
      adSupported: true,
      resolution: '720p',
      devices: 1,
      offline: false
    },
    shadow: {
      adSupported: false,
      resolution: '1080p',
      devices: 2,
      offline: true
    },
    abyss: {
      adSupported: false,
      resolution: '4K HDR',
      devices: 4,
      offline: true,
      dolbyAtmos: true,
      earlyAccess: true
    }
  };

  return benefits[tier] || benefits.none;
};

export const checkSubscriptionExpiry = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    const userData = userSnap.data();
    const moonCycleEnd = userData.essence?.moonCycleEnd;

    if (!moonCycleEnd) return { status: 'inactive' };

    const now = new Date();
    const endDate = new Date(moonCycleEnd);

    if (now > endDate) {
      // Subscription expired
      await updateDoc(userRef, {
        'essence.status': 'expired',
        'essence.tier': 'none'
      });
      return { status: 'expired' };
    }

    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    return { status: 'active', daysRemaining };
  } catch (error) {
    console.error('◉ Expiry check failed:', error);
    return null;
  }
};

export const renewSubscription = async (userId, tier) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'essence.tier': tier,
      'essence.status': 'active',
      'essence.moonCycleEnd': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    });

    return { success: true, message: 'Subscription renewed' };
  } catch (error) {
    console.error('◉ Renewal failed:', error);
    return { success: false, error: error.message };
  }
};