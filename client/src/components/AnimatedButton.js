// client/src/components/AnimatedButton.js
// Bouncy, Duolingo-style button with press animation

import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../theme';

const AnimatedButton = ({
    onPress,
    title,
    variant = 'primary', // primary, secondary, outline
    size = 'medium', // small, medium, large
    loading = false,
    disabled = false,
    icon = null,
    style = {},
    textStyle = {},
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            friction: 5,
            tension: 300,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 200,
            useNativeDriver: true,
        }).start();
    };

    const getButtonStyle = () => {
        const base = [styles.button, styles[`button_${size}`]];

        switch (variant) {
            case 'secondary':
                base.push(styles.buttonSecondary);
                break;
            case 'outline':
                base.push(styles.buttonOutline);
                break;
            default:
                base.push(styles.buttonPrimary);
        }

        if (disabled) base.push(styles.buttonDisabled);

        return base;
    };

    const getTextStyle = () => {
        const base = [styles.text, styles[`text_${size}`]];

        if (variant === 'outline') {
            base.push(styles.textOutline);
        } else {
            base.push(styles.textLight);
        }

        if (disabled) base.push(styles.textDisabled);

        return base;
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={[...getButtonStyle(), style]}
                activeOpacity={0.9}
            >
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'outline' ? colors.primary : colors.textOnPrimary}
                        size="small"
                    />
                ) : (
                    <>
                        {icon}
                        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.lg,
        ...shadows.md,
    },

    // Sizes
    button_small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
    },
    button_medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    button_large: {
        paddingVertical: spacing.base,
        paddingHorizontal: spacing['2xl'],
    },

    // Variants
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
        ...shadows.sm,
    },
    buttonDisabled: {
        backgroundColor: colors.textLight,
        opacity: 0.6,
    },

    // Text
    text: {
        fontFamily: typography.fontFamily.bodyBold,
    },
    text_small: {
        fontSize: typography.fontSize.sm,
    },
    text_medium: {
        fontSize: typography.fontSize.base,
    },
    text_large: {
        fontSize: typography.fontSize.lg,
    },
    textLight: {
        color: colors.textOnPrimary,
    },
    textOutline: {
        color: colors.primary,
    },
    textDisabled: {
        color: colors.textLight,
    },
});

export default AnimatedButton;
