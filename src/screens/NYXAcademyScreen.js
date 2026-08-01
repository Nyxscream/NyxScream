// NYX Academy Screen - Learn the poetic philosophy
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
import { ACADEMY_CURRICULUM, completeAcademyLesson, completeAcademy, getCreatorBadge } from '../services/NYXAcademyService';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

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
      // All lessons done, show quiz
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
      // Passed! Award badge and 10 NYX tokens
      setLoading(true);
      try {
        if (userId) {
          await completeAcademy(userId);
        }
        setAcademyComplete(true);
        setLoading(false);
      } catch (error) {
        console.error('◉ Academy completion failed:', error);
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
          <Text style={styles.lessonDuration}>⏱️ {currentLesson.duration} minutes</Text>

          <View style={styles.lessonContent}>
            <Text style={styles.lessonText}>{currentLesson.content}</Text>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleLessonComplete}>
            <Text style={styles.nextButtonText}>
              {currentLessonIndex === currentModule.lessons.length - 1 ? 'TAKE QUIZ' : 'NEXT LESSON'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lessons Navigation */}
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