// client/src/components/Mascot.js
// Friendly ink drop mascot character with different states

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing } from '../theme';

const Mascot = ({
    mood = 'happy', // happy, thinking, excited, sleeping, waving
    size = 'medium', // small, medium, large
    message = null,
    showMessage = true,
}) => {
    const getSizeStyle = () => {
        switch (size) {
            case 'small': return { width: 60, height: 60 };
            case 'large': return { width: 120, height: 120 };
            default: return { width: 80, height: 80 };
        }
    };

    const getMascotEmoji = () => {
        switch (mood) {
            case 'thinking': return '🤔';
            case 'excited': return '🎉';
            case 'sleeping': return '😴';
            case 'waving': return '👋';
            case 'writing': return '✍️';
            case 'celebrating': return '🥳';
            case 'encouraging': return '💪';
            default: return '😊';
        }
    };

    const getMascotMessage = () => {
        if (message) return message;
        switch (mood) {
            case 'thinking': return "What's on your mind today?";
            case 'excited': return "You're on fire! Keep it up!";
            case 'sleeping': return "Time for some journaling?";
            case 'waving': return "Hey there! Ready to write?";
            case 'writing': return "Let your thoughts flow...";
            case 'celebrating': return "Woohoo! Great job!";
            case 'encouraging': return "You've got this!";
            default: return "Let's capture your thoughts!";
        }
    };

    const sizeStyle = getSizeStyle();
    const emojiSize = size === 'small' ? 30 : size === 'large' ? 60 : 40;

    return (
        <View style={styles.container}>
            {/* Mascot body - ink drop shape */}
            <View style={[styles.mascotBody, sizeStyle]}>
                <View style={[styles.inkDrop, sizeStyle]}>
                    <Text style={[styles.emoji, { fontSize: emojiSize }]}>
                        {getMascotEmoji()}
                    </Text>
                </View>
                {/* Bouncy shadow */}
                <View style={[styles.shadow, { width: sizeStyle.width * 0.6 }]} />
            </View>

            {/* Message bubble */}
            {showMessage && (
                <View style={styles.messageBubble}>
                    <Text style={styles.messageText}>{getMascotMessage()}</Text>
                    <View style={styles.bubbleTail} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: spacing.base,
    },
    mascotBody: {
        alignItems: 'center',
    },
    inkDrop: {
        backgroundColor: colors.primarySoft,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.primary,
    },
    emoji: {
        marginTop: -2,
    },
    shadow: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 50,
        marginTop: 8,
    },
    messageBubble: {
        backgroundColor: colors.cardBackground,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        borderRadius: 16,
        marginTop: spacing.base,
        maxWidth: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    messageText: {
        fontFamily: typography.fontFamily.body,
        fontSize: typography.fontSize.base,
        color: colors.textPrimary,
        textAlign: 'center',
        lineHeight: 22,
    },
    bubbleTail: {
        position: 'absolute',
        top: -8,
        left: '50%',
        marginLeft: -8,
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: colors.cardBackground,
    },
});

export default Mascot;
