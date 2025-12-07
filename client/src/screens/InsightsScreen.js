// client/src/screens/InsightsScreen.js
// Redesigned with Duolingo-inspired UI - Gamification & Fun Stats

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../services/api';
import { Mascot } from '../components';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  moodConfig,
} from '../theme';

const InsightsScreen = ({ navigation }) => {
  const [insights, setInsights] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchInsights();
    fetchAIInsights();

    // Run animations
    Animated.stagger(200, [
      Animated.spring(headerAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(cardsAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getJournalInsights();
      setInsights(data);
    } catch (err) {
      setError('Failed to load insights. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    try {
      setAiLoading(true);
      const data = await api.getAIInsights();
      setAiInsights(data);
    } catch (err) {
      console.error('AI Insights error:', err);
      setAiInsights(null);
    } finally {
      setAiLoading(false);
    }
  };

  const getMoodEmoji = (emotion) => {
    if (!emotion) return '✨';
    const config = moodConfig[emotion.toLowerCase()];
    return config?.emoji || '✨';
  };

  // Get achievement badges based on entry count
  const getAchievements = (count) => {
    const achievements = [];
    if (count >= 1) achievements.push({ emoji: '🌱', label: 'First Entry', unlocked: true });
    if (count >= 5) achievements.push({ emoji: '📝', label: '5 Entries', unlocked: count >= 5 });
    if (count >= 10) achievements.push({ emoji: '🔥', label: '10 Entries', unlocked: count >= 10 });
    if (count >= 30) achievements.push({ emoji: '⭐', label: '30 Entries', unlocked: count >= 30 });
    if (count >= 100) achievements.push({ emoji: '🏆', label: 'Century!', unlocked: count >= 100 });
    return achievements.filter(a => a.unlocked);
  };

  const getDominantMood = () => {
    if (!insights?.moodDistribution) return { mood: 'neutral', count: 0 };

    const moods = insights.moodDistribution;
    let maxMood = 'unspecified';
    let maxCount = 0;

    Object.entries(moods).forEach(([mood, count]) => {
      if (mood !== 'unspecified' && mood !== '' && count > maxCount) {
        maxMood = mood;
        maxCount = count;
      }
    });

    return { mood: maxMood, count: maxCount };
  };

  const getMostActiveDay = () => {
    if (!insights?.activityPatterns) return 'No pattern yet';

    const days = insights.activityPatterns;
    let maxDay = '';
    let maxCount = 0;

    Object.entries(days).forEach(([day, count]) => {
      if (count > maxCount) {
        maxDay = day;
        maxCount = count;
      }
    });

    return maxDay || 'No pattern yet';
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing your journal...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <Mascot mood="thinking" message={error} />
        <TouchableOpacity style={styles.retryButton} onPress={fetchInsights}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!insights || insights.entryCount === 0) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <Mascot mood="encouraging" size="large" message="Start journaling to see your insights! 📊" />
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Record')}
        >
          <Ionicons name="mic" size={20} color={colors.textOnPrimary} />
          <Text style={styles.startButtonText}>Record First Entry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const achievements = getAchievements(insights.entryCount);
  const dominantMood = getDominantMood();
  const mostActiveDay = getMostActiveDay();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            })
          }],
        },
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Insights</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <Animated.View style={[
          styles.statsRow,
          {
            opacity: cardsAnim,
            transform: [{
              translateY: cardsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              })
            }],
          },
        ]}>
          <View style={[styles.statCard, { backgroundColor: colors.primarySoft }]}>
            <Text style={styles.statEmoji}>📝</Text>
            <Text style={styles.statValue}>{insights.entryCount}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.moods.calm + '20' }]}>
            <Text style={styles.statEmoji}>{getMoodEmoji(dominantMood.mood)}</Text>
            <Text style={styles.statValue}>{dominantMood.mood === 'unspecified' ? 'Neutral' : dominantMood.mood}</Text>
            <Text style={styles.statLabel}>Top Mood</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.secondary + '20' }]}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={styles.statValue}>{mostActiveDay.slice(0, 3)}</Text>
            <Text style={styles.statLabel}>Active Day</Text>
          </View>
        </Animated.View>

        {/* Achievement Badges */}
        {achievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>🏅 Your Achievements</Text>
            <View style={styles.achievementsList}>
              {achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementBadge}>
                  <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                  <Text style={styles.achievementLabel}>{achievement.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Weekly Journey */}
        {!aiLoading && aiInsights?.moodAnalysis && (
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyHeader}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
              <Text style={styles.weeklyTitle}>Weekly Journey</Text>
            </View>
            <Text style={styles.weeklyEmoji}>
              {getMoodEmoji(aiInsights.moodAnalysis.dominantEmotion)}
            </Text>
            <Text style={styles.weeklyDescription}>
              {aiInsights.moodAnalysis.moodArcDescription}
            </Text>
            {aiInsights.moodAnalysis.dominantEmotion && (
              <View style={styles.emotionTag}>
                <Text style={styles.emotionText}>
                  {aiInsights.moodAnalysis.dominantEmotion}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Mood Distribution */}
        <View style={styles.moodSection}>
          <Text style={styles.sectionTitle}>😊 Mood Distribution</Text>
          {Object.entries(insights.moodDistribution).map(([mood, count]) => {
            if (mood === '' || count === 0) return null;

            const percentage = Math.round((count / insights.entryCount) * 100);
            const config = moodConfig[mood.toLowerCase()];
            const barColor = config?.color || colors.primary;

            return (
              <View key={mood} style={styles.moodRow}>
                <View style={styles.moodInfo}>
                  <Text style={styles.moodEmoji}>{config?.emoji || '📝'}</Text>
                  <Text style={styles.moodName}>{config?.label || mood}</Text>
                </View>
                <View style={styles.moodBarContainer}>
                  <View style={[styles.moodBar, { width: `${percentage}%`, backgroundColor: barColor }]} />
                </View>
                <Text style={styles.moodPercentage}>{percentage}%</Text>
              </View>
            );
          })}
        </View>

        {/* Common Themes */}
        {insights.commonThemes?.length > 0 && (
          <View style={styles.themesSection}>
            <Text style={styles.sectionTitle}>💭 Common Themes</Text>
            <View style={styles.themesList}>
              {insights.commonThemes.map((theme, index) => (
                <View key={index} style={styles.themeChip}>
                  <Text style={styles.themeText}>{theme.name}</Text>
                  <Text style={styles.themeCount}>{theme.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Personal Insight */}
        <View style={styles.insightCard}>
          <Ionicons name="bulb" size={24} color={colors.primary} />
          <Text style={styles.insightText}>
            You tend to journal on {mostActiveDay}s with a {dominantMood.mood.toLowerCase()} mood.
            {insights.commonThemes?.length > 0 ? ` Your entries often explore ${insights.commonThemes[0]?.name?.toLowerCase()}.` : ''}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: Platform.OS === 'ios' ? 60 : spacing['2xl'],
    paddingBottom: spacing.base,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize['xl'],
    fontFamily: typography.fontFamily.headingBold,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xs,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Achievements
  achievementsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementBadge: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    minWidth: 80,
    ...shadows.sm,
  },
  achievementEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  achievementLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Weekly Card
  weeklyCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weeklyTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  weeklyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  weeklyDescription: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.heading,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  emotionTag: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.full,
  },
  emotionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.primary,
    textTransform: 'capitalize',
  },

  // Mood Distribution
  moodSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  moodEmoji: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  moodName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  moodBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  moodBar: {
    height: '100%',
    borderRadius: 6,
  },
  moodPercentage: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },

  // Themes
  themesSection: {
    marginBottom: spacing.xl,
  },
  themesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  themeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.primary,
  },
  themeCount: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.textOnPrimary,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: spacing.sm,
    overflow: 'hidden',
  },

  // Personal Insight
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  insightText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.textPrimary,
    lineHeight: 22,
    marginLeft: spacing.md,
  },

  // Buttons
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    ...shadows.md,
  },
  startButtonText: {
    color: colors.textOnPrimary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyBold,
    marginLeft: spacing.sm,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    ...shadows.md,
  },
  retryButtonText: {
    color: colors.textOnPrimary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyBold,
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.textSecondary,
  },
});

export default InsightsScreen;