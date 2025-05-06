// client/src/screens/EntryDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons'; // Add this import

const EntryDetailScreen = ({ route }) => {
  const { entry } = route.params;

  if (!entry) { return ( <View style={styles.container}><Text>Entry not found.</Text></View> ); }

  let displayDate = 'Date not available';
  try {
    if (entry.createdAt) { displayDate = format(new Date(entry.createdAt), "MMMM d, yyyy 'at' h:mm a"); }
  } catch (e) { displayDate = 'Invalid Date'; }
  
  // Map mood to icon and label
  const getMoodInfo = (mood) => {
    const moodMap = {
      contemplative: { icon: 'leaf-outline', label: 'Contemplative' },
      inspired: { icon: 'bulb-outline', label: 'Inspired' },
      confused: { icon: 'help-circle-outline', label: 'Confused' },
      seeking: { icon: 'search-outline', label: 'Seeking' },
    };
    
    return mood && moodMap[mood] ? moodMap[mood] : null;
  };
  
  const moodInfo = getMoodInfo(entry.mood);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{entry.bookTitle || 'Untitled Entry'}</Text>
      {entry.bookAuthor && entry.bookAuthor !== 'Unknown Author' && <Text style={styles.author}>by {entry.bookAuthor}</Text>}
      <Text style={styles.date}>Recorded on: {displayDate}</Text>
      
      {/* Display mood if available */}
      {moodInfo && (
        <View style={styles.moodContainer}>
          <Ionicons name={moodInfo.icon} size={16} color="#967259" />
          <Text style={styles.moodText}>{moodInfo.label}</Text>
        </View>
      )}
      
      <View style={styles.separator} />
      <Text style={styles.cinematicText}>{entry.cinematicEntry || 'No content recorded.'}</Text>
    </ScrollView>
  );
};

// Original Styles (or close to it) with added mood styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4e3', },
  contentContainer: { padding: 20, paddingBottom: 40, },
  title: { fontFamily: 'Lato-Bold', fontSize: 24, color: '#3a3a3a', marginBottom: 4, },
  author: { fontFamily: 'Lato-Regular', fontSize: 16, fontStyle: 'italic', color: '#555', marginBottom: 12, },
  date: { fontFamily: 'Lato-Regular', fontSize: 13, color: '#777', marginBottom: 15, },
  moodContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(155, 114, 89, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  moodText: { 
    fontFamily: 'Lato-Regular', 
    fontSize: 13, 
    color: '#967259',
    marginLeft: 6,
  },
  separator: { height: 1, backgroundColor: '#A1887F60', marginVertical: 20, },
  cinematicText: { fontFamily: 'Lora-Regular', fontSize: 17, lineHeight: 28, color: '#333', },
});
export default EntryDetailScreen;