import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * CreatorVerificationService
 * 
 * Handles creator tier system:
 * - Tier 1: Emerging (1-5K followers)
 * - Tier 2: Arrived (5-10K followers)
 * - Tier 3: Rising (10K+ followers)
 * - Tier 4: Legend (100K+ followers)
 */

export const CREATOR_TIERS = {
  UNVERIFIED: 0,
  EMERGING: 1,
  ARRIVED: 2,
  RISING: 3,
  LEGEND: 4,
};

export const TIER_REQUIREMENTS = {
  1: { 
    minFollowers: 1000,
    maxFollowers: 5000,
    label: 'Emerging',
    description: 'Building your audience',
    moon: '🌙',
    color: '#6B6B6B',
  },
  2: { 
    minFollowers: 5000,
    maxFollowers: 10000,
    label: 'Arrived',
    description: 'Established creator',
    moon: '🌕',
    color: '#E0E0E0',
  },
  3: { 
    minFollowers: 10000,
    label: 'Rising',
    description: 'Rapid growth phase',
    moon: '🌙',
    color: '#FFD700',
  },
  4: { 
    minFollowers: 100000,
    label: 'Legend',
    description: 'Platform titan',
    moon: '🌕',
    color: '#FFD700',
    glow: true,
  },
};

/**
 * Get creator tier based on follower count
 * @param {number} followers - Number of followers
 * @returns {number} Tier number (0-4)
 */
export const getCreatorTier = (followers) => {
  if (followers >= 100000) return CREATOR_TIERS.LEGEND;
  if (followers >= 10000) return CREATOR_TIERS.RISING;
  if (followers >= 5000) return CREATOR_TIERS.ARRIVED;
  if (followers >= 1000) return CREATOR_TIERS.EMERGING;
  return CREATOR_TIERS.UNVERIFIED;
};

/**
 * Get tier info
 * @param {number} tier - Tier number
 * @returns {object} Tier configuration
 */
export const getTierInfo = (tier) => {
  return TIER_REQUIREMENTS[tier] || null;
};

/**
 * Check if creator is verified
 * @param {number} tier - Tier number
 * @returns {boolean} Is creator verified?
 */
export const isCreatorVerified = (tier) => {
  return tier >= CREATOR_TIERS.EMERGING;
};

/**
 * Calculate progress to next tier
 * @param {number} followers - Current followers
 * @returns {object} Progress info
 */
export const getProgressToNextTier = (followers) => {
  const currentTier = getCreatorTier(followers);
  
  if (currentTier === CREATOR_TIERS.LEGEND) {
    return {
      currentTier: CREATOR_TIERS.LEGEND,
      nextTier: null,
      currentFollowers: followers,
      nextTierRequires: null,
      progress: 100,
      remaining: 0,
    };
  }

  const nextTier = currentTier + 1;
  const nextTierInfo = TIER_REQUIREMENTS[nextTier];
  const remaining = nextTierInfo.minFollowers - followers;
  const progress = (followers / nextTierInfo.minFollowers) * 100;

  return {
    currentTier,
    nextTier,
    currentFollowers: followers,
    nextTierRequires: nextTierInfo.minFollowers,
    progress: Math.min(progress, 100),
    remaining: Math.max(remaining, 0),
  };
};

/**
 * Update creator tier in Firestore
 * @param {string} creatorId - Creator ID
 * @param {number} followers - Follower count
 */
export const updateCreatorTier = async (creatorId, followers) => {
  try {
    const tier = getCreatorTier(followers);
    const tierInfo = getTierInfo(tier);

    const creatorRef = doc(db, 'creators', creatorId);
    
    await updateDoc(creatorRef, {
      tier,
      followers,
      tierLabel: tierInfo?.label || 'Unverified',
      tierUpdatedAt: new Date().toISOString(),
      isVerified: isCreatorVerified(tier),
    });

    return { success: true, tier, tierInfo };
  } catch (error) {
    console.error('Error updating creator tier:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get creator's current tier from Firestore
 * @param {string} creatorId - Creator ID
 * @returns {object} Creator tier data
 */
export const getCreatorTierFromDB = async (creatorId) => {
  try {
    const creatorRef = doc(db, 'creators', creatorId);
    const snapshot = await getDoc(creatorRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Creator not found' };
    }

    const data = snapshot.data();
    return {
      success: true,
      tier: data.tier || 0,
      followers: data.followers || 0,
      tierLabel: data.tierLabel || 'Unverified',
      isVerified: data.isVerified || false,
      tierInfo: getTierInfo(data.tier),
    };
  } catch (error) {
    console.error('Error fetching creator tier:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Batch update creators' tiers
 * Used when follower counts change
 * @param {array} creators - Array of {id, followers}
 */
export const batchUpdateCreatorTiers = async (creators) => {
  try {
    const updates = [];

    for (const creator of creators) {
      const tier = getCreatorTier(creator.followers);
      const tierInfo = getTierInfo(tier);

      updates.push(
        updateDoc(doc(db, 'creators', creator.id), {
          tier,
          followers: creator.followers,
          tierLabel: tierInfo?.label || 'Unverified',
          tierUpdatedAt: new Date().toISOString(),
          isVerified: isCreatorVerified(tier),
        })
      );
    }

    await Promise.all(updates);
    return { success: true, updated: creators.length };
  } catch (error) {
    console.error('Error batch updating tiers:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all creators by tier
 * @param {number} tier - Tier to filter by
 * @returns {array} Creators at that tier
 */
export const getCreatorsByTier = async (tier) => {
  try {
    // This would require a Firestore query
    // Placeholder for future implementation
    return { success: false, error: 'Not implemented yet' };
  } catch (error) {
    console.error('Error fetching creators by tier:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get badge metadata for display
 * @param {number} tier - Creator tier
 * @returns {object} Badge display data
 */
export const getBadgeMetadata = (tier) => {
  const tierInfo = getTierInfo(tier);
  
  if (!tierInfo) {
    return {
      moon: '❌',
      color: '#6B6B6B',
      label: 'Unverified',
      glow: false,
    };
  }

  return {
    moon: tierInfo.moon,
    color: tierInfo.color,
    label: tierInfo.label,
    description: tierInfo.description,
    glow: tierInfo.glow || false,
  };
};

/**
 * Format tier progress for display
 * @param {number} followers - Current followers
 * @returns {string} Formatted progress text
 */
export const formatTierProgress = (followers) => {
  const progress = getProgressToNextTier(followers);
  
  if (progress.nextTier === null) {
    return `Legend Status 👑`;
  }

  const nextTierInfo = getTierInfo(progress.nextTier);
  return `${progress.remaining.toLocaleString()} followers to ${nextTierInfo.label}`;
};

export default {
  CREATOR_TIERS,
  TIER_REQUIREMENTS,
  getCreatorTier,
  getTierInfo,
  isCreatorVerified,
  getProgressToNextTier,
  updateCreatorTier,
  getCreatorTierFromDB,
  batchUpdateCreatorTiers,
  getCreatorsByTier,
  getBadgeMetadata,
  formatTierProgress,
};