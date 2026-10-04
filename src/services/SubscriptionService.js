import { db, auth } from './Firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from './Firebase';

class SubscriptionServiceClass {
  // Subscription tiers hierarchy
  tiers = {
    void: { level: 0, name: 'Free' },
    shadow: { level: 1, name: 'Shadow' },
    abyss: { level: 2, name: 'Abyss' },
  };

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return { tier: 'void', status: 'none' };
      }

      const userData = userDoc.data();
      return userData.subscription || { tier: 'void', status: 'none' };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return { tier: 'void', status: 'none' };
    }
  }

  /**
   * Subscribe to real-time subscription updates
   * Calls callback whenever subscription changes
   */
  subscribeToUserSubscription(userId, callback) {
    try {
      const userRef = doc(db, 'users', userId);
      
      const unsubscribe = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const subscription = snapshot.data().subscription || { tier: 'void', status: 'none' };
          callback(subscription);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to subscription:', error);
      callback({ tier: 'void', status: 'none' });
    }
  }

  /**
   * Check if user has access to a specific tier
   * tierRequired: 'shadow' or 'abyss'
   */
  async hasAccessToTier(userId, tierRequired) {
    try {
      const subscription = await this.getUserSubscription(userId);
      const userTierLevel = this.tiers[subscription.tier]?.level || 0;
      const requiredTierLevel = this.tiers[tierRequired]?.level || 0;

      // User has access if their tier level >= required tier level
      return userTierLevel >= requiredTierLevel;
    } catch (error) {
      console.error('Error checking tier access:', error);
      return false;
    }
  }

  /**
   * Upgrade to a specific tier
   * Opens Stripe Checkout in browser
   */
  async upgradeSubscription(tierName) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate tier
      if (!['shadow', 'abyss'].includes(tierName)) {
        throw new Error('Invalid tier name');
      }

      console.log(`Upgrading user ${user.uid} to ${tierName}`);

      // Call Cloud Function to create Stripe Checkout session
      const createCheckout = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckout({
        tier: tierName,
        userId: user.uid,
      });

      console.log('Checkout session created:', result.data);

      return {
        success: true,
        checkoutUrl: result.data.checkoutUrl,
        sessionId: result.data.sessionId,
      };
    } catch (error) {
      console.error('Upgrade subscription error:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   * User will lose premium access at end of current period
   */
  async cancelSubscription() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log(`Cancelling subscription for user ${user.uid}`);

      // Call Cloud Function to cancel at Stripe
      const cancelSub = httpsCallable(functions, 'cancelSubscription');

      const result = await cancelSub({});

      console.log('Subscription cancelled:', result.data);

      return {
        success: true,
        message: result.data.message,
      };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    }
  }

  /**
   * Get subscription status (for display)
   */
  async getSubscriptionStatus(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);

      let statusText = 'Free Account';

      if (subscription.status === 'active') {
        statusText = `${subscription.tier.toUpperCase()} - Active`;
      } else if (subscription.status === 'past_due') {
        statusText = `${subscription.tier.toUpperCase()} - Payment Due`;
      } else if (subscription.status === 'cancelled') {
        statusText = 'Cancelled';
      }

      return {
        tier: subscription.tier,
        status: subscription.status,
        statusText: statusText,
        currentPeriodEnd: subscription.currentPeriodEnd,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        tier: 'void',
        status: 'none',
        statusText: 'Free Account',
      };
    }
  }

  /**
   * Get all payment history for user
   */
  async getPaymentHistory(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return [];
      }

      const userData = userDoc.data();
      return userData.paymentHistory || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }
}

export const SubscriptionService = new SubscriptionServiceClass();