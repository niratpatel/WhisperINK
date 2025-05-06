// client/src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import JournalListScreen from '../screens/JournalListScreen';
import RecordScreen from '../screens/RecordScreen';
import EntryDetailScreen from '../screens/EntryDetailScreen';
import InsightsScreen from '../screens/InsightsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
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
      <Stack.Screen name="JournalList" component={JournalListScreen} options={{ title: 'WhisperInk' }} />
      <Stack.Screen name="Record" component={RecordScreen} options={{ title: 'Record Thoughts' }}/>
      <Stack.Screen name="EntryDetail" component={EntryDetailScreen} options={({ route }) => ({ title: route.params?.entry?.bookTitle || 'Journal Entry', })} />
      <Stack.Screen name="Insights" component={InsightsScreen} options={{ title: 'Your Insights' }} />
    </Stack.Navigator>
  );
};
export default AppNavigator;