// Payment Service - Stripe + Google Play + App Store IAP
import { db } from './firebase';
import { doc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { Platform } from 'react-native';

// ========== IAP (In-App Purchase) ==========
// Install: npm install react-native-iap
import * as RNIap from 'react-native-iap';

// Use mock mode in development, real mode in production
const USE_MOCK = process.env.NODE_ENV === 'development';
const STRIPE_API_BASE = 'https://api.stripe.com/v1';

// Validate backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
if (!BACKEND_URL && !USE_MOCK) {
  console.warn('[PaymentService] REACT_APP_BACKEND_URL not configured. Verification will fail.');
}

// Product IDs for Google Play & App Store
const IAP_PRODUCTS = {
  void: Platform.select({
    ios: 'com.nyxscream.void.monthly',
    android: 'com.nyxscream.void.monthly'
  }),
  shadow: Platform.select({
    ios: 'com.nyxscream.shadow.monthly',
    android: 'com.nyxscream.shadow.monthly'
  }),
  abyss: Platform.select({
    ios: 'com.nyxscream.abyss.monthly',
    android: 'com.nyxscream.abyss.monthly'
  })
};

// ========== INITIALIZE IAP ==========
export const initializeIAP = async () => {
  try {
    await RNIap.initConnection();
    console.log('[PaymentService] IAP initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('[PaymentService] IAP initialization failed:', error.message);
    return { success: false, error: error.message };
  }
};

// ========== GET AVAILABLE PRODUCTS ==========
export const getAvailableProducts = async () => {
  try {
    const products = await RNIap.getProducts({
      skus: Object.values(IAP_PRODUCTS)
    });

    return {
      success: true,
      products: products.map((product) => ({
        id: product.productId,
        title: product.title,
        price: product.price,
        currency: product.currency,
        description: product.description
      }))
    };
  } catch (error) {
    console.error('[PaymentService] Products fetch failed:', error.message);
    return { success: false, error: error.message };
  }
};

// ========== PURCHASE SUBSCRIPTION (IAP) ==========
export const purchaseSubscriptionIAP = async (userId, tier) => {
  try {
    const productId = IAP_PRODUCTS[tier];

    if (!productId) {
      return { success: false, error: 'Invalid tier' };
    }

    const purchase = await RNIap.requestSubscription({
      sku: productId
    });

    // Verify purchase with backend
    const verified = await verifyIAPPurchase(userId, purchase);

    if (verified.success) {
      await updateDoc(doc(db, 'users', userId), {
        'subscription.tier': tier,
        'subscription.status': 'active',
        'subscription.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        'subscription.receiptToken': purchase.transactionReceipt,
        updatedAt: new Date()
      });

      // Log purchase
      const logsRef = collection(db, `users/${userId}/purchases`);
      await addDoc(logsRef, {
        type: 'iap_subscription',
        tier: tier,
        productId: productId,
        transactionId: purchase.transactionId,
        status: 'completed',
        purchasedAt: new Date()
      });

      return { success: true, message: `Subscribed to ${tier}` };
    } else {
      return { success: false, error: 'Purchase verification failed' };
    }
  } catch (error) {
    console.error('[PaymentService] IAP purchase failed:', error.message);
    return { success: false, error: error.message };
  }
};

// ========== VERIFY IAP PURCHASE ==========
export const verifyIAPPurchase = async (userId, purchase) => {
  if (USE_MOCK) {
    console.log('[PaymentService] Using mock verification in development');
    return { success: true };
  }

  if (!BACKEND_URL) {
    console.warn('[PaymentService] Cannot verify purchase - BACKEND_URL not configured');
    return { success: false, error: 'Backend not configured' };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/verify-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        receipt: purchase.transactionReceipt,
        platform: Platform.OS
      })
    });

    if (!response.ok) {
      throw new Error(`Verification failed with status ${response.status}`);
    }

    const data = await response.json();
    return { success: data.verified };
  } catch (error) {
    console.error('[PaymentService] Verification error:', error.message);
    return { success: false, error: error.message };
  }
};

// ========== RESTORE PURCHASES ==========
export const restorePurchases = async (userId) => {
  try {
    const purchases = await RNIap.getAvailablePurchases();

    for (const purchase of purchases) {
      if (!purchase.isConsumed) {
        // Update user tier based on restored purchase
        const tierMap = {
          [IAP_PRODUCTS.void]: 'void',
          [IAP_PRODUCTS.shadow]: 'shadow',
          [IAP_PRODUCTS.abyss]: 'abyss'
        };

        const tier = tierMap[purchase.productId];

        if (tier) {
          await updateDoc(doc(db, 'users', userId), {
            'subscription.tier': tier,
            'subscription.status': 'active',
            updatedAt: new Date()
          });
        }
      }
    }

    return { success: true, message: 'Purchases restored' };
  } catch (error) {
    console.error('[PaymentService] Restore failed:', error.message);
    return { success: false, error: error.message };
  }
};

// ========== ONE-TIME PURCHASE (Tips/Tributes) ==========
export const purchaseNYXTokensIAP = async (userId, amount) => {
  try {
    // Create consumable product for tokens
    const productId = `com.nyxscream.nyx.${amount}`;

    const purchase = await RNIap.requestPurchase({
      sku: productId,
      andDangerouslyFinishTransactionAutomaticallyIOS: true
    });

    // Award tokens
    const walletRef = doc(db, `users/${userId}/wallet`, 'main');
    await updateDoc(walletRef, {
      purchased: amount,
      totalBalance: amount
    });

    // Log purchase
    const logsRef = collection(db, `users/${userId}/purchases`);
    await addDoc(logsRef, {
      type: 'iap_tokens',
      amount: amount,
      productId: productId,
      transactionId: purchase.transactionId,
      status: 'completed',
      purchasedAt: new Date()
    });

    // Finish transaction (mark as consumed)
    await RNIap.finishTransaction({
      purchase: purchase,
      isConsumable: true
    });

    return { success: true, message: `${amount} NYX tokens purchased` };
  } catch (error) {
    console.error('[PaymentService] Token purchase failed:', error.message);
    return { success: false, error: error.message };
  }
};

// ========== STRIPE (Web Fallback) ==========
export const createOrUpdateCustomer = async (userId, email, name) => {
  try {
    if (USE_MOCK) {
      return { success: true, customerId: `cus_mock_${userId}`, email: email };
    }

    const stripeKey = process.env.REACT_APP_STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('Stripe API key not configured');
    }

    const response = await fetch(`${STRIPE_API_BASE}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ email: email, name: name })
    });

    if (!response.ok) {
      throw new Error(`Stripe error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, customerId: data.id, email: data.email };
  } catch (error) {
    console.error('[PaymentService] Stripe customer creation failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const processPayment = async (userId, amount, currency = 'USD', description = 'NyxScream Payment') => {
  try {
    if (USE_MOCK) {
      const paymentRef = collection(db, `users/${userId}/payments`);
      await addDoc(paymentRef, {
        amount: amount,
        currency: currency,
        description: description,
        status: 'succeeded',
        transactionId: `pi_mock_${Date.now()}`,
        processedAt: new Date()
      });
      return { success: true, transactionId: `pi_mock_${Date.now()}`, status: 'succeeded' };
    }

    const stripeKey = process.env.REACT_APP_STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('Stripe API key not configured');
    }

    const response = await fetch(`${STRIPE_API_BASE}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        description: description
      })
    });

    if (!response.ok) {
      throw new Error(`Stripe error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: data.status === 'succeeded', transactionId: data.id, status: data.status };
  } catch (error) {
    console.error('[PaymentService] Payment processing failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const getPaymentHistory = async (userId, limit = 20) => {
  try {
    const paymentRef = collection(db, `users/${userId}/payments`);
    const snapshot = await getDocs(paymentRef);

    const payments = [];
    snapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() });
    });

    payments.sort((a, b) => (b.processedAt || 0) - (a.processedAt || 0));
    return payments.slice(0, limit);
  } catch (error) {
    console.error('[PaymentService] Payment history fetch failed:', error.message);
    return [];
  }
};

export const STRIPE_PRICE_IDS = {
  void: process.env.REACT_APP_STRIPE_VOID_PRICE || 'price_mock_void',
  shadow: process.env.REACT_APP_STRIPE_SHADOW_PRICE || 'price_mock_shadow',
  abyss: process.env.REACT_APP_STRIPE_ABYSS_PRICE || 'price_mock_abyss'
};
