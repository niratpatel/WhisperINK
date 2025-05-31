// client/src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import JournalListScreen from '../screens/JournalListScreen';
import RecordScreen from '../screens/RecordScreen';
import EntryDetailScreen from '../screens/EntryDetailScreen';
import InsightsScreen from '../screens/InsightsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useUser } from '../context/UserContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useUser();
  if (loading) return null;
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#5D4037', // Original Darker Brown
        },
        headerTintColor: '#FFFFFF', // White text
        headerTitleStyle: {
          fontFamily: 'Lato-Bold', // Original font choice
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="JournalList" component={JournalListScreen} options={{ title: 'WhisperInk' }} />
          <Stack.Screen name="Record" component={RecordScreen} options={{ title: 'Record Thoughts' }}/>
          <Stack.Screen name="EntryDetail" component={EntryDetailScreen} options={({ route }) => ({ title: route.params?.entry?.bookTitle || 'Journal Entry', })} />
          <Stack.Screen name="Insights" component={InsightsScreen} options={{ title: 'Your Insights' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </>
      )}
    </Stack.Navigator>
  );
};
export default AppNavigator;