// client/src/screens/JournalListScreen.js
// Redesigned with Duolingo-inspired UI

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    Animated,
    StatusBar,
} from 'react-native';
import * as api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Mascot } from '../components';
import {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    moodConfig,
    getGreeting,
    getRandomEncouragement,
} from '../theme';

const JournalListScreen = ({ navigation }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isDialOpen, setIsDialOpen] = useState(false);

    // Animations
    const fabScale = useRef(new Animated.Value(1)).current;
    const fabRotate = useRef(new Animated.Value(0)).current;
    const dialOpacity = useRef(new Animated.Value(0)).current;
    const headerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate header on mount
        Animated.spring(headerAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, []);

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
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    useFocusEffect(useCallback(() => { fetchEntries(); }, [fetchEntries]));
    const onRefresh = useCallback(() => { setRefreshing(true); }, []);

    const handleDeleteEntry = async (entryId) => {
        if (!entryId || deletingId) return;
        setDeletingId(entryId);
        try {
            await api.deleteJournalEntry(entryId);
            setEntries(prevEntries => prevEntries.filter(entry => entry._id !== entryId));
        } catch (err) {
            Alert.alert("Deletion Failed", err.message || "Could not delete the entry.");
        } finally {
            setDeletingId(null);
        }
    };

    const toggleDial = () => {
        const toValue = isDialOpen ? 0 : 1;

        Animated.parallel([
            Animated.spring(fabRotate, {
                toValue,
                friction: 5,
                tension: 200,
                useNativeDriver: true,
            }),
            Animated.spring(dialOpacity, {
                toValue,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setIsDialOpen(!isDialOpen);
    };

    const handleFabPressIn = () => {
        Animated.spring(fabScale, {
            toValue: 0.9,
            friction: 5,
            tension: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleFabPressOut = () => {
        Animated.spring(fabScale, {
            toValue: 1,
            friction: 3,
            tension: 200,
            useNativeDriver: true,
        }).start();
    };

    const getMoodStyle = (mood) => {
        const config = moodConfig[mood?.toLowerCase()];
        return config ? { backgroundColor: config.color + '20', borderColor: config.color } : {};
    };

    const getMoodEmoji = (mood) => {
        const config = moodConfig[mood?.toLowerCase()];
        return config ? config.emoji : '📝';
    };

    const greeting = getGreeting();

    const renderHeader = () => (
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
            <View style={styles.greetingContainer}>
                <Text style={styles.greetingEmoji}>{greeting.emoji}</Text>
                <View>
                    <Text style={styles.greetingText}>{greeting.text}!</Text>
                    <Text style={styles.subGreeting}>
                        {entries.length > 0
                            ? `You have ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
                            : 'Ready to start journaling?'
                        }
                    </Text>
                </View>
            </View>

            {entries.length > 0 && (
                <View style={styles.streakBadge}>
                    <Text style={styles.streakEmoji}>🔥</Text>
                    <Text style={styles.streakText}>{entries.length}</Text>
                </View>
            )}
        </Animated.View>
    );

    const renderItem = ({ item, index }) => {
        let displayDate = 'Invalid Date';
        try {
            if (item.createdAt) {
                displayDate = format(new Date(item.createdAt), 'MMM d, yyyy');
            }
        } catch (e) { displayDate = 'Invalid Date'; }

        const moodStyle = getMoodStyle(item.mood);
        const moodEmoji = getMoodEmoji(item.mood);

        return (
            <Animated.View
                style={[
                    styles.card,
                    moodStyle,
                    {
                        opacity: headerAnim,
                        transform: [{
                            translateY: headerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                            }),
                        }],
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.cardTouchable}
                    onPress={() => navigation.navigate('EntryDetail', { entry: item })}
                    activeOpacity={0.8}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.moodBadge}>
                            <Text style={styles.moodEmoji}>{moodEmoji}</Text>
                        </View>
                        <View style={styles.cardMeta}>
                            <Text style={styles.entryTitle}>{item.bookTitle || 'Untitled Entry'}</Text>
                            <Text style={styles.entryDate}>{displayDate}</Text>
                        </View>
                    </View>
                    <Text style={styles.entrySnippet} numberOfLines={2}>
                        {item.cinematicEntry || 'No content.'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert(
                            "Delete Entry?",
                            `Are you sure you want to delete "${item.bookTitle || 'Untitled Entry'}"?`,
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: () => handleDeleteEntry(item._id) }
                            ],
                        );
                    }}
                >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Mascot mood="waving" size="large" message={getRandomEncouragement()} />
            <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Record')}
            >
                <Ionicons name="mic" size={24} color={colors.textOnPrimary} />
                <Text style={styles.emptyButtonText}>Create First Entry</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing && entries.length === 0) {
        return (
            <View style={styles.centeredContainer}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading your journal...</Text>
            </View>
        );
    }

    const fabRotation = fabRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {renderHeader()}

            {error && entries.length > 0 && (
                <View style={styles.errorBanner}>
                    <Ionicons name="warning" size={18} color={colors.textOnPrimary} />
                    <Text style={styles.errorBannerText}>{error}</Text>
                </View>
            )}

            {error && entries.length === 0 ? (
                <View style={styles.centeredContainer}>
                    <Mascot mood="thinking" message="Something went wrong. Let's try again!" />
                    <TouchableOpacity style={styles.retryButton} onPress={fetchEntries}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={entries}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContentContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={!loading && !error ? renderEmptyState : null}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                            progressBackgroundColor={colors.cardBackground}
                        />
                    }
                />
            )}

            {/* Speed Dial FAB */}
            <View style={styles.fabContainer}>
                {/* Dial Options */}
                <Animated.View style={[
                    styles.dialOptions,
                    {
                        opacity: dialOpacity,
                        transform: [{
                            translateY: dialOpacity.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                            }),
                        }],
                    },
                ]}>
                    {isDialOpen && (
                        <>
                            <TouchableOpacity
                                style={styles.dialOption}
                                onPress={() => {
                                    toggleDial();
                                    navigation.navigate('Record');
                                }}
                            >
                                <View style={[styles.optionButton, { backgroundColor: colors.primary }]}>
                                    <Ionicons name="mic" size={24} color={colors.textOnPrimary} />
                                </View>
                                <Text style={styles.optionLabel}>Record</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dialOption}
                                onPress={() => {
                                    toggleDial();
                                    navigation.navigate('Insights');
                                }}
                            >
                                <View style={[styles.optionButton, { backgroundColor: colors.secondary }]}>
                                    <Ionicons name="analytics" size={24} color={colors.textOnPrimary} />
                                </View>
                                <Text style={styles.optionLabel}>Insights</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </Animated.View>

                {/* Main FAB */}
                <Animated.View style={{ transform: [{ scale: fabScale }] }}>
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={toggleDial}
                        onPressIn={handleFabPressIn}
                        onPressOut={handleFabPressOut}
                        activeOpacity={0.9}
                    >
                        <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
                            <Ionicons
                                name={isDialOpen ? "close" : "add"}
                                size={32}
                                color={colors.textOnPrimary}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 60 : spacing['2xl'],
        paddingBottom: spacing.base,
        backgroundColor: colors.background,
    },
    greetingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greetingEmoji: {
        fontSize: 40,
        marginRight: spacing.md,
    },
    greetingText: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.headingBold,
        color: colors.textPrimary,
    },
    subGreeting: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.body,
        color: colors.textSecondary,
        marginTop: 2,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primarySoft,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    streakEmoji: {
        fontSize: 18,
    },
    streakText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bodyBold,
        color: colors.primary,
        marginLeft: 4,
    },

    // List
    listContentContainer: {
        padding: spacing.base,
        paddingBottom: 100,
    },

    // Card
    card: {
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: colors.background,
        ...shadows.md,
    },
    cardTouchable: {
        flex: 1,
        padding: spacing.base,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    moodBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    moodEmoji: {
        fontSize: 22,
    },
    cardMeta: {
        flex: 1,
    },
    entryTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.headingBold,
        color: colors.textPrimary,
    },
    entryDate: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.body,
        color: colors.textSecondary,
        marginTop: 2,
    },
    entrySnippet: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.body,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    deleteButton: {
        padding: spacing.base,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing['2xl'],
        paddingTop: spacing['4xl'],
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        marginTop: spacing.xl,
        ...shadows.md,
    },
    emptyButtonText: {
        color: colors.textOnPrimary,
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bodyBold,
        marginLeft: spacing.sm,
    },

    // Error
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.error,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        marginHorizontal: spacing.base,
        borderRadius: borderRadius.md,
    },
    errorBannerText: {
        color: colors.textOnPrimary,
        fontFamily: typography.fontFamily.body,
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
        fontFamily: typography.fontFamily.bodyBold,
        fontSize: typography.fontSize.base,
    },
    loadingText: {
        marginTop: spacing.base,
        color: colors.textSecondary,
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.base,
    },

    // FAB
    fabContainer: {
        position: 'absolute',
        right: spacing.xl,
        bottom: spacing['2xl'],
        alignItems: 'center',
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.lg,
    },
    dialOptions: {
        marginBottom: spacing.md,
        alignItems: 'center',
    },
    dialOption: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    optionButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    optionLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.bodyBold,
        color: colors.textPrimary,
        marginTop: spacing.xs,
    },
});

export default JournalListScreen;