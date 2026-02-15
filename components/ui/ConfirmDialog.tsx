import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, ZoomIn, FadeOut, ZoomOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';

export type ConfirmVariant = 'danger' | 'info' | 'success';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmVariant;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const { colors } = useTheme();

    if (!visible) return null;

    const getIcon = () => {
        switch (variant) {
            case 'danger': return 'alert-circle';
            case 'success': return 'checkmark-circle';
            default: return 'information-circle';
        }
    };

    const getColor = () => {
        switch (variant) {
            case 'danger': return Colors.danger;
            case 'success': return '#10B981';
            default: return Colors.primary;
        }
    };

    const primaryColor = getColor();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onCancel}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <BlurView intensity={Platform.OS === 'ios' ? 20 : 0} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

                <Animated.View
                    entering={ZoomIn.duration(200)}
                    exiting={ZoomOut.duration(150)}
                    style={[styles.dialog, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                    <View style={[styles.iconCircle, { backgroundColor: primaryColor + '20' }]}>
                        <Ionicons name={getIcon()} size={32} color={primaryColor} />
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

                    <View style={styles.footer}>
                        {cancelText ? (
                            <Pressable
                                onPress={onCancel}
                                style={({ pressed }) => [
                                    styles.button,
                                    styles.cancelButton,
                                    { opacity: pressed ? 0.7 : 1, backgroundColor: colors.background }
                                ]}
                            >
                                <Text style={[styles.buttonText, { color: colors.text }]}>{cancelText}</Text>
                            </Pressable>
                        ) : null}

                        <Pressable
                            onPress={onConfirm}
                            style={({ pressed }) => [
                                styles.button,
                                styles.confirmButton,
                                { opacity: pressed ? 0.8 : 1, backgroundColor: primaryColor }
                            ]}
                        >
                            <Text style={[styles.buttonText, { color: '#FFF', fontWeight: '600' }]}>{confirmText}</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    dialog: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 1,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        // Background set dynamically
    },
    confirmButton: {
        // Background set dynamically
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
    },
});
