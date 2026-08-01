// NYX Token Service - Internal Currency System (NOT Cryptocurrency)
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, increment } from 'firebase/firestore';

// NYX Token Constants
export const NYX_TOKEN_CONFIG = {
  totalSupply: 500000000, // 500M tokens
  symbol: 'NYX',
  name: 'NYX Token',
  stableValue: true, // NEVER rises or falls
  minValue: 0.01, // $0.01 USD per token (FIXED)
  maxValue: 0.01, // $0.01 USD per token (FIXED)
  type: 'internalCurrency', // NOT cryptocurrency
  tradeable: false, // NO external trading
  stakeable: false, // NO staking
  ecosystem: 'NyxScream-only'
};

// Initialize user wallet
export const initializeUserWallet = async (userId) => {
  try {
    const walletRef = doc(db, 'nyxWallets', userId);
    await updateDoc(walletRef, {
      userId: userId,
      balance: 0,
      earned: 0,
      purchased: 0,
      spent: 0,
      transactions: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch(async () => {
      // If doc doesn't exist, create it
      await addDoc(collection(db, 'nyxWallets'), {
        userId: userId,
        balance: 0,
        earned: 0,
        purchased: 0,
        spent: 0,
        transactions: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    return { status: 'success', message: 'Wallet initialized' };
  } catch (error) {
    console.error('◉ Wallet initialization failed:', error);
    return { status: 'error', message: error.message };
  }
};

// Get user wallet balance
export const getUserWalletBalance = async (userId) => {
  try {
    const walletSnap = await getDocs(query(collection(db, 'nyxWallets'), where('userId', '==', userId)));
    
    if (walletSnap.empty) {
      await initializeUserWallet(userId);
      return { balance: 0, earned: 0, purchased: 0, spent: 0 };
    }
    
    const wallet = walletSnap.docs[0].data();
    return {
      balance: wallet.balance || 0,
      earned: wallet.earned || 0,
      purchased: wallet.purchased || 0,
      spent: wallet.spent || 0
    };
  } catch (error) {
    console.error('◉ Wallet balance fetch failed:', error);
    return { balance: 0, earned: 0, purchased: 0, spent: 0 };
  }
};

// Award NYX tokens (earned through activity)
export const awardNYXTokens = async (userId, amount, reason = 'activity') => {
  try {
    const walletSnap = await getDocs(query(collection(db, 'nyxWallets'), where('userId', '==', userId)));
    
    if (walletSnap.empty) {
      await initializeUserWallet(userId);
      return awardNYXTokens(userId, amount, reason);
    }
    
    const walletId = walletSnap.docs[0].id;
    const walletRef = doc(db, 'nyxWallets', walletId);
    
    // Add transaction
    const txRef = collection(db, `nyxWallets/${walletId}/transactions`);
    await addDoc(txRef, {
      type: 'earn',
      amount: amount,
      amountUSD: amount * NYX_TOKEN_CONFIG.minValue,
      reason: reason,
      timestamp: serverTimestamp(),
      date: new Date().toDateString()
    });
    
    // Update balance
    await updateDoc(walletRef, {
      balance: increment(amount),
      earned: increment(amount),
      updatedAt: serverTimestamp()
    });
    
    return { status: 'success', message: `Awarded ${amount} NYX tokens!` };
  } catch (error) {
    console.error('◉ NYX award failed:', error);
    return { status: 'error', message: error.message };
  }
};

// Purchase NYX tokens with fiat
export const purchaseNYXTokens = async (userId, amount, paymentMethodId, stripePaymentIntentId) => {
  try {
    const walletSnap = await getDocs(query(collection(db, 'nyxWallets'), where('userId', '==', userId)));
    
    if (walletSnap.empty) {
      await initializeUserWallet(userId);
      return purchaseNYXTokens(userId, amount, paymentMethodId, stripePaymentIntentId);
    }
    
    const walletId = walletSnap.docs[0].id;
    const walletRef = doc(db, 'nyxWallets', walletId);
    const costUSD = amount * NYX_TOKEN_CONFIG.minValue;
    
    // Record transaction
    const txRef = collection(db, `nyxWallets/${walletId}/transactions`);
    await addDoc(txRef, {
      type: 'purchase',
      amount: amount,
      amountUSD: costUSD,
      paymentMethodId: paymentMethodId,
      stripePaymentIntentId: stripePaymentIntentId,
      timestamp: serverTimestamp(),
      date: new Date().toDateString(),
      status: 'completed'
    });
    
    // Update balance
    await updateDoc(walletRef, {
      balance: increment(amount),
      purchased: increment(amount),
      updatedAt: serverTimestamp()
    });
    
    return { status: 'success', message: `Purchased ${amount} NYX tokens for $${costUSD}!` };
  } catch (error) {
    console.error('◉ NYX purchase failed:', error);
    return { status: 'error', message: error.message };
  }
};

// Spend NYX tokens (for tips, exclusive content, voting)
export const spendNYXTokens = async (userId, amount, purpose, recipientId = null) => {
  try {
    const walletSnap = await getDocs(query(collection(db, 'nyxWallets'), where('userId', '==', userId)));
    
    if (walletSnap.empty) {
      return { status: 'error', message: 'Wallet not found' };
    }
    
    const currentBalance = walletSnap.docs[0].data().balance || 0;
    
    if (currentBalance < amount) {
      return { status: 'error', message: `Insufficient balance. You have ${currentBalance} NYX, need ${amount}` };
    }
    
    const walletId = walletSnap.docs[0].id;
    const walletRef = doc(db, 'nyxWallets', walletId);
    
    // Record transaction
    const txRef = collection(db, `nyxWallets/${walletId}/transactions`);
    await addDoc(txRef, {
      type: 'spend',
      amount: amount,
      amountUSD: amount * NYX_TOKEN_CONFIG.minValue,
      purpose: purpose, // 'tip', 'exclusive_content', 'voting', 'reward'
      recipientId: recipientId,
      timestamp: serverTimestamp(),
      date: new Date().toDateString(),
      status: 'completed'
    });
    
    // Update balance
    await updateDoc(walletRef, {
      balance: increment(-amount),
      spent: increment(amount),
      updatedAt: serverTimestamp()
    });
    
    return { status: 'success', message: `Spent ${amount} NYX for ${purpose}!` };
  } catch (error) {
    console.error('◉ NYX spend failed:', error);
    return { status: 'error', message: error.message };
  }
};

// Gift NYX tokens to another user
export const giftNYXTokens = async (senderId, recipientId, amount, message = '') => {
  try {
    // Check sender balance
    const senderSnap = await getDocs(query(collection(db, 'nyxWallets'), where('userId', '==', senderId)));
    if (senderSnap.empty) return { status: 'error', message: 'Sender wallet not found' };
    
    const senderBalance = senderSnap.docs[0].data().balance || 0;
    if (senderBalance < amount) {
      return { status: 'error', message: `Insufficient balance` };
    }
    
    const senderId_WalletId = senderSnap.docs[0].id;
    
    // Initialize recipient wallet if needed
    const recipientSnap = await getDocs(query(collection(db, 'nyxWallets'), where('userId', '==', recipientId)));
    if (recipientSnap.empty) {
      await initializeUserWallet(recipientId);
    }
    const recipientWalletId = recipientSnap.docs.length > 0 ? recipientSnap.docs[0].id : (await getDocs(query(collection(db, 'nyxWallets'), where('userId', '==', recipientId)))).docs[0].id;
    
    // Record sender transaction
    const senderTxRef = collection(db, `nyxWallets/${senderId_WalletId}/transactions`);
    await addDoc(senderTxRef, {
      type: 'gift_sent',
      amount: amount,
      amountUSD: amount * NYX_TOKEN_CONFIG.minValue,
      recipientId: recipientId,
      message: message,
      timestamp: serverTimestamp(),
      date: new Date().toDateString()
    });
    
    // Record recipient transaction
    const recipientTxRef = collection(db, `nyxWallets/${recipientWalletId}/transactions`);
    await addDoc(recipientTxRef, {
      type: 'gift_received',
      amount: amount,
      amountUSD: amount * NYX_TOKEN_CONFIG.minValue,
      senderId: senderId,
      message: message,
      timestamp: serverTimestamp(),
      date: new Date().toDateString()
    });
    
    // Update balances
    const senderRef = doc(db, 'nyxWallets', senderId_WalletId);
    const recipientRef = doc(db, 'nyxWallets', recipientWalletId);
    
    await updateDoc(senderRef, { balance: increment(-amount), spent: increment(amount) });
    await updateDoc(recipientRef, { balance: increment(amount), earned: increment(amount) });
    
    return { status: 'success', message: `Gifted ${amount} NYX to ${recipientId}!` };
  } catch (error) {
    console.error('◉ NYX gift failed:', error);
    return { status: 'error', message: error.message };
  }
};

// Get transaction history
export const getUserNYXTransactions = async (userId, limit = 50) => {
  try {
    const walletSnap = await getDocs(query(collection(db, 'nyxWallets'), where('userId', '==', userId)));
    
    if (walletSnap.empty) return [];
    
    const walletId = walletSnap.docs[0].id;
    const txRef = collection(db, `nyxWallets/${walletId}/transactions`);
    const snapshot = await getDocs(txRef);
    
    const transactions = [];
    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by timestamp (newest first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    return transactions.slice(0, limit);
  } catch (error) {
    console.error('◉ Transaction history fetch failed:', error);
    return [];
  }
};

// NYX Token Utility Functions

// Use NYX for tip/tribute
export const tipWithNYX = async (senderId, recipientId, amount) => {
  return spendNYXTokens(senderId, amount, 'tribute', recipientId);
};

// Use NYX for voting
export const voteWithNYX = async (userId, voterId, proposalId) => {
  return spendNYXTokens(userId, 1, 'voting', proposalId); // 1 NYX = 1 vote
};

// Use NYX for exclusive content access
export const purchaseExclusiveContentWithNYX = async (userId, contentId, cost) => {
  return spendNYXTokens(userId, cost, 'exclusive_content', contentId);
};

// Get NYX token info
export const getNYXTokenInfo = () => {
  return {
    ...NYX_TOKEN_CONFIG,
    valueUSD: `$${NYX_TOKEN_CONFIG.minValue}`,
    type: 'Internal Platform Currency (NOT Cryptocurrency)',
    canTrade: false,
    canStake: false,
    ecosystem: 'NyxScream Only',
    utility: ['Voting', 'Tips/Tributes', 'Rewards', 'Exclusive Content Access']
  };
};

// Get total circulating supply (for admin dashboard)
export const getTotalCirculatingSupply = async () => {
  try {
    const walletsRef = collection(db, 'nyxWallets');
    const snapshot = await getDocs(walletsRef);
    
    let totalCirculating = 0;
    snapshot.forEach((doc) => {
      totalCirculating += doc.data().balance || 0;
    });
    
    return {
      totalSupply: NYX_TOKEN_CONFIG.totalSupply,
      circulating: totalCirculating,
      reserved: NYX_TOKEN_CONFIG.totalSupply - totalCirculating,
      percentageCirculating: Math.round((totalCirculating / NYX_TOKEN_CONFIG.totalSupply) * 100)
    };
  } catch (error) {
    console.error('◉ Circulating supply fetch failed:', error);
    return null;
  }
};