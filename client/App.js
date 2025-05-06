// client/App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator'; // Ensure this path is correct
import { StatusBar } from 'expo-status-bar';
import { useFonts, Lora_400Regular, Lora_400Regular_Italic } from '@expo-google-fonts/lora';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';


export default function App() {
  let [fontsLoaded] = useFonts({
    'Lora-Regular': Lora_400Regular,
    'Lora-Italic': Lora_400Regular_Italic,
    'Lato-Regular': Lato_400Regular,
    'Lato-Bold': Lato_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
      {/* Replace LottieView with ActivityIndicator */}
      <ActivityIndicator size="large" color="#5D4037" />
      <Text style={styles.loadingText}>Loading...</Text>
   </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f4e3',
  },
  loadingText: { marginTop: 10, color: '#5D4037' }
});