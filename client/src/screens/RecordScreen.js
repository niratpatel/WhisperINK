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
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as api from '../services/api'; // Your API service
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const RecordScreen = ({ navigation }) => {
  const recordingRef = useRef(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [response, setResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  // Add mood state
  const [selectedMood, setSelectedMood] = useState(''); // Default empty

  // Define available moods
  const moods = [
    { id: 'contemplative', label: 'Contemplative', icon: 'leaf-outline' },
    { id: 'inspired', label: 'Inspired', icon: 'bulb-outline' },
    { id: 'confused', label: 'Confused', icon: 'help-circle-outline' },
    { id: 'seeking', label: 'Seeking', icon: 'search-outline' },
  ];
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Poetic phrases about thought transformation
  const poeticPhrases = [
    "Whispers becoming wisdom",
    "Thoughts taking flight",
    "Voice into vision",
    "Spoken to sacred",
    "Echoes into essence",
    "Musings to meaning",
    "Words weaving worlds",
    "Sounds shaping stories",
    "Voice becoming verse",
    "Thoughts transforming",
    "Ideas illuminated",
    "Spoken dreams settling",
    "Whispers crystalizing",
  ];
  
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    if (permissionResponse?.status !== 'granted') requestPermission();
  }, [permissionResponse]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
      
      // Pulse animation for recording button
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      waveAnim.setValue(0);
    }
  }, [isRecording]);
  
  // Phrase cycling animation
  useEffect(() => {
    if (isLoading) {
      // Start with phrase animation
      animateNextPhrase();
    } else {
      // Reset animation
      setCurrentPhraseIndex(0);
      fadeAnim.setValue(0);
    }
  }, [isLoading]);
  
  // Function to animate through phrases
  const animateNextPhrase = () => {
    if (!isLoading) return;
    
    // Reset opacity to 0
    fadeAnim.setValue(0);
    
    // Sequence: fade in -> wait -> fade out -> next phrase -> repeat
    Animated.sequence([
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Hold visible
      Animated.delay(1500),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Move to next phrase and repeat animation
      if (isLoading) {
        setCurrentPhraseIndex((prevIndex) => 
          (prevIndex + 1) % poeticPhrases.length
        );
        // Small delay before starting next phrase
        setTimeout(animateNextPhrase, 200);
      }
    });
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        Alert.alert('Permission required', 'Microphone access is needed.');
        await requestPermission();
        const updated = await Audio.getPermissionsAsync();
        if (updated.status !== 'granted') return;
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
          maxFileSize: 120 * 1024 * 1024, // 120MB max file size
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MEDIUM,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
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
      const fileType = 'audio/m4a';

      const formData = new FormData();
      formData.append('audio', { uri, name: filename || `recording.m4a`, type: fileType });
      formData.append('bookTitle', bookTitle);
      formData.append('bookAuthor', bookAuthor);
      // Add mood to form data
      formData.append('mood', selectedMood);

      const result = await api.createJournalEntry(formData);
      Alert.alert('Success', 'Your thoughts have been transformed!');
      setBookTitle('');
      setBookAuthor('');
      setAudioUri(null);
      setSelectedMood(''); // Reset mood
      navigation.goBack();
    } catch (error) {
      console.error('Upload failed:', error?.response?.data || error.message);
      Alert.alert('Upload Failed', error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Function to render the current phrase with animation
  const renderAnimatedPhrase = () => {
    return (
      <Animated.View
        style={[
          styles.phraseContainer,
          {
            opacity: fadeAnim,
            transform: [
              { 
                scale: fadeAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 1.05, 1]
                })
              }
            ]
          }
        ]}
      >
        <Text style={styles.poeticText}>{poeticPhrases[currentPhraseIndex]}</Text>
      </Animated.View>
    );
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Render mood selection component
  const renderMoodSelector = () => {
    return (
      <View style={styles.moodSelectorContainer}>
        <Text style={styles.inputLabel}>Current Mood (Optional)</Text>
        <View style={styles.moodOptionsContainer}>
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodOption,
                selectedMood === mood.id && styles.selectedMoodOption
              ]}
              onPress={() => setSelectedMood(mood.id === selectedMood ? '' : mood.id)}
            >
              <Ionicons 
                name={mood.icon} 
                size={24} 
                color={selectedMood === mood.id ? '#fff' : '#967259'} 
              />
              <Text 
                style={[
                  styles.moodLabel,
                  selectedMood === mood.id && styles.selectedMoodLabel
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient 
      colors={['#f9f6f0', '#f0e9df']} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#6b5b45" />
        </TouchableOpacity>
        <Text style={styles.title}>WhisperInk</Text>
        <View style={styles.emptySpace} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Book Title</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="book-outline" size={20} color="#a18162" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter book title"
              placeholderTextColor="#bbb"
              value={bookTitle}
              onChangeText={setBookTitle}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Author</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#a18162" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter author name"
              placeholderTextColor="#bbb"
              value={bookAuthor}
              onChangeText={setBookAuthor}
            />
          </View>
        </View>
        
        {/* Add mood selector */}
        {renderMoodSelector()}

        <View style={styles.recordingContainer}>
          {isRecording && (
            <Animated.View 
              style={[
                styles.recordingIndicator,
                { opacity: pulseAnim, transform: [{ scale: pulseAnim }] }
              ]}
            />
          )}
          
          <Animated.View 
            style={[ 
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <TouchableOpacity
              style={[styles.micButtonContainer]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isRecording ? ['#d9534f', '#c9302c'] : ['#967259', '#7d5b41']}
                style={styles.micButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isRecording ? (
                  <Ionicons name="square" size={28} color="#fff" />
                ) : (
                  <Ionicons name="mic" size={32} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {isRecording ? (
            <View style={styles.recordingInfoContainer}>
              <Text style={styles.recordingText}>Recording</Text>
              <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>

              <View style={styles.waveformContainer}>
                {[...Array(8)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: 20 + (i % 3) * 10,
                        transform: [
                          {
                            scaleY: waveAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.6, 1 + Math.random() * 0.5],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.recordingPrompt}>
              {isLoading ? "Processing..." : "Tap to record your thoughts"}
            </Text>
          )}
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#967259" style={{ marginBottom: 10 }} />
            {/* Removed the "Transforming your thoughts..." text */}
            <View style={styles.animationContainer}>
              {renderAnimatedPhrase()}
            </View>
          </View>
        )}

        {response && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fdfbf5',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#6b5b45',
    letterSpacing: 0.5,
  },
  
  emptySpace: {
    width: 44, // Balance the header
  },
  
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  inputGroup: { 
    width: '100%', 
    marginBottom: 20 
  },
  
  inputLabel: { 
    marginBottom: 8, 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#6b5b45',
    marginLeft: 4, 
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  
  inputIcon: {
    padding: 14,
  },
  
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 18,
    fontSize: 16,
    color: '#333',
  },

  recordingContainer: {
    alignItems: 'center',
    marginTop: 30,
    position: 'relative',
  },
  
  recordingIndicator: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: 'rgba(217, 83, 79, 0.2)',
    zIndex: -1,
  },
  
  micButtonContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  
  micButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  recordingInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d9534f',
    marginBottom: 6,
  },
  
  recordingPrompt: {
    marginTop: 20,
    fontSize: 16,
    color: '#7d5b41',
    fontWeight: '500',
  },
  
  timerText: { 
    fontSize: 20, 
    fontWeight: '600',
    color: '#6b5b45', 
    marginBottom: 16,
    fontVariant: ['tabular-nums'],
  },
  
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginTop: 10,
  },
  
  waveBar: {
    width: 4,
    backgroundColor: '#d9534f',
    marginHorizontal: 3,
    borderRadius: 4,
  },
  
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // Reduced from 30 to save space
    minHeight: 120, // Reduced from 200 to save space
  },
  
  // Removed transformingText style since we're not using it anymore
  
  animationContainer: {
    width: 280,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0, // Reduced from 10 to save space
  },
  
  phraseContainer: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(155, 114, 89, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(155, 114, 89, 0.15)',
  },
  
  poeticText: {
    fontSize: 18,
    color: '#7d5b41',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  responseContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  
  responseText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  
  // Mood selector styles
  moodSelectorContainer: {
    width: '100%',
    marginBottom: 20,
  },
  moodOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(155, 114, 89, 0.2)',
  },
  selectedMoodOption: {
    backgroundColor: '#967259',
    borderColor: '#967259',
  },
  moodLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b5b45',
    fontWeight: '500',
  },
  selectedMoodLabel: {
    color: '#fff',
  },
});

export default RecordScreen;