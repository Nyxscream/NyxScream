// NYX Academy Service - Philosophy & Onboarding
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

export const ACADEMY_CURRICULUM = {
  MODULE_1: {
    id: 'module_1',
    title: 'The Lexicon: Understanding the Void',
    description: 'Learn the poetic language of NyxScream',
    lessons: [
      {
        id: 'lesson_1_1',
        title: 'User Journey',
        content: `SHADOW GATE = Login/Register (You enter the void)
MANIFESTATION = Register (You become a Shadow)
ECHO GATE = Login (You echo back into darkness)
SHADOW = User (Anonymous but present in void)`,
        duration: 5
      },
      {
        id: 'lesson_1_2',
        title: 'Content & Creation',
        content: `SCREAM = Stream/Title (Your voice echoing into void)
WHISPER = Description (Context behind your scream)
SHAPER = Creator (You mold reality)
ABYSS = Category (7 depths: Gaming, Docs, Horror, Crime, Comedy, Music, Void)
SIGILS = Tags/Keywords (Mystical markers)
VISIBILITY = Access Tiers (Void=public, Hidden=unlisted, Shadows=subs, Abyss=paywall)
ABYSS PRICE = Pay-Per-View (Cost to enter deepest content)
RUNES = Subtitles (Ancient inscriptions)
FORMING STATUS = Stream State (Casting, Manifesting, Echoing, Banished)`,
        duration: 10
      },
      {
        id: 'lesson_1_3',
        title: 'Engagement Metrics',
        content: `HEARD = Views (Passive listening)
CHANTS = Likes (Enthusiastic support)
SILENCES = Dislikes (Rejection)
WHISPERS = Comments (Discussion in darkness)
SCREAM TIME = Watch Time (How long message held attention)`,
        duration: 5
      },
      {
        id: 'lesson_1_4',
        title: 'Real-Time Interactions',
        content: `JOIN SCREAM = User enters live stream (Join collective scream)
WHISPER = Chat message sent (Speak in darkness)
TRIBUTE = Tip received (Offer value to shaper)
DISCONNECT = User leaves (Echo fades from void)`,
        duration: 5
      },
      {
        id: 'lesson_1_5',
        title: 'Navigation Spaces',
        content: `VOID SCREEN = Home/Discovery (Where shadows gather)
ECHO SCREEN = Explore Content (Listen to echoes)
CAST SCREEN = Upload Content (Throw scream into void)
SCREAM SCREEN = Creator Dashboard (Control screams)
SHADOW SCREEN = User Profile (See yourself reflected)
ECHO PLAYER = Video Player (Experience resonance)
LIVE SCREAM = Live Streaming (Real-time manifestation)
SHADOW GATE = Auth (Entry point to void)
SHADOW STUDIO = Settings (Personal creation chamber)`,
        duration: 8
      },
      {
        id: 'lesson_1_6',
        title: 'Monetization & Values',
        content: `TRIBUTES = Tips (Direct support for shaper's work)
PHILANTHROPY VAULT = Donation Pool (Collective giving to lessPrivileges)
NYX TOKEN = Internal Currency (Earn, gift, spend - stable value, NOT crypto)
ESSENCE = Subscription (Your tier: Void/Shadow/Abyss)
CREATOR TIERS = Progression (Whisper→Echo→Scream by resonance, not luck)`,
        duration: 7
      }
    ],
    quiz: [
      { id: 'q1', question: 'When you go live, what is it called?', options: ['Whisper', 'Scream', 'Chant', 'Tribute'], correct: 'Scream' },
      { id: 'q2', question: 'When someone tips you, what is it called?', options: ['Chant', 'Tribute', 'Echo', 'Silence'], correct: 'Tribute' },
      { id: 'q3', question: 'When someone comments, what is it called?', options: ['Heard', 'Whisper', 'Chant', 'Scream'], correct: 'Whisper' },
      { id: 'q4', question: 'Users on NyxScream are called?', options: ['Users', 'Shadows', 'Echoes', 'Voices'], correct: 'Shadows' },
      { id: 'q5', question: 'Video views are called?', options: ['Echoes', 'Heard', 'Chants', 'Whispers'], correct: 'Heard' },
      { id: 'q6', question: 'Philanthropy Vault supports?', options: ['Creators', 'Platform', 'lessPrivileges', 'Investors'], correct: 'lessPrivileges' }
    ]
  }
};

export const completeAcademyLesson = async (userId, moduleId, lessonId) => {
  try {
    const progressRef = collection(db, `users/${userId}/academyProgress`);
    await addDoc(progressRef, {
      moduleId,
      lessonId,
      completedAt: new Date(),
      status: 'completed'
    });
    return true;
  } catch (error) {
    console.error('◉ Academy lesson save failed:', error);
    return false;
  }
};

export const getAcademyProgress = async (userId) => {
  try {
    const progressRef = collection(db, `users/${userId}/academyProgress`);
    const snapshot = await getDocs(progressRef);
    const progress = [];
    snapshot.forEach((doc) => {
      progress.push({ id: doc.id, ...doc.data() });
    });
    return progress;
  } catch (error) {
    console.error('◉ Academy progress fetch failed:', error);
    return [];
  }
};

export const completeAcademy = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      academyCompleted: true,
      academyCompletedAt: new Date(),
      creatorBadge: true,
      nyx_tokens: 10,
      monetizationEligible: false,
      streakStart: new Date()
    });
    return true;
  } catch (error) {
    console.error('◉ Academy completion award failed:', error);
    return false;
  }
};

export const canUserMonetize = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
    if (userSnap.empty) return false;
    const userData = userSnap.docs[0].data();
    if (!userData.academyCompleted) return false;
    if (!userData.streakStart) return false;
    const streakDays = Math.floor((new Date() - userData.streakStart) / (1000 * 60 * 60 * 24));
    if (streakDays < 90) return false;
    return true;
  } catch (error) {
    console.error('◉ Monetization check failed:', error);
    return false;
  }
};

export const getCreatorBadge = (userData) => {
  if (!userData.academyCompleted) {
    return { earned: false, name: 'LOCKED', icon: '🔒', color: '#6B6B6B' };
  }
  const streakDays = Math.floor((new Date() - userData.streakStart) / (1000 * 60 * 60 * 24));
  if (streakDays < 90) {
    return { 
      earned: true, 
      name: 'ACADEMY INITIATE', 
      icon: '🌑', 
      color: '#00F0FF', 
      streakProgress: `${streakDays}/90 days` 
    };
  }
  return { 
    earned: true, 
    name: 'CREATOR VERIFIED', 
    icon: '✨', 
    color: '#FF003C' 
  };
};