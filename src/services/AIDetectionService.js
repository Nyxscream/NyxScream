// AI Detection Service - Flag violations, humans decide
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export const analyzeContent = async (content, contentType, userId) => {
  try {
    const analysis = {
      hateSpeech: detectHateSpeech(content),
      toxicity: detectToxicity(content),
      harassment: detectHarassment(content),
      nsfw: detectNSFW(contentType),
      spam: detectSpam(content),
      scam: detectScam(content)
    };

    // Calculate risk score (0-100)
    const riskScore = calculateRiskScore(analysis);

    // Create AI flag if risk detected
    if (riskScore > 30) {
      await createAIFlag({
        userId: userId,
        content: content,
        contentType: contentType,
        analysis: analysis,
        riskScore: riskScore,
        timestamp: new Date(),
        status: 'pending_review',
        flaggedBy: 'AI_SYSTEM'
      });
    }

    return {
      success: true,
      flagged: riskScore > 30,
      riskScore: riskScore,
      analysis: analysis
    };
  } catch (error) {
    console.error('◉ Analysis failed:', error);
    return { success: false, error: error.message };
  }
};

const detectHateSpeech = (content) => {
  // AI detection logic
  const hateSpeechKeywords = ['hate', 'discrimination', 'racist', 'bigot'];
  const score = hateSpeechKeywords.filter(k => content.toLowerCase().includes(k)).length * 20;
  return Math.min(score, 100);
};

const detectToxicity = (content) => {
  // AI toxicity detection
  const toxicKeywords = ['stupid', 'idiot', 'moron', 'trash'];
  const score = toxicKeywords.filter(k => content.toLowerCase().includes(k)).length * 15;
  return Math.min(score, 100);
};

const detectHarassment = (content) => {
  // AI harassment detection
  const harassmentKeywords = ['kill yourself', 'die', 'suffer'];
  const score = harassmentKeywords.filter(k => content.toLowerCase().includes(k)).length * 25;
  return Math.min(score, 100);
};

const detectNSFW = (contentType) => {
  // Video NSFW analysis
  if (contentType === 'video') {
    // In production: Use Google Vision API or similar
    return Math.random() * 30; // Mock score
  }
  return 0;
};

const detectSpam = (content) => {
  // Detect spam patterns
  if (content.length < 10) return 0;
  if (content.split(' ').length > 500) return 30; // Too long
  if ((content.match(/[A-Z]/g) || []).length / content.length > 0.7) return 40; // All caps
  return 0;
};

const detectScam = (content) => {
  // Detect scam patterns
  const scamKeywords = ['free money', 'click here', 'buy now', 'limited offer'];
  const score = scamKeywords.filter(k => content.toLowerCase().includes(k)).length * 20;
  return Math.min(score, 100);
};

const calculateRiskScore = (analysis) => {
  const weights = {
    hateSpeech: 0.25,
    toxicity: 0.15,
    harassment: 0.30,
    nsfw: 0.15,
    spam: 0.10,
    scam: 0.05
  };

  let totalScore = 0;
  Object.keys(analysis).forEach(key => {
    totalScore += analysis[key] * weights[key];
  });

  return Math.round(totalScore);
};

const createAIFlag = async (flagData) => {
  try {
    const flagsRef = collection(db, 'aiFlags');
    await addDoc(flagsRef, flagData);
    return { success: true };
  } catch (error) {
    console.error('◉ Create flag failed:', error);
    return { success: false, error: error.message };
  }
};

export const getAIFlags = async () => {
  try {
    // Fetch all AI-flagged content pending human review
    const flagsRef = collection(db, 'aiFlags');
    // In production: query with 'status' = 'pending_review'
    return { success: true };
  } catch (error) {
    console.error('◉ Get flags failed:', error);
    return { success: false, error: error.message };
  }
};

export const escalateToModerator = async (flagId, reason) => {
  try {
    // Send to moderator queue for human review
    const escalationRef = collection(db, 'moderatorQueue');
    await addDoc(escalationRef, {
      flagId: flagId,
      reason: reason,
      escalatedAt: new Date(),
      priority: 'high',
      status: 'awaiting_review'
    });

    return { success: true, message: 'Escalated to moderator' };
  } catch (error) {
    console.error('◉ Escalate failed:', error);
    return { success: false, error: error.message };
  }
};
