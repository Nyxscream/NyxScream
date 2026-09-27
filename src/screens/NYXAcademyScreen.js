// COMPLETE FILE - NYXAcademyScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from './Firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

// ============================================
// COMPLETE ACADEMY CURRICULUM
// ============================================

export const ACADEMY_CURRICULUM = {
  MODULE_1: {
    id: 'module_1_getting_started',
    title: '🌑 Getting Started on NyxScream',
    description: 'Learn the fundamentals of NyxScream and set up your creator profile',
    icon: '🚀',
    difficulty: 'Beginner',
    duration: '15 minutes',
    badge: '🌑 Newcomer Badge',
    tokenReward: 10,
    lessons: [
      {
        id: 'lesson_1_1',
        title: 'Welcome to NyxScream',
        duration: '5 min',
        content: `Welcome to NyxScream - Where Darkness Meets Sound!

You're about to join 500K+ creators earning 80%+ revenue share.

What makes NyxScream different:
✓ 80%+ creator revenue (not 50% like Twitch)
✓ Dark content celebrated (not censored)
✓ Direct creator support team
✓ Fair, transparent economics
✓ Community-driven platform

In this academy, you'll learn:
- How to set up your channel
- How to do your first stream
- How to grow your audience
- How to earn money
- Advanced creator techniques
- Community management
- Technical streaming skills

This academy takes 1-2 hours to complete.
At the end, you'll earn your first 10 NYX tokens!

Ready? Let's go! 🌑`,
        quiz: [
          {
            question: 'What percentage of revenue do creators keep on NyxScream?',
            options: ['50%', '70%', '80%+', '100%'],
            correct: 2
          },
          {
            question: 'Is dark/horror content allowed on NyxScream?',
            options: ['No', 'Only with restrictions', 'Yes, fully supported', 'Only at night'],
            correct: 2
          }
        ]
      },
      {
        id: 'lesson_1_2',
        title: 'Complete Your Profile',
        duration: '5 min',
        content: `Your profile is your first impression.

PROFILE COMPONENTS:
✓ Profile Picture - Your face or logo (required)
✓ Creator Name - What you want to be called (required)
✓ Bio - Tell viewers about you (200 chars max)
✓ Category - Horror, Thriller, Gaming, Art, Music, Other
✓ Social Links - Twitter, Instagram, Discord, Website
✓ Streaming Software - What you use (OBS, Streamlabs, etc)

TIPS FOR A GREAT PROFILE:
- Use a clear, well-lit profile picture
- Write a bio that's authentic & interesting
- Pick the category that fits your content
- Link your socials so viewers can follow
- Update it as you grow!

EXAMPLE BIO:
"Horror streamer | Psychological thrillers | Variety games | She/her | Twitch refugee 😅"

YOUR UNIQUE LINK:
nyxscream.app/creators/[your-username]

This is where viewers discover YOU. Make it count! 🌑`,
        quiz: [
          {
            question: 'What is the max character limit for your bio?',
            options: ['50 chars', '200 chars', '500 chars', 'Unlimited'],
            correct: 1
          },
          {
            question: 'Can you change your category after streaming?',
            options: ['No, never', 'Yes, anytime', 'Only once', 'Once per month'],
            correct: 1
          }
        ]
      },
      {
        id: 'lesson_1_3',
        title: 'Understand Your Dashboard',
        duration: '5 min',
        content: `Your dashboard is mission control.

MAIN DASHBOARD SECTIONS:

1. DASHBOARD TAB
   - Today's views & revenue at a glance
   - Recent activity feed
   - Upcoming scheduled streams
   - "Start Streaming Now" button

2. STREAM SETTINGS
   - Stream title & description
   - Category & tags
   - Visibility (public/private/followers only)
   - Custom thumbnails

3. EARNINGS
   - This month's revenue breakdown
   - Lifetime earnings total
   - Complete payout history
   - Subscriber count & breakdown by tier
   - Revenue split (Shadow/Abyss tiers)

4. ANALYTICS
   - Total views (all-time & per stream)
   - Average viewers per stream
   - Peak concurrent viewer count
   - Top performing streams list
   - Subscriber growth chart over time

5. CREATOR TOOLS
   - Download OBS settings profile
   - Get your secure stream key
   - API documentation
   - Embedding setup guide

6. SETTINGS
   - Notification preferences
   - Moderation settings (ban words, block users)
   - Account management
   - Privacy controls

QUICK TIP:
Bookmark your creator dashboard. You'll live there!`,
        quiz: [
          {
            question: 'Where do you find your monthly revenue?',
            options: ['Dashboard tab', 'Earnings tab', 'Analytics tab', 'Settings tab'],
            correct: 1
          },
          {
            question: 'How do you get your stream key?',
            options: ['Dashboard tab', 'Earnings tab', 'Creator Tools tab', 'Settings tab'],
            correct: 2
          }
        ]
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is NyxScream mission?',
        options: ['Make money fast', 'Help dark creators thrive fairly', 'Copy Twitch', 'Become famous'],
        correct: 1
      },
      {
        id: 'q2',
        question: 'How often can you update your profile?',
        options: ['Once', 'Monthly', 'Anytime', 'Never'],
        correct: 2
      },
      {
        id: 'q3',
        question: 'Where is your unique creator link?',
        options: [
          'nyxscream.app/[your-username]',
          'nyxscream.app/creators/[your-username]',
          'creators.nyxscream.app/[your-username]',
          'nyxscream.com/[your-username]'
        ],
        correct: 1
      }
    ]
  },

  MODULE_2: {
    id: 'module_2_first_stream',
    title: '🎬 Your First Stream - Technical Setup',
    description: 'Get your streaming software configured and ready to go live',
    icon: '🎥',
    difficulty: 'Beginner',
    duration: '20 minutes',
    badge: '🎥 Streamer Badge',
    tokenReward: 15,
    lessons: [
      {
        id: 'lesson_2_1',
        title: 'Choose Your Streaming Software',
        duration: '5 min',
        content: `You have options! Pick the right tool for YOUR setup.

DESKTOP OPTIONS:
✓ OBS Studio (Free, powerful, RECOMMENDED)
  - Best for: Beginners & pros alike
  - Cost: Completely free
  - Works on: Windows, Mac, Linux
  - Features: Scene switching, overlays, recording

✓ Streamlabs OBS (Free, beginner-friendly)
  - Best for: Easy setup with built-in features
  - Cost: Free (premium available)
  - Works on: Windows, Mac
  - Features: Built-in alerts, themes, integrations

✓ XSplit (Paid, professional)
  - Best for: Professional streamers only
  - Cost: $20/month
  - Works on: Windows
  - Features: Advanced mixing, scene organization

MOBILE OPTIONS:
✓ Phone Camera (Built-in)
  - Best for: IRL streams, simple mobile setup
  - Cost: Free (just your phone)
  - Works on: iOS, Android
  - Features: Direct streaming to NyxScream

CONSOLE OPTIONS:
✓ PS5/Xbox Stream App (Free)
  - Best for: Gaming streamers
  - Cost: Free
  - Features: Direct console streaming to NyxScream

RECOMMENDATION FOR BEGINNERS:
Download OBS Studio (free). It's the industry standard.
We'll walk you through setup in the next lesson!`,
        quiz: [
          {
            question: 'Which streaming software is completely free?',
            options: ['XSplit only', 'Streamlabs only', 'OBS or Streamlabs', 'All of them'],
            correct: 2
          }
        ]
      },
      {
        id: 'lesson_2_2',
        title: 'Configure OBS Settings',
        duration: '8 min',
        content: `Step-by-step guide to set up OBS for NyxScream.

STEP 1: DOWNLOAD & INSTALL
- Go to obsproject.com
- Download for your OS (Windows/Mac/Linux)
- Install normally like any app

STEP 2: LAUNCH OBS
- Open the application
- You'll see scenes, sources, audio/video controls

STEP 3: SET STREAM KEY
- Click: Settings → Stream
- Service: Custom
- Server: rtmp://stream.nyxscream.app/live
- Stream Key: [Your key from dashboard]
- Click Apply + OK

STEP 4: CONFIGURE QUALITY
- Settings → Output
- Bitrate: 6000 kbps (or 3500 if slow internet)
- Encoder: H.264
- Preset: Fast (or Medium if PC is strong)

STEP 5: SET RESOLUTION & FPS
- Settings → Video
- Base Canvas: 1920x1080
- Output Scale: 1920x1080
- FPS: 60 (or 30 if computer is slow)
- Downscale Filter: Lanczos

STEP 6: ADD AUDIO
- Sources → + → Audio Input Capture
- Select your microphone
- Adjust volume slider (should peak at -6db)

STEP 7: ADD VIDEO
- Sources → + → Video Capture Device
- Select your camera/capture card
- Adjust size/position on canvas

STEP 8: CREATE SCENES
Scene 1: "Just Chatting"
Scene 2: "Gaming"
Scene 3: "Intro/Outro"

TESTING:
- Click "Start Streaming"
- Go to dashboard
- Click "Go Live"
- Watch your test stream
- If good, click "Stop Streaming"

TROUBLESHOOTING:
- Laggy? Lower bitrate to 4500, resolution to 1280x720
- No sound? Check audio in Sources
- Video not showing? Add Video Capture Device to Sources`,
        quiz: [
          {
            question: 'What bitrate should you use for NyxScream?',
            options: ['2000 kbps', '4000 kbps', '6000 kbps', '10000 kbps'],
            correct: 2
          },
          {
            question: 'Where do you add your stream key in OBS?',
            options: ['Settings → Video', 'Settings → Stream', 'Sources', 'Scenes'],
            correct: 1
          }
        ]
      },
      {
        id: 'lesson_2_3',
        title: 'Do Your Test Stream',
        duration: '7 min',
        content: `Test before you go live. Here's how.

WHY TEST STREAM?
✓ Verify audio/video works
✓ Check internet connection stability
✓ Practice going live without pressure
✓ Find optimal camera position
✓ Get comfortable with the interface

TEST STREAM CHECKLIST:
□ Open OBS (or your software)
□ Check microphone is working (volume meter should move)
□ Check camera is working (video preview should show you)
□ Click "Start Streaming"
□ Go to NyxScream dashboard
□ Click "Go Live"
□ Wait 30 seconds for stream to appear on dashboard
□ Click your stream preview to watch it back

WHILE WATCHING YOUR TEST:
✓ Is video clear and stable?
✓ Can you hear yourself in chat (low delay)?
✓ Are there stutters or freezes?
✓ Is the frame rate smooth?
✓ Can you read chat messages easily?

TROUBLESHOOTING:

Issue: Stream won't connect
Fix: Check stream key in OBS settings (copy correctly)

Issue: No video/audio appearing
Fix: Check Sources in OBS (add video + audio sources)

Issue: Audio is distorted or too loud
Fix: Lower microphone volume in OBS Sources

Issue: Video is laggy/pixelated
Fix: Lower bitrate to 4500 kbps
    Lower resolution to 1280x720
    Close other apps using bandwidth

Issue: Internet dropping/disconnecting
Fix: Use wired ethernet (not WiFi if possible)
    Move router closer to your PC
    Close bandwidth-heavy apps

Once test passes: You're ready for your REAL stream! 🚀`,
        quiz: [
          {
            question: 'How long should you wait before checking if stream appears?',
            options: ['5 seconds', '15 seconds', '30 seconds', '2 minutes'],
            correct: 2
          }
        ]
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which software is recommended for beginners?',
        options: ['XSplit', 'OBS Studio', 'Wirecast', 'Vimeo Live'],
        correct: 1
      },
      {
        id: 'q2',
        question: 'What should your bitrate be for NyxScream?',
        options: ['3000', '6000', '10000', '15000'],
        correct: 1
      },
      {
        id: 'q3',
        question: 'What is the correct server URL for NyxScream?',
        options: [
          'rtmp.nyxscream.app',
          'stream.nyxscream.app',
          'rtmp://stream.nyxscream.app/live',
          'nyxscream.rtmp.live'
        ],
        correct: 2
      }
    ]
  },

  MODULE_3: {
    id: 'module_3_grow_audience',
    title: '📈 Growing Your Audience - Streamer Tips & Tricks',
    description: 'Learn secrets to attracting and keeping viewers engaged',
    icon: '📈',
    difficulty: 'Intermediate',
    duration: '25 minutes',
    badge: '📈 Growth Master Badge',
    tokenReward: 20,
    lessons: [
      {
        id: 'lesson_3_1',
        title: 'The Power of Consistency',
        duration: '8 min',
        content: `One secret successful creators know: CONSISTENCY WINS.

THE CONSISTENCY EFFECT:
Viewers don't follow random streamers.
They follow streamers who show up reliably.

REAL EXAMPLE:
Streamer A: Streams randomly whenever they feel like it
- 50 followers after 3 months
- Viewers never know when to watch
- Low engagement & retention

Streamer B: Streams same time every week (Fridays 9pm EST)
- 500 followers after 3 months
- Viewers expect them & plan to watch
- High engagement & retention

The difference? PREDICTABILITY.
Viewers can plan to watch you.

HOW TO USE CONSISTENCY:

1. PICK A SCHEDULE
   - Pick 1-2 time slots that work for YOU
   - Examples: Mon 8pm, Wed 7pm, Fri 9pm
   - Make sure you can commit!

2. ANNOUNCE IT EVERYWHERE
   - Tell viewers on stream: "I'm live Fridays at 9pm EST!"
   - Post in Discord pinned message
   - Update your profile
   - Send reminder email to followers

3. COMMIT FOR 3 MONTHS
   - Stream at that time EVERY week
   - Even if you only have 2 viewers
   - Especially if you only have 2 viewers
   - Those 2 loyal viewers tell friends

4. WATCH YOUR GROWTH
   - Week 1: 5 viewers at Fri 9pm
   - Week 2: 8 viewers at Fri 9pm (they came back!)
   - Week 3: 15 viewers (friends showed up)
   - Week 4: 25 viewers
   - Week 12: 100 viewers (consistency paid off!)

REAL STATISTICS:
- 3x/week consistent streamers grow 2x faster than random
- Viewers show up 80% more reliably for scheduled streams
- Scheduled streamers earn 3x more from subscribers

THE GROWTH FORMULA:
Consistency + Quality Content + Engagement = EXPONENTIAL GROWTH

Start with 1-2 times per week. Show up EVERY TIME.
After 3 months of consistency, scale to 3-4 times/week.

Your viewers are waiting. Don't let them down! 🌑`,
        quiz: [
          {
            question: 'How often should you stream for best growth?',
            options: ['Whenever you want', '1x per week consistently', '3+ times/week consistently', 'Daily'],
            correct: 2
          }
        ]
      },
      {
        id: 'lesson_3_2',
        title: 'Engagement is Everything',
        duration: '9 min',
        content: `Viewers follow personalities. Be a personality!

GOLDEN RULE:
You're not just streaming content.
You're building a COMMUNITY around YOU.

3 ENGAGEMENT TECHNIQUES:

1. CHAT INTERACTION (Most Important!)
   ✓ Read chat messages OUT LOUD
   ✓ Respond to every question personally
   ✓ Remember viewer names ("Hey Sarah!")
   ✓ Ask questions: "What should I play next?"
   ✓ Have actual conversations (not just talking)
   ✓ Show genuine interest in people

   Example:
   Chat: "Hey! Love your streams!"
   You: "Thanks Sarah! What's your favorite game I've played?"
   Chat: "The horror one from last week"
   You: "YES! That was insane. Let me know if I should replay it!"

2. REACT AUTHENTICALLY
   ✓ Laugh when something's funny (genuinely)
   ✓ Get scared when horror jumps scare you (real reaction)
   ✓ Celebrate viewer wins with them (show excitement)
   ✓ Be genuine (viewers spot fake instantly)
   ✓ Show your real emotions (it's ok to be human!)

   Fake response: "That's... interesting."
   Real response: "WAIT WHAT?! Did that just happen?!"

3. BUILD COMMUNITY TRADITIONS
   ✓ Remember recurring viewers
   ✓ Give inside jokes/references
   ✓ Ask about their lives ("How was your week?")
   ✓ Create community traditions
   ✓ Feature top chatters on stream
   ✓ Give shout-outs to loyal viewers

   Community Tradition Ideas:
   - "Stream Bingo" (viewers predict what'll happen)
   - Running jokes ("That's what [Viewer Name] says!")
   - Prediction contests (viewers vote on outcomes)
   - Chat challenges (viewers dare you to do things)
   - Weekly Q&A with viewers

ENGAGEMENT IMPACT:
- Streams with active chat interaction = 3x more retention
- Streamers who remember names = viewers become subscribers
- Communities with traditions = viral growth through word of mouth

REMEMBER THIS:
Viewers don't follow content. They follow YOU.
Engage like you actually care. Because you do. 🌑`,
        quiz: [
          {
            question: 'What is the #1 way to retain viewers?',
            options: ['Better graphics', 'Interact with chat', 'Play trending games', 'Stream longer'],
            correct: 1
          }
        ]
      },
      {
        id: 'lesson_3_3',
        title: 'Stream Title & Description Hacks',
        duration: '8 min',
        content: `Your title is your first impression. Make it POWERFUL.

ANATOMY OF A GREAT STREAM TITLE:

WEAK: "Playing horror games"
BETTER: "First Playthrough - Resident Evil 7 - Let's Get Scared Together!"
BEST: "🌑 RESIDENT EVIL 7 First Time? | Scared React Stream | Chat Controls Difficulty 👻"

What makes it better?
✓ Clear game/content name (searchable)
✓ Emoji for visibility (stands out on homepage)
✓ Viewer benefit (chat controls = interaction)
✓ Emotional hook (scared react = entertainment)
✓ Call-to-action (controls difficulty = engagement)

TITLE FORMULAS THAT WORK:

Formula 1: [Emotion] + [Content] + [Hook]
"😱 HORROR GAMES | First Playthrough | Chat Picks Next"

Formula 2: [Game] + [Status] + [Uniqueness]
"Resident Evil Village - BLIND PLAYTHROUGH - Wrong Decisions Only"

Formula 3: [Activity] + [Goal] + [Incentive]
"Speedrun Attempt - Trying for World Record - $100 on Stream"

Formula 4: [Personality] + [Activity] + [Viewer Benefit]
"Chill Horror Streaming - Cozy Vibes - Chat Hanging Out"

DESCRIPTION BEST PRACTICES:

Great descriptions include:
✓ Game title (for searchability)
✓ Category (Horror, Thriller, IRL, etc)
✓ Stream focus ("First playthrough, blind, chat helps")
✓ Schedule ("Live Fridays 9pm EST")
✓ Social links ("Follow on Twitter: @[you]")
✓ Discord community ("Join Discord: [link]")

EXAMPLE DESCRIPTION:
"🌑 First playthrough of Resident Evil 7!
Horror | Blind playthrough | Chat controlled difficulty
Live every Friday 9pm EST
Community Discord: discord.gg/[yours]
Follow: @[your-twitter]
Thanks for watching! 🖤"

VISIBILITY TIPS:
- Use keywords in title (game name, category)
- Use 2-3 emojis (stands out on home page)
- Be specific (not just "Gaming")
- Change title slightly each stream (keeps fresh)
- Test different titles (track which gets most clicks)

WHAT TO AVOID:
✗ ALL CAPS EVERYWHERE (looks like spam)
✗ Clickbait with no substance (viewers leave immediately)
✗ Too many emojis (hard to read, looks unprofessional)
✗ No game name (viewers don't know what you're playing)
✗ Misleading content (viewers won't come back)

REAL EXAMPLE RESULTS:
Title: "Playing Games" - 5 viewers
Title: "🌑 HORROR GAMES - Chat Controls Game - First Playthrough" - 85 viewers

Same streamer. Different title. 17x MORE VIEWERS!

Your title is your marketing. Make every character count! 💯`,
        quiz: [
          {
            question: 'What makes a title more visible on the homepage?',
            options: ['Longer text', 'Emojis and keywords', 'All caps', 'No special characters'],
            correct: 1
          }
        ]
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'How often should you stream for best growth?',
        options: ['As much as possible', 'Consistently on schedule', 'Whenever you feel like it', 'Only on weekends'],
        correct: 1
      },
      {
        id: 'q2',
        question: 'What is the most important factor for viewer retention?',
        options: ['Graphics quality', 'Engagement and personality', 'Stream length', 'Game popularity'],
        correct: 1
      },
      {
        id: 'q3',
        question: 'What should your stream title include?',
        options: [
          'Only your name',
          'Game name, emojis, viewer benefit',
          'All caps spam',
          'Just "gaming"'
        ],
        correct: 1
      }
    ]
  }
};

// ============================================
// ACADEMY SERVICE FUNCTIONS
// ============================================

const completeAcademyLesson = async (userId, moduleId, lessonId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      academyProgress: arrayUnion({
        moduleId,
        lessonId,
        completedAt: serverTimestamp()
      })
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
  }
};

const completeAcademy = async (userId) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      academyComplete: true,
      academyCompletedAt: serverTimestamp(),
      nyx_tokens: arrayUnion({
        type: 'academy_completion',
        amount: 10,
        grantedAt: serverTimestamp(),
        description: 'Academy Completion Bonus'
      })
    });
  } catch (error) {
    console.error('Error completing academy:', error);
  }
};

// ============================================
// NYX ACADEMY SCREEN COMPONENT
// ============================================

export default function NYXAcademyScreen({ route }) {
  const navigation = useNavigation();
  const [currentModule, setCurrentModule] = useState(ACADEMY_CURRICULUM.MODULE_1);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  const [academyComplete, setAcademyComplete] = useState(false);

  const { userId } = route.params || {};
  const currentLesson = currentModule.lessons[currentLessonIndex];
  const progress = Math.round(((currentLessonIndex + 1) / currentModule.lessons.length) * 100);

  const handleLessonComplete = async () => {
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      const newIndex = currentLessonIndex + 1;
      setCurrentLessonIndex(newIndex);
      setCompletedLessons([...completedLessons, currentLesson.id]);

      if (userId) {
        await completeAcademyLesson(userId, currentModule.id, currentLesson.id);
      }
    } else {
      setShowQuiz(true);
    }
  };

  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answer
    });
  };

  const handleQuizSubmit = async () => {
    const quiz = currentModule.quiz;
    let correctCount = 0;

    quiz.forEach((question) => {
      if (quizAnswers[question.id] === question.correct) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / quiz.length) * 100);

    if (percentage >= 80) {
      setLoading(true);
      try {
        if (userId) {
          await completeAcademy(userId);
        }
        setAcademyComplete(true);
        setLoading(false);
      } catch (error) {
        console.error('Academy completion failed:', error);
        setLoading(false);
      }
    } else {
      Alert.alert(
        'Quiz Failed',
        `You scored ${percentage}%. You need 80% to complete the academy. Try again!`,
        [{ text: 'Retry', onPress: () => setShowQuiz(false) }]
      );
    }
  };

  if (academyComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
          <Text style={styles.headerTitle}>✨ ACADEMY COMPLETE ✨</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <View style={styles.completionCard}>
            <Text style={styles.completionIcon}>🎓</Text>
            <Text style={styles.completionTitle}>Welcome to NyxScream</Text>
            <Text style={styles.completionText}>You have earned your Creator Badge!</Text>

            <View style={styles.awardBox}>
              <Text style={styles.awardTitle}>🌟 Your Rewards:</Text>
              <Text style={styles.awardItem}>✨ Creator Badge (Verified)</Text>
              <Text style={styles.awardItem}>💜 10 NYX Tokens (Starter Pack)</Text>
              <Text style={styles.awardItem}>🎯 Access to Creator Dashboard</Text>
            </View>

            <Text style={styles.nextStepTitle}>Next Step: Build Your 90-Day Streak</Text>
            <Text style={styles.nextStepText}>
              Log in daily to maintain your streak. After 90 consecutive days, you'll unlock monetization and can earn money from your content!
            </Text>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.ctaButtonText}>ENTER THE VOID</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showQuiz) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
          <Text style={styles.headerTitle}>NYX ACADEMY FINAL QUIZ</Text>
          <Text style={styles.headerSubtitle}>Score 80% to complete</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <FlatList
            scrollEnabled={false}
            data={currentModule.quiz}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.quizQuestion}>
                <Text style={styles.questionText}>{item.question}</Text>
                {item.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.quizOption,
                      quizAnswers[item.id] === option && styles.quizOptionSelected
                    ]}
                    onPress={() => handleQuizAnswer(item.id, option)}
                  >
                    <View
                      style={[
                        styles.quizRadio,
                        quizAnswers[item.id] === option && styles.quizRadioSelected
                      ]}
                    />
                    <Text style={styles.quizOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.submitButton, Object.keys(quizAnswers).length === currentModule.quiz.length ? {} : styles.submitButtonDisabled]}
            disabled={Object.keys(quizAnswers).length !== currentModule.quiz.length}
            onPress={handleQuizSubmit}
          >
            {loading ? (
              <ActivityIndicator color={NYXSCREAM.void} />
            ) : (
              <Text style={styles.submitButtonText}>SUBMIT QUIZ</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>NYX ACADEMY</Text>
        <Text style={styles.headerSubtitle}>{currentModule.title}</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}% Complete</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.lessonCard}>
          <Text style={styles.lessonNumber}>LESSON {currentLessonIndex + 1} OF {currentModule.lessons.length}</Text>
          <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
          <Text style={styles.lessonDuration}>⏱️ {currentLesson.duration || '5-10 minutes'}</Text>

          <View style={styles.lessonContent}>
            <Text style={styles.lessonText}>{currentLesson.content}</Text>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleLessonComplete}>
            <Text style={styles.nextButtonText}>
              {currentLessonIndex === currentModule.lessons.length - 1 ? 'TAKE QUIZ' : 'NEXT LESSON'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.lessonsNav}>
          <Text style={styles.lessonsNavTitle}>ALL LESSONS</Text>
          <FlatList
            scrollEnabled={false}
            data={currentModule.lessons}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.lessonNavItem,
                  index === currentLessonIndex && styles.lessonNavItemActive
                ]}
                onPress={() => setCurrentLessonIndex(index)}
              >
                <Text style={styles.lessonNavText}>
                  {completedLessons.includes(item.id) ? '✅' : '◆'} {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NYXSCREAM.void
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.scream
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: NYXSCREAM.scream,
    letterSpacing: 3,
    marginBottom: 5
  },
  headerSubtitle: {
    fontSize: 14,
    color: NYXSCREAM.electric,
    letterSpacing: 2,
    marginBottom: 15
  },
  progressContainer: {
    height: 6,
    backgroundColor: NYXSCREAM.shadow,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10
  },
  progressBar: {
    height: 6,
    backgroundColor: NYXSCREAM.scream,
    borderRadius: 3
  },
  progressText: {
    color: NYXSCREAM.mist,
    fontSize: 12,
    letterSpacing: 1
  },
  content: {
    flex: 1,
    padding: 20
  },
  lessonCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.scream,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20
  },
  lessonNumber: {
    color: NYXSCREAM.electric,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10
  },
  lessonTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8
  },
  lessonDuration: {
    color: NYXSCREAM.mist,
    fontSize: 14,
    marginBottom: 20
  },
  lessonContent: {
    backgroundColor: NYXSCREAM.void,
    borderRadius: 6,
    padding: 15,
    marginBottom: 20
  },
  lessonText: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'monospace'
  },
  nextButton: {
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center'
  },
  nextButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2
  },
  lessonsNav: {
    marginBottom: 30
  },
  lessonsNavTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10
  },
  lessonNavItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderLeftWidth: 3,
    borderLeftColor: NYXSCREAM.shadow,
    marginBottom: 8
  },
  lessonNavItemActive: {
    borderLeftColor: NYXSCREAM.scream,
    backgroundColor: 'rgba(255, 0, 60, 0.1)'
  },
  lessonNavText: {
    color: NYXSCREAM.ghost,
    fontSize: 14
  },
  quizQuestion: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20
  },
  questionText: {
    color: NYXSCREAM.ghost,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: NYXSCREAM.electric,
    marginBottom: 10,
    backgroundColor: 'transparent'
  },
  quizOptionSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderColor: NYXSCREAM.electric
  },
  quizRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: NYXSCREAM.electric,
    marginRight: 12
  },
  quizRadioSelected: {
    backgroundColor: NYXSCREAM.electric
  },
  quizOptionText: {
    color: NYXSCREAM.ghost,
    fontSize: 14
  },
  submitButton: {
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 30
  },
  submitButtonDisabled: {
    opacity: 0.5
  },
  submitButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2
  },
  completionCard: {
    alignItems: 'center',
    paddingVertical: 30
  },
  completionIcon: {
    fontSize: 80,
    marginBottom: 20
  },
  completionTitle: {
    color: NYXSCREAM.scream,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10
  },
  completionText: {
    color: NYXSCREAM.ghost,
    fontSize: 16,
    marginBottom: 30
  },
  awardBox: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 2,
    borderColor: NYXSCREAM.scream,
    borderRadius: 8,
    padding: 20,
    width: '100%',
    marginBottom: 30
  },
  awardTitle: {
    color: NYXSCREAM.scream,
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 15
  },
  awardItem: {
    color: NYXSCREAM.electric,
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20
  },
  nextStepTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center'
  },
  nextStepText: {
    color: NYXSCREAM.mist,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10
  },
  ctaButton: {
    backgroundColor: NYXSCREAM.nyx,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 6,
    alignItems: 'center'
  },
  ctaButtonText: {
    color: NYXSCREAM.ghost,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2
  }
});