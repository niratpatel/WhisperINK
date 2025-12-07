// client/src/screens/RecordScreen.js
// Redesigned with Duolingo-inspired UI

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { Mascot } from '../components';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  moodConfig,
} from '../theme';

const RecordScreen = ({ navigation }) => {
  const recordingRef = useRef(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedMood, setSelectedMood] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Animations
  const recordBtnScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Mood options with emojis
  const moods = Object.entries(moodConfig).map(([id, config]) => ({
    id,
    ...config,
  }));

  // Encouraging phrases during processing
  const phrases = [
    "✨ Transforming your thoughts...",
    "📝 Crafting your story...",
    "🎨 Adding some magic...",
    "💫 Almost there...",
    "🌟 Making it beautiful...",
  ];
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    // Animate header on mount
    Animated.spring(headerAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    if (permissionResponse?.status !== 'granted') requestPermission();
  }, []);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      // Wave animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [isRecording]);

  // Phrase cycling during loading
  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentPhrase(prev => (prev + 1) % phrases.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handlePressIn = () => {
    Animated.spring(recordBtnScale, {
      toValue: 0.9,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(recordBtnScale, {
      toValue: 1,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        Alert.alert('Permission required', 'Microphone access is needed.');
        await requestPermission();
        return;
      }

      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (err) {
          console.warn('Error unloading previous recording:', err.message);
        }
        recordingRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MEDIUM,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      recordingRef.current = recording;
      setIsRecording(true);
      setAudioUri(null);
    } catch (err) {
      console.error('Error starting recording', err);
      Alert.alert('Error', 'Failed to start recording.');
    }
  }

  async function stopRecording() {
    if (!recordingRef.current) return;
    setIsRecording(false);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      setAudioUri(uri);
      recordingRef.current = null;

      if (uri) await uploadAudio(uri);
    } catch (err) {
      console.error('Error stopping recording', err);
      Alert.alert('Error', 'Failed to stop recording.');
      recordingRef.current = null;
    }
  }

  async function uploadAudio(uri) {
    if (!uri) {
      Alert.alert('Error', 'No audio found.');
      return;
    }

    setIsLoading(true);

    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) throw new Error('Recording not found.');

      const filename = uri.split('/').pop();
      const formData = new FormData();
      formData.append('audio', { uri, name: filename || `recording.m4a`, type: 'audio/m4a' });
      formData.append('bookTitle', bookTitle);
      formData.append('bookAuthor', bookAuthor);
      formData.append('mood', selectedMood);

      await api.createJournalEntry(formData);

      // Show celebration
      setUploadSuccess(true);
      Animated.spring(celebrateAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        setBookTitle('');
        setBookAuthor('');
        setAudioUri(null);
        setSelectedMood('');
        setUploadSuccess(false);
        celebrateAnim.setValue(0);
        navigation.goBack();
      }, 1500);

    } catch (error) {
      console.error('Upload failed:', error?.response?.data || error.message);
      Alert.alert('Upload Failed', error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const renderMoodSelector = () => (
    <View style={styles.moodSection}>
      <Text style={styles.sectionLabel}>How are you feeling?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodScroll}
      >
        {moods.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodChip,
                isSelected && { backgroundColor: mood.color, borderColor: mood.color },
              ]}
              onPress={() => setSelectedMood(isSelected ? '' : mood.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[
                styles.moodLabel,
                isSelected && styles.moodLabelSelected,
              ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // Success celebration screen
  if (uploadSuccess) {
    return (
      <View style={styles.celebrateContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <Animated.View style={{
          transform: [{ scale: celebrateAnim }],
          opacity: celebrateAnim,
        }}>
          <Mascot mood="celebrating" size="large" message="Awesome! Your entry is saved! 🎉" />
        </Animated.View>
      </View>
    );
  }

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
            }),
          }],
        },
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Record Entry</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Fields */}
        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title (optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="book" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Give your entry a name"
                placeholderTextColor={colors.textLight}
                value={bookTitle}
                onChangeText={setBookTitle}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Author (optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your name or pen name"
                placeholderTextColor={colors.textLight}
                value={bookAuthor}
                onChangeText={setBookAuthor}
              />
            </View>
          </View>
        </View>

        {/* Mood Selector */}
        {renderMoodSelector()}

        {/* Recording Area */}
        <View style={styles.recordSection}>
          {/* Pulse ring when recording */}
          {isRecording && (
            <Animated.View style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.3],
                  outputRange: [0.6, 0],
                })
              },
            ]} />
          )}

          <Animated.View style={{ transform: [{ scale: recordBtnScale }] }}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isRecording ? (
                <Ionicons name="stop" size={40} color={colors.textOnPrimary} />
              ) : (
                <Ionicons name="mic" size={44} color={colors.textOnPrimary} />
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Recording info */}
          {isRecording ? (
            <View style={styles.recordingInfo}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording</Text>
              <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>

              {/* Waveform */}
              <View style={styles.waveform}>
                {[...Array(7)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: 12 + (i % 3) * 8,
                        transform: [{
                          scaleY: waveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1 + Math.random() * 0.5],
                          }),
                        }],
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.promptText}>
              {isLoading ? phrases[currentPhrase] : "Tap to start recording 🎤"}
            </Text>
          )}
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={colors.primary} />
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill]} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  celebrateContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: typography.fontSize['xl'],
    fontFamily: typography.fontFamily.headingBold,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },

  // Inputs
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.base,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.background,
    ...shadows.sm,
  },
  inputIcon: {
    marginLeft: spacing.base,
  },
  input: {
    flex: 1,
    padding: spacing.base,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.body,
    color: colors.textPrimary,
  },

  // Mood selector
  moodSection: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  moodScroll: {
    paddingRight: spacing.base,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.background,
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  moodLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.textSecondary,
  },
  moodLabelSelected: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyBold,
  },

  // Recording
  recordSection: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.error,
    top: spacing['2xl'] - 10,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  recordButtonActive: {
    backgroundColor: colors.error,
  },
  recordingInfo: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    marginBottom: spacing.sm,
  },
  recordingText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.error,
  },
  timerText: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    fontVariant: ['tabular-nums'],
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.base,
    height: 40,
  },
  waveBar: {
    width: 6,
    backgroundColor: colors.error,
    marginHorizontal: 3,
    borderRadius: 3,
  },
  promptText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.body,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    textAlign: 'center',
  },

  // Loading
  loadingSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: 4,
    marginTop: spacing.base,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '60%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});

export default RecordScreen;