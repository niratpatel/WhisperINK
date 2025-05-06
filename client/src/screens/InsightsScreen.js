import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../services/api';

const InsightsScreen = () => {
    const [insights, setInsights] = useState(null);
    const [aiInsights, setAiInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(true);
    const [error, setError] = useState(null);
    const [aiError, setAiError] = useState(null);
  
    useEffect(() => {
      fetchInsights();
      fetchAIInsights();
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
      setAiError(null);
      const data = await api.getAIInsights();
      setAiInsights(data);
    } catch (err) {
      // Don't show error for AI insights, as they might not be available yet
      console.error('AI Insights error:', err);
      setAiInsights(null);
    } finally {
      setAiLoading(false);
    }
  };

  const getMoodEmoji = (emotion) => {
    if (!emotion) return '✨';
    
    const emojiMap = {
      'happy': '😊',
      'joyful': '😄',
      'excited': '🤩',
      'content': '😌',
      'calm': '😌',
      'peaceful': '😌',
      'sad': '😔',
      'melancholy': '😔',
      'anxious': '😟',
      'worried': '😟',
      'angry': '😠',
      'frustrated': '😤',
      'confused': '🤔',
      'contemplative': '🤔',
      'inspired': '💡',
      'motivated': '💪',
      'grateful': '🙏',
      'hopeful': '🌱',
      'reflective': '💭',
      'thoughtful': '💭'
    };
    
    // Convert to lowercase and find exact match
    const lowerEmotion = emotion.toLowerCase();
    if (emojiMap[lowerEmotion]) return emojiMap[lowerEmotion];
    
    // If no exact match, look for partial matches
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerEmotion.includes(key) || key.includes(lowerEmotion)) {
        return emoji;
      }
    }
    
    // Default emoji if no match found
    return '✨';
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#9c6644" />
        <Text style={styles.loadingText}>Analyzing your journal...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchInsights}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!insights || insights.entryCount === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="analytics-outline" size={60} color="#9c6644" />
        <Text style={styles.emptyText}>Not enough journal entries yet.</Text>
        <Text style={styles.emptySubtext}>Add more entries to see your insights.</Text>
      </View>
    );
  }

  // Helper function to get the dominant mood
  const getDominantMood = () => {
    const moods = insights.moodDistribution;
    let maxMood = 'unspecified';
    let maxCount = 0;
    
    Object.entries(moods).forEach(([mood, count]) => {
      if (mood !== 'unspecified' && count > maxCount) {
        maxMood = mood;
        maxCount = count;
      }
    });
    
    const moodLabels = {
      contemplative: 'Contemplative',
      inspired: 'Inspired',
      confused: 'Confused',
      seeking: 'Seeking',
      unspecified: 'Neutral'
    };
    
    return moodLabels[maxMood] || 'Neutral';
  };

  // Helper function to get most active day
  const getMostActiveDay = () => {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Your Journal Insights</Text>
        <Text style={styles.headerSubtitle}>
          Based on {insights.entryCount} {insights.entryCount === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      {/* AI-Generated Insight Banner */}
      {!aiLoading && aiInsights && aiInsights.moodAnalysis && (
        <View style={styles.aiInsightBanner}>
          <Text style={styles.aiInsightLabel}>
            <Ionicons name="sparkles" size={16} color="#9c6644" /> AI-POWERED INSIGHT
          </Text>
        </View>
      )}

      {/* Weekly Journey Card - AI Generated */}
      {!aiLoading && aiInsights && aiInsights.moodAnalysis && (
        <View style={styles.weeklyJourneyContainer}>
          <View style={styles.weeklyJourneyHeader}>
            <Text style={styles.weeklyJourneyTitle}>Your Weekly Journey</Text>
            <Text style={styles.weeklyJourneyDate}>
              {new Date(aiInsights.periodStartDate).toLocaleDateString()} - {new Date(aiInsights.periodEndDate).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.weeklyJourneyContent}>
            <Text style={styles.weeklyJourneyEmoji}>
              {getMoodEmoji(aiInsights.moodAnalysis.dominantEmotion)}
            </Text>
            <Text style={styles.weeklyJourneyDescription}>
              {aiInsights.moodAnalysis.moodArcDescription}
            </Text>
            {aiInsights.moodAnalysis.dominantEmotion && (
              <View style={styles.dominantEmotionTag}>
                <Text style={styles.dominantEmotionText}>
                  {aiInsights.moodAnalysis.dominantEmotion}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Key Insights Cards */}
      <View style={styles.insightCardsContainer}>
        <View style={styles.insightCard}>
          <Ionicons name="heart-outline" size={24} color="#9c6644" />
          <Text style={styles.insightCardTitle}>Dominant Mood</Text>
          <Text style={styles.insightCardValue}>{getDominantMood()}</Text>
        </View>
        
        <View style={styles.insightCard}>
          <Ionicons name="calendar-outline" size={24} color="#9c6644" />
          <Text style={styles.insightCardTitle}>Most Active Day</Text>
          <Text style={styles.insightCardValue}>{getMostActiveDay()}</Text>
        </View>
      </View>
      
      {/* Mood Distribution */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Mood Distribution</Text>
        <View style={styles.moodDistributionContainer}>
          {Object.entries(insights.moodDistribution).map(([mood, count]) => {
            // Skip empty mood
            if (mood === '') return null;
            
            const moodLabels = {
              contemplative: 'Contemplative',
              inspired: 'Inspired',
              confused: 'Confused',
              seeking: 'Seeking',
              unspecified: 'Unspecified'
            };
            
            const moodIcons = {
              contemplative: 'leaf-outline',
              inspired: 'bulb-outline',
              confused: 'help-circle-outline',
              seeking: 'search-outline',
              unspecified: 'ellipsis-horizontal-outline'
            };
            
            const percentage = Math.round((count / insights.entryCount) * 100);
            
            return (
              <View key={mood} style={styles.moodItem}>
                <View style={styles.moodIconContainer}>
                  <Ionicons name={moodIcons[mood] || 'ellipsis-horizontal-outline'} size={18} color="#9c6644" />
                </View>
                <View style={styles.moodLabelContainer}>
                  <Text style={styles.moodLabel}>{moodLabels[mood] || 'Unspecified'}</Text>
                  <Text style={styles.moodCount}>{count} entries</Text>
                </View>
                <View style={styles.moodBarContainer}>
                  <View style={[styles.moodBar, { width: `${percentage}%` }]} />
                  <Text style={styles.moodPercentage}>{percentage}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Common Themes */}
      {insights.commonThemes.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Common Themes</Text>
          <View style={styles.themesContainer}>
            {insights.commonThemes.map((theme, index) => (
              <View key={index} style={styles.themeItem}>
                <Text style={styles.themeName}>{theme.name}</Text>
                <Text style={styles.themeCount}>{theme.count} mentions</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Personal Observation */}
      <View style={styles.observationContainer}>
        <Text style={styles.observationTitle}>Personal Observation</Text>
        <Text style={styles.observationText}>
          You seem most reflective on {getMostActiveDay()}s, often with a {getDominantMood().toLowerCase()} mood.
          {insights.commonThemes.length > 0 ? ` Your entries frequently touch on themes of ${insights.commonThemes[0].name.toLowerCase()}.` : ''}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({

     // New styles for AI insights
  aiInsightBanner: {
    marginBottom: 12,
  },
  aiInsightLabel: {
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    color: '#9c6644',
    textAlign: 'center',
  },
  weeklyJourneyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(156, 102, 68, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  weeklyJourneyHeader: {
    marginBottom: 12,
  },
  weeklyJourneyTitle: {
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    color: '#3a3a3a',
  },
  weeklyJourneyDate: {
    fontFamily: 'Lato-Regular',
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  weeklyJourneyContent: {
    alignItems: 'center',
  },
  weeklyJourneyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  weeklyJourneyDescription: {
    fontFamily: 'Lora-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#3a3a3a',
    textAlign: 'center',
    marginBottom: 16,
  },
  dominantEmotionTag: {
    backgroundColor: 'rgba(156, 102, 68, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'center',
  },
  dominantEmotionText: {
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    color: '#9c6644',
  },
 
  container: {
    flex: 1,
    backgroundColor: '#f8f4e3',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f4e3',
    padding: 20,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Lato-Bold',
    fontSize: 24,
    color: '#3a3a3a',
  },
  headerSubtitle: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  insightCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  insightCardTitle: {
    fontFamily: 'Lato-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  insightCardValue: {
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    color: '#3a3a3a',
    marginTop: 4,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    color: '#3a3a3a',
    marginBottom: 16,
  },
  moodDistributionContainer: {
    gap: 12,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodIconContainer: {
    width: 30,
    alignItems: 'center',
  },
  moodLabelContainer: {
    width: 120,
  },
  moodLabel: {
    fontFamily: 'Lato-Regular',
    fontSize: 14,
    color: '#3a3a3a',
  },
  moodCount: {
    fontFamily: 'Lato-Regular',
    fontSize: 12,
    color: '#666',
  },
  moodBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#f0e6d2',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodBar: {
    height: '100%',
    backgroundColor: '#9c6644',
    borderRadius: 10,
  },
  moodPercentage: {
    position: 'absolute',
    right: 8,
    fontFamily: 'Lato-Bold',
    fontSize: 12,
    color: '#fff',
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeItem: {
    backgroundColor: 'rgba(156, 102, 68, 0.1)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  themeName: {
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    color: '#9c6644',
  },
  themeCount: {
    fontFamily: 'Lato-Regular',
    fontSize: 12,
    color: '#9c6644',
  },
  observationContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9c6644',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  observationTitle: {
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    color: '#3a3a3a',
    marginBottom: 8,
  },
  observationText: {
    fontFamily: 'Lora-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#3a3a3a',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    color: '#9c6644',
  },
  errorText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#9c6644',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Lato-Bold',
    fontSize: 14,
    color: '#fff',
  },
  emptyText: {
    fontFamily: 'Lato-Bold',
    fontSize: 18,
    color: '#3a3a3a',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default InsightsScreen;