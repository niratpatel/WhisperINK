// client/src/screens/EntryDetailScreen.js
// Redesigned with Duolingo-inspired UI

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Animated,
  Share,
  StatusBar,
} from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  moodConfig,
} from '../theme';

const EntryDetailScreen = ({ route, navigation }) => {
  const { entry } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Entry not found.</Text>
      </View>
    );
  }

  let displayDate = 'Date not available';
  try {
    if (entry.createdAt) {
      displayDate = format(new Date(entry.createdAt), "MMMM d, yyyy 'at' h:mm a");
    }
  } catch (e) { displayDate = 'Invalid Date'; }

  const getMoodInfo = (mood) => {
    const config = moodConfig[mood?.toLowerCase()];
    return config || null;
  };

  const moodInfo = getMoodInfo(entry.mood);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${entry.bookTitle || 'My Journal Entry'}\n\n${entry.cinematicEntry || ''}\n\n- Written with WhisperINK`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}>
          {/* Title Card */}
          <View style={styles.titleCard}>
            {/* Mood badge */}
            {moodInfo && (
              <View style={[styles.moodBadge, { backgroundColor: moodInfo.color + '20' }]}>
                <Text style={styles.moodEmoji}>{moodInfo.emoji}</Text>
                <Text style={[styles.moodLabel, { color: moodInfo.color }]}>
                  {moodInfo.label}
                </Text>
              </View>
            )}

            <Text style={styles.title}>{entry.bookTitle || 'Untitled Entry'}</Text>

            {entry.bookAuthor && entry.bookAuthor !== 'Unknown Author' && (
              <Text style={styles.author}>by {entry.bookAuthor}</Text>
            )}

            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.date}>{displayDate}</Text>
            </View>
          </View>

          {/* Content Card */}
          <View style={styles.contentCard}>
            <View style={styles.quoteDecoration}>
              <Ionicons name="chatbubble-ellipses" size={24} color={colors.primaryLight} />
            </View>
            <Text style={styles.cinematicText}>
              {entry.cinematicEntry || 'No content recorded.'}
            </Text>
          </View>

          {/* Original transcription (if different) */}
          {entry.textEntry && entry.textEntry !== entry.cinematicEntry && (
            <View style={styles.originalCard}>
              <Text style={styles.originalLabel}>Original Recording</Text>
              <Text style={styles.originalText}>{entry.textEntry}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },

  // Title Card
  titleCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.base,
    ...shadows.md,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  moodEmoji: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  moodLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyBold,
  },
  title: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.fontSize['2xl'],
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  author: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },

  // Content Card
  contentCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.base,
    ...shadows.md,
  },
  quoteDecoration: {
    marginBottom: spacing.md,
  },
  cinematicText: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.lg,
    lineHeight: 30,
    color: colors.textPrimary,
  },

  // Original Card
  originalCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryLight,
  },
  originalLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  originalText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});

export default EntryDetailScreen;