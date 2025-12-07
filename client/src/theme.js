// client/src/theme.js
// WhisperINK Design System - Duolingo Inspired

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color Palette
export const colors = {
    // Primary - Warm Orange (main brand color)
    primary: '#FF9500',
    primaryLight: '#FFB84D',
    primaryDark: '#E68600',
    primarySoft: '#FFF4E6',

    // Secondary - Friendly Teal
    secondary: '#00CED1',
    secondaryLight: '#48D1CC',
    secondaryDark: '#20B2AA',

    // Background
    background: '#FFF9F0',
    cardBackground: '#FFFFFF',
    surfaceLight: '#FFFBF5',

    // Moods - Vibrant and playful
    moods: {
        happy: '#FFD93D',
        calm: '#6BCB77',
        reflective: '#4D96FF',
        energetic: '#FF6B6B',
        grateful: '#C9B1FF',
        anxious: '#FFB347',
        sad: '#87CEEB',
        excited: '#FF69B4',
    },

    // Text
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    textOnPrimary: '#FFFFFF',

    // Accent & States
    accent: '#FF6B9D',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    streak: '#FF9500',

    // Shadows
    shadowLight: 'rgba(0, 0, 0, 0.08)',
    shadowMedium: 'rgba(0, 0, 0, 0.12)',
};

// Typography
export const typography = {
    // Font families
    fontFamily: {
        heading: 'Lora-Regular',
        headingBold: 'Lora-Bold',
        body: 'Lato-Regular',
        bodyBold: 'Lato-Bold',
    },

    // Font sizes
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },

    // Line heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

// Spacing system (based on 4px grid)
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
};

// Border radius
export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
};

// Shadow presets
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    glow: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
};

// Animation presets (for react-native-reanimated)
export const animations = {
    // Spring configurations
    spring: {
        gentle: { damping: 15, stiffness: 150 },
        bouncy: { damping: 10, stiffness: 180 },
        snappy: { damping: 20, stiffness: 300 },
        slow: { damping: 20, stiffness: 100 },
    },

    // Timing configurations
    timing: {
        fast: 150,
        normal: 250,
        slow: 400,
    },
};

// Screen dimensions
export const screen = {
    width,
    height,
    isSmall: width < 375,
};

// Mood configuration with colors and emojis
export const moodConfig = {
    happy: { emoji: '😊', color: colors.moods.happy, label: 'Happy' },
    calm: { emoji: '😌', color: colors.moods.calm, label: 'Calm' },
    reflective: { emoji: '🤔', color: colors.moods.reflective, label: 'Reflective' },
    energetic: { emoji: '⚡', color: colors.moods.energetic, label: 'Energetic' },
    grateful: { emoji: '🙏', color: colors.moods.grateful, label: 'Grateful' },
    anxious: { emoji: '😰', color: colors.moods.anxious, label: 'Anxious' },
    sad: { emoji: '😢', color: colors.moods.sad, label: 'Sad' },
    excited: { emoji: '🎉', color: colors.moods.excited, label: 'Excited' },
};

// Greeting messages based on time of day
export const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '🌅' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '☀️' };
    if (hour < 21) return { text: 'Good evening', emoji: '🌆' };
    return { text: 'Good night', emoji: '🌙' };
};

// Encouraging messages for empty states
export const encouragements = [
    "Ready to capture today's thoughts? 📝",
    "Your story matters. Start writing! ✨",
    "What's on your mind today? 💭",
    "Let's journal together! 🎯",
    "Every entry is a step forward! 🚀",
];

export const getRandomEncouragement = () => {
    return encouragements[Math.floor(Math.random() * encouragements.length)];
};

// Export everything as default theme object too
export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animations,
    screen,
    moodConfig,
    getGreeting,
    getRandomEncouragement,
};
