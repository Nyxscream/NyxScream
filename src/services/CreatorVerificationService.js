// Creator Verification Service - Tick Mark System
import { db } from './firebase';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';

export const TICK_LEVELS = {
  GRAY: {
    level: 0,
    name: 'Unverified',
    icon: '⚪',
    color: '#6B6B6B',
    features: ['basic_streaming', 'basic_chat']
  },
  BLUE: {
    level: 1,
    name: 'Verified',
    icon: '🔵',
    color: '#00F0FF',
    features: ['basic_streaming', 'basic_chat', 'analytics', 'monetization_basic', 'custom_category']
  },
  YELLOW: {
    level: 2,
    name: 'Premium',
    icon: '🟡',
    color: '#FFD700',
    features: ['basic_streaming', 'basic_chat', 'analytics', 'monetization_basic', 'custom_category', 'premium_tools', 'advanced_analytics', 'early_features', 'custom_branding']
  },
  GOLDEN: {
    level: 3,
    name: 'Elite',
    icon: '✨',
    color: '#FFD700',
    features: ['all_features', 'priority_support', 'custom_partnership', 'revenue_share', 'merchandise_integration', 'nft_drop', 'collab_priority', 'vip_badge']
  }
};

export const getCreatorTick = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return TICK_LEVELS.GRAY;

    const userData = userSnap.data();
    const tickLevel = userData.creatorVerification?.tickLevel || 'GRAY';

    return TICK_LEVELS[tickLevel] || TICK_LEVELS.GRAY;
  } catch (error) {
    console.error('◉ Get tick failed:', error);
    return TICK_LEVELS.GRAY;
  }
};

export const requestVerification = async (userId, creatorData) => {
  try {
    const applicationsRef = collection(db, 'verificationApplications');
    
    await addDoc(applicationsRef, {
      userId: userId,
      creatorName: creatorData.name,
      channelDescription: creatorData.description,
      followers: creatorData.followers || 0,
      monthlyViews: creatorData.monthlyViews || 0,
      contentQuality: creatorData.contentQuality || 0,
      communityEngagement: creatorData.engagement || 0,
      status: 'pending',
      requestedAt: new Date(),
      decidedAt: null,
      verificationOfficer: null,
      notes: null
    });

    // Update user status
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'creatorVerification.applicationStatus': 'pending',
      'creatorVerification.appliedAt': new Date()
    });

    return { success: true, message: 'Application submitted' };
  } catch (error) {
    console.error('◉ Request verification failed:', error);
    return { success: false, error: error.message };
  }
};

export const approveVerification = async (userId, tickLevel) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'creatorVerification.tickLevel': tickLevel,
      'creatorVerification.verifiedAt': new Date(),
      'creatorVerification.applicationStatus': 'approved'
    });

    return { success: true, message: `Creator verified with ${TICK_LEVELS[tickLevel].name} tick` };
  } catch (error) {
    console.error('◉ Approve verification failed:', error);
    return { success: false, error: error.message };
  }
};

export const hasFeatureAccess = async (userId, feature) => {
  try {
    const tick = await getCreatorTick(userId);
    return tick.features.includes(feature) || tick.features.includes('all_features');
  } catch (error) {
    console.error('◉ Feature access check failed:', error);
    return false;
  }
};

export const upgradeTick = async (userId, newTickLevel) => {
  try {
    const currentTick = await getCreatorTick(userId);
    const newLevel = TICK_LEVELS[newTickLevel];

    if (!newLevel) {
      return { success: false, error: 'Invalid tick level' };
    }

    if (newLevel.level <= currentTick.level) {
      return { success: false, error: 'Can only upgrade to higher tier' };
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'creatorVerification.tickLevel': newTickLevel,
      'creatorVerification.upgradedAt': new Date()
    });

    return { success: true, message: `Upgraded to ${newLevel.name} tick` };
  } catch (error) {
    console.error('◉ Upgrade tick failed:', error);
    return { success: false, error: error.message };
  }
};

export const getVerificationRequirements = (targetTickLevel) => {
  const requirements = {
    BLUE: {
      minFollowers: 1000,
      minMonthlyViews: 10000,
      minContentQuality: 70,
      minEngagement: 5,
      description: 'Verified creator - Basic verification'
    },
    YELLOW: {
      minFollowers: 10000,
      minMonthlyViews: 100000,
      minContentQuality: 85,
      minEngagement: 10,
      description: 'Premium creator - Enhanced features'
    },
    GOLDEN: {
      minFollowers: 100000,
      minMonthlyViews: 1000000,
      minContentQuality: 95,
      minEngagement: 15,
      description: 'Elite creator - All features unlocked'
    }
  };

  return requirements[targetTickLevel] || null;
};

export const checkVerificationEligibility = (creatorStats, targetTick) => {
  const requirements = getVerificationRequirements(targetTick);

  if (!requirements) return { eligible: false, reason: 'Invalid tick level' };

  const checks = {
    followers: creatorStats.followers >= requirements.minFollowers,
    views: creatorStats.monthlyViews >= requirements.minMonthlyViews,
    quality: creatorStats.contentQuality >= requirements.minContentQuality,
    engagement: creatorStats.engagement >= requirements.minEngagement
  };

  const eligible = Object.values(checks).every(v => v);
  const reasons = [];

  if (!checks.followers) reasons.push(`Need ${requirements.minFollowers} followers`);
  if (!checks.views) reasons.push(`Need ${requirements.minMonthlyViews} monthly views`);
  if (!checks.quality) reasons.push(`Need ${requirements.minContentQuality}% content quality`);
  if (!checks.engagement) reasons.push(`Need ${requirements.minEngagement}% engagement`);

  return { eligible, requirements, checks, reasons };
};
