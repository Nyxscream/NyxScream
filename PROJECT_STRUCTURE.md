# NYXSCREAM - PROJECT STRUCTURE & CODE TREE

**Version:** 1.0
**Last Updated:** August 2, 2026

---

## FOLDER STRUCTURE

NyxScream/
├── src/
│   ├── services/ (19 Services)
│   │   ├── firebase.js
│   │   ├── AuthContext.js
│   │   ├── EmailService.js
│   │   ├── UserService.js
│   │   ├── CreatorService.js
│   │   ├── CreatorVerificationService.js
│   │   ├── SubscriptionService.js
│   │   ├── PaymentService.js
│   │   ├── WatchHistoryService.js
│   │   ├── NotificationService.js
│   │   ├── PushNotificationService.js
│   │   ├── AnalyticsService.js
│   │   ├── MuxService.js
│   │   ├── ModeratorService.js
│   │   ├── NYXAcademyService.js
│   │   ├── StreakService.js
│   │   ├── PhilanthropyService.js
│   │   ├── TokenService.js
│   │   ├── i18nService.js
│   │   └── Theme.js
│   │
│   ├── screens/ (16 Screens)
│   │   ├── ShadowGateScreen.js
│   │   ├── VoidScreen.js
│   │   ├── EchoScreen.js
│   │   ├── CastScreen.js
│   │   ├── ScreamScreen.js
│   │   ├── ShadowStudioScreen.js
│   │   ├── EchoPlayerScreen.js
│   │   ├── LiveScreamScreen.js
│   │   ├── SettingsScreen.js
│   │   ├── ForgotPasswordScreen.js
│   │   ├── ProfileEditScreen.js
│   │   ├── LanguageSelectScreen.js
│   │   ├── VerificationScreen.js
│   │   ├── NYXAcademyScreen.js
│   │   ├── PhilanthropyDashboardScreen.js
│   │   └── TokenDashboardScreen.js
│   │
│   ├── components/ (4 Components)
│   │   ├── NyxButton.js
│   │   ├── NyxCard.js
│   │   ├── MediaCard.js
│   │   └── index.js
│   │
│   └── assets/
│       ├── fonts/
│       └── images/
│
├── .env
├── .gitignore
├── App.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── TermsOfService.md
├── PrivacyPolicy.md
├── ROADMAP.md
├── PROJECT_STRUCTURE.md
├── .expo/
├── .git/
└── node_modules/

---

## SERVICES (19 Total)

Authentication & Security:
- AuthContext.js - Auth state management
- firebase.js - Firebase initialization
- EmailService.js - Password reset & verification

User Management:
- UserService.js - User profiles
- CreatorService.js - Creator features
- ModeratorService.js - Content moderation (toxicity detection)

Monetization:
- SubscriptionService.js - Tier management (Void/Shadow/Abyss)
- PaymentService.js - Stripe + Google Play + App Store IAP
- PhilanthropyService.js - Charity system
- TokenService.js - NYX token economy

Content:
- MuxService.js - Video streaming
- WatchHistoryService.js - Watch history tracking
- AnalyticsService.js - Usage analytics

Creator Tools:
- CreatorVerificationService.js - Tick marks (Gray/Blue/Yellow/Golden)
- NYXAcademyService.js - Creator onboarding academy
- StreakService.js - Consistency streak tracking

User Experience:
- NotificationService.js - In-app notifications
- PushNotificationService.js - Push alerts (Expo)
- i18nService.js - Internationalization (8 languages)
- Theme.js - Design tokens & colors

---

## SCREENS (16 Total)

Authentication:
- ShadowGateScreen - Login/Signup form

User Browsing:
- VoidScreen - Personalized home feed
- EchoScreen - Search & discover creators
- EchoPlayerScreen - VOD video player

Creator/Live Features:
- CastScreen - Upload VOD or start live stream
- ScreamScreen - Real-time live chat
- LiveScreamScreen - Watch live broadcasts
- ShadowStudioScreen - Creator analytics dashboard

User Management:
- SettingsScreen - App settings & preferences
- ProfileEditScreen - Edit profile information
- LanguageSelectScreen - Select language (i18n)
- VerificationScreen - Creator verification status

Special Features:
- NYXAcademyScreen - Creator onboarding academy
- PhilanthropyDashboardScreen - Charity integration
- TokenDashboardScreen - NYX wallet & balance
- ForgotPasswordScreen - Password recovery

---

## COMPONENTS (4 Total)

- NyxButton - Reusable styled button (primary/secondary variants)
- NyxCard - Themed card container wrapper
- MediaCard - Video/stream card with thumbnail, title, creator, stats
- index.js - Centralized component exports

---

## DEPENDENCIES

Core:
- react: 18.2.0
- react-native: 0.72.x
- expo: ^49.0.0

Navigation:
- @react-navigation/native: ^6.1.9
- @react-navigation/stack: ^6.3.20
- @react-navigation/bottom-tabs: ^6.5.11

Backend:
- firebase: ^9.23.0
- react-native-dotenv: ^3.4.11

Payments:
- react-native-iap: ^12.12.0

Streaming:
- expo-av: ^13.9.0

UI:
- expo-linear-gradient: ^12.3.0
- expo-font: ^11.4.0

---

## COLOR PALETTE

void:     #0D0221 (Base background)
shadow:   #1A0A2E (Secondary background)
scream:   #FF003C (Action/Danger)
nyx:      #9D00FF (Accent)
electric: #00F0FF (Highlight)
ghost:    #E0E0E0 (Light text)
mist:     #6B6B6B (Muted text)

---

## PROJECT STATISTICS

Services: 19 files
Screens: 16 files
Components: 4 files
Total Files: 45+
Code Lines: 15,000+
Languages: 8 (EN, ES, FR, DE, JA, PT, RU, ZH)
Git Commits: 5

---

## TECHNOLOGY STACK

Frontend: React Native + Expo
Backend: Firebase (Auth, Firestore)
Payments: Stripe + Google Play IAP + App Store IAP
Streaming: Mux
Chat: Socket.io
Notifications: Expo Notifications
Internationalization: Custom i18n Service

---

## VERSION 1.0 FEATURES

✅ User Authentication
✅ Video Streaming (VOD + Live)
✅ Real-time Live Chat
✅ Creator Dashboard
✅ 3-Tier Subscriptions
✅ Payment Integration
✅ Content Moderation
✅ Watch History Tracking
✅ Creator Verification (4 Ticks)
✅ Push Notifications
✅ Internationalization (8 languages)
✅ Creator Academy
✅ NYX Token System
✅ Streak Tracking
✅ Charity Integration
✅ Email Services
✅ Profile Management

---

## NAVIGATION STRUCTURE

Root Navigator
├── Auth Stack
│   └── ShadowGateScreen
│       └── ForgotPasswordScreen
│
└── Main Stack
    ├── Main Tabs
    │   ├── Void (VoidScreen)
    │   ├── Echo (EchoScreen)
    │   ├── Cast (CastScreen)
    │   ├── Scream (ScreamScreen)
    │   └── Shadow (ShadowStudioScreen)
    │
    ├── Stack Screens
    │   ├── EchoPlayer
    │   ├── LiveScream
    │   └── Settings
    │
    └── Modal Screens
        ├── NYXAcademy
        ├── PhilanthropyDashboard
        └── TokenDashboard

---

## STATUS

✅ iOS App Store Ready
✅ Google Play Store Ready
✅ Web Support
✅ Security: Firebase Auth
✅ Performance: Optimized
✅ Production Ready

---

Built with 💜 by Isaac Solomon Robert
NyxScream © 2026 - Where Darkness Meets Sound
Status: PRODUCTION READY v1.0