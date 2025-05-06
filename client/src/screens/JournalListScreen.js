// client/src/screens/JournalListScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Platform,
    Alert,
} from 'react-native';
import * as api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const JournalListScreen = ({ navigation }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchEntries = useCallback(async () => {
        try {
          setError(null);
          if (!refreshing) setLoading(true);
          const data = await api.getJournalEntries();
          console.log("API Data:", data ? `Received ${data.length}` : "Received null");
          setEntries(Array.isArray(data) ? data : []);
        } catch (err) {
          setError('Failed to fetch journal entries. Please try again.');
          console.error("Fetch Error:", err);
          setEntries([]);
        } finally { setLoading(false); setRefreshing(false); }
      }, [refreshing]);

    useFocusEffect(useCallback(() => { fetchEntries(); }, [fetchEntries]));
    const onRefresh = useCallback(() => { setRefreshing(true); }, []);

    const handleDeleteEntry = async (entryId) => {
        if (!entryId || deletingId) return;

        setDeletingId(entryId);

        try {
            await api.deleteJournalEntry(entryId);
            console.log("Entry deleted via API:", entryId);
            setEntries(prevEntries => prevEntries.filter(entry => entry._id !== entryId));
        } catch (err) {
            console.error("Frontend Delete Error:", err);
            Alert.alert("Deletion Failed", err.message || "Could not delete the entry.");
        } finally {
            setDeletingId(null);
        }
    };

    const renderItem = ({ item }) => {
        let displayDate = 'Invalid Date';
        try {
            if (item.createdAt) {
                displayDate = format(new Date(item.createdAt), 'MMM d, yyyy');
            }
        } catch (e) { displayDate = 'Invalid Date'; }

        return (
            <View style={styles.card}>
                <TouchableOpacity 
                    style={styles.cardTouchable}
                    onPress={() => navigation.navigate('EntryDetail', { entry: item })}
                >
                    <View style={styles.cardContent}>
                        <Text style={styles.entryTitle}>{item.bookTitle || 'Untitled Entry'}</Text>
                        <Text style={styles.entryDate}>{displayDate}</Text>
                        <Text style={styles.entrySnippet} numberOfLines={2}>
                            {item.cinematicEntry || 'No content.'}
                        </Text>
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert(
                            "Confirm Deletion",
                            `Are you sure you want to delete the entry "${item.bookTitle || 'Untitled Entry'}"?`,
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: () => handleDeleteEntry(item._id) }
                            ],
                            { cancelable: true }
                        );
                    }}
                >
                    <Ionicons name="trash-outline" size={22} color="#9c6644" />
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && !refreshing && entries.length === 0) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#9c6644" />
                <Text style={styles.loadingText}>Loading your journal...</Text>
            </View>
        );
    }

    if (error && entries.length === 0) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchEntries}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {error && entries.length > 0 && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{error}</Text>
                </View>
            )}
            
            <FlatList
                data={entries}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContentContainer}
                ListEmptyComponent={
                    !loading && !error ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No journal entries yet. Tap the + button to create your first entry.</Text>
                        </View>
                    ) : null
                }
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        colors={['#9c6644']} 
                        tintColor={'#9c6644'}
                    />
                }
            />
            
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('Record')}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f4e3',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f4e3',
        padding: 20,
    },
    listContentContainer: {
        padding: 16,
        paddingBottom: 80, // Extra space for FAB
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
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
    cardTouchable: {
        flex: 1,
    },
    cardContent: {
        padding: 16,
    },
    entryTitle: {
        fontSize: 18,
        fontFamily: 'Lora-Bold',
        color: '#3a3a3a',
        marginBottom: 4,
    },
    entryDate: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#9c6644',
        marginBottom: 8,
    },
    entrySnippet: {
        fontSize: 15,
        fontFamily: 'Lora-Regular',
        color: '#555',
        lineHeight: 22,
    },
    deleteButton: {
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#9c6644',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    errorBanner: {
        backgroundColor: '#d32f2f',
        padding: 10,
        margin: 10,
        borderRadius: 5,
    },
    errorBannerText: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'Lato-Regular',
    },
    errorText: {
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Lato-Regular',
    },
    retryButton: {
        backgroundColor: '#9c6644',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
    },
    loadingText: {
        marginTop: 10,
        color: '#5D4037',
        fontFamily: 'Lato-Regular',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#5D4037',
        fontFamily: 'Lato-Regular',
        fontSize: 16,
        lineHeight: 24,
    },
});

export default JournalListScreen;