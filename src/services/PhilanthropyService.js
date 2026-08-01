// Philanthropy Service - lessPrivileges Social Impact Tracking
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, increment } from 'firebase/firestore';

// The Single Cause: lessPrivileges (umbrella for all social causes)
export const PHILANTHROPY_CAUSE = {
  id: 'lessPrivileges',
  name: 'lessPrivileges',
  description: 'Collective giving to support the less privileged - motherless babies, education, healthcare, and community welfare',
  icon: '🤝',
  color: '#FF003C'
};

// Allocations: Where money goes (Master decides)
export const ALLOCATION_CATEGORIES = {
  motherlessBabies: { name: 'Motherless Babies', icon: '👶', percentage: 0 },
  education: { name: 'Education', icon: '📚', percentage: 0 },
  healthcare: { name: 'Healthcare', icon: '🏥', percentage: 0 },
  communityWelfare: { name: 'Community Welfare', icon: '🏘️', percentage: 0 },
  foodSecurity: { name: 'Food Security', icon: '🍲', percentage: 0 }
};

// Record tip contribution to philanthropy
export const recordPhilanthropicTribute = async (donorId, amount, donorType = 'viewer') => {
  try {
    const vaultRef = collection(db, 'philanthropyVault/transactions');
    
    await addDoc(vaultRef, {
      donorId: donorId,
      donorType: donorType, // 'viewer' or 'creator'
      amount: amount,
      amountUSD: amount,
      timestamp: serverTimestamp(),
      date: new Date().toDateString(),
      status: 'received',
      type: 'tribute',
      cause: PHILANTHROPY_CAUSE.id
    });
    
    // Update vault total
    const vaultMetricsRef = doc(db, 'philanthropyVault', 'metrics');
    await updateDoc(vaultMetricsRef, {
      totalDonated: increment(amount),
      totalTransactions: increment(1),
      lastUpdate: serverTimestamp()
    });
    
    return { status: 'success', message: 'Thank you for your contribution to lessPrivileges!' };
  } catch (error) {
    console.error('◉ Philanthropic tribute recording failed:', error);
    return { status: 'error', message: error.message };
  }
};

// Get vault metrics (Master dashboard only)
export const getPhilanthropyMetrics = async () => {
  try {
    const metricsRef = doc(db, 'philanthropyVault', 'metrics');
    const metricsSnap = await getDocs(query(collection(db, 'philanthropyVault'), where('__name__', '==', 'metrics')));
    
    if (metricsSnap.empty) {
      return {
        totalDonated: 0,
        totalTransactions: 0,
        monthlyTotal: 0,
        weeklyTotal: 0,
        allocations: ALLOCATION_CATEGORIES,
        beneficiariesReached: 0
      };
    }
    
    const metrics = metricsSnap.docs[0].data();
    return {
      totalDonated: metrics.totalDonated || 0,
      totalTransactions: metrics.totalTransactions || 0,
      monthlyTotal: metrics.monthlyTotal || 0,
      weeklyTotal: metrics.weeklyTotal || 0,
      allocations: metrics.allocations || ALLOCATION_CATEGORIES,
      beneficiariesReached: metrics.beneficiariesReached || 0,
      lastUpdate: metrics.lastUpdate
    };
  } catch (error) {
    console.error('◉ Philanthropy metrics fetch failed:', error);
    return null;
  }
};

// Get transaction history (Master dashboard only)
export const getPhilanthropyTransactions = async (limit = 50) => {
  try {
    const vaultRef = collection(db, 'philanthropyVault/transactions');
    const q = query(vaultRef);
    const snapshot = await getDocs(q);
    
    const transactions = [];
    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by timestamp (newest first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    return transactions.slice(0, limit);
  } catch (error) {
    console.error('◉ Philanthropy transactions fetch failed:', error);
    return [];
  }
};

// Record allocation (Master only - allocate funds to specific causes)
export const recordAllocation = async (category, amount, description) => {
  try {
    const allocationRef = collection(db, 'philanthropyVault/allocations');
    
    await addDoc(allocationRef, {
      category: category,
      amount: amount,
      description: description,
      allocatedAt: serverTimestamp(),
      date: new Date().toDateString(),
      allocatedBy: 'master',
      status: 'allocated'
    });
    
    // Update category metrics
    const metricsRef = doc(db, 'philanthropyVault', 'metrics');
    await updateDoc(metricsRef, {
      [`allocations.${category}.allocated`]: increment(amount),
      totalAllocated: increment(amount),
      lastUpdate: serverTimestamp()
    });
    
    return { status: 'success', message: `${amount} USD allocated to ${category}` };
  } catch (error) {
    console.error('◉ Allocation recording failed:', error);
    return { status: 'error', message: error.message };
  }
};

// Get impact report (Master dashboard - real-time impact)
export const getImpactReport = async () => {
  try {
    const metrics = await getPhilanthropyMetrics();
    const transactions = await getPhilanthropyTransactions(100);
    
    // Calculate impact metrics
    const report = {
      totalRaised: metrics.totalDonated,
      totalTransactions: metrics.totalTransactions,
      averageTribute: Math.round(metrics.totalDonated / Math.max(1, metrics.totalTransactions)),
      topContributors: await getTopContributors(5),
      allocationBreakdown: metrics.allocations,
      beneficiariesReached: metrics.beneficiariesReached,
      recentTransactions: transactions.slice(0, 10),
      impactSummary: {
        message: `Together, NyxScream shadows have raised $${metrics.totalDonated} for lessPrivileges through ${metrics.totalTransactions} tributes!`,
        icon: '💜',
        color: '#FF003C'
      }
    };
    
    return report;
  } catch (error) {
    console.error('◉ Impact report generation failed:', error);
    return null;
  }
};

// Get top contributors (Master dashboard)
export const getTopContributors = async (limit = 5) => {
  try {
    const transactions = await getPhilanthropyTransactions(1000);
    
    const contributorMap = {};
    transactions.forEach((tx) => {
      if (!contributorMap[tx.donorId]) {
        contributorMap[tx.donorId] = { total: 0, count: 0, type: tx.donorType };
      }
      contributorMap[tx.donorId].total += tx.amount;
      contributorMap[tx.donorId].count += 1;
    });
    
    const topContributors = Object.entries(contributorMap)
      .map(([donorId, data]) => ({
        donorId,
        totalContributed: data.total,
        tributeCount: data.count,
        type: data.type
      }))
      .sort((a, b) => b.totalContributed - a.totalContributed)
      .slice(0, limit);
    
    return topContributors;
  } catch (error) {
    console.error('◉ Top contributors fetch failed:', error);
    return [];
  }
};

// Monthly/Weekly totals (Master dashboard - real-time tracking)
export const getTimePeriodTotals = async () => {
  try {
    const transactions = await getPhilanthropyTransactions(10000);
    
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let weeklyTotal = 0;
    let monthlyTotal = 0;
    
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (txDate >= weekAgo) weeklyTotal += tx.amount;
      if (txDate >= monthAgo) monthlyTotal += tx.amount;
    });
    
    return {
      weeklyTotal: weeklyTotal,
      monthlyTotal: monthlyTotal,
      dailyAverage: Math.round(monthlyTotal / 30),
      trend: 'upward' // Can be calculated from historical data
    };
  } catch (error) {
    console.error('◉ Time period totals fetch failed:', error);
    return { weeklyTotal: 0, monthlyTotal: 0, dailyAverage: 0 };
  }
};

// Check if user contributed (for leaderboards/recognition)
export const getUserPhilanthropicTotal = async (userId) => {
  try {
    const vaultRef = collection(db, 'philanthropyVault/transactions');
    const q = query(vaultRef, where('donorId', '==', userId));
    const snapshot = await getDocs(q);
    
    let total = 0;
    let contributionCount = 0;
    
    snapshot.forEach((doc) => {
      const tx = doc.data();
      total += tx.amount;
      contributionCount += 1;
    });
    
    return {
      userId: userId,
      totalContributed: total,
      contributionCount: contributionCount,
      badge: contributionCount > 0 ? '💜 Philanthropist' : 'Not yet contributed'
    };
  } catch (error) {
    console.error('◉ User philanthropic total fetch failed:', error);
    return { userId, totalContributed: 0, contributionCount: 0, badge: 'Not yet contributed' };
  }
};