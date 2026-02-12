import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    Pressable,
    Platform,
    Keyboard,
    KeyboardEvent,
    Dimensions,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useBottomSheetDrag } from '@/lib/useBottomSheetDrag';
import Colors from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const KEYBOARD_SPACE_BUFFER = Platform.OS === 'ios' ? 20 : 0;

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    snapPoints?: string[]; // Reserved for future use
}

export function BottomSheet({
    visible,
    onClose,
    title,
    subtitle,
    children,
}: BottomSheetProps) {
    const { gesture, animatedStyle, reset } = useBottomSheetDrag(visible, onClose);
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', (event: KeyboardEvent) => {
            const keyboardHeight = event.endCoordinates.height;
            console.log('[BottomSheet] Keyboard shown, height:', keyboardHeight);
            console.log('[BottomSheet] Safe area bottom:', insets.bottom);
            setKeyboardHeight(keyboardHeight);
        });

        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            console.log('[BottomSheet] Keyboard hidden');
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [insets.bottom]);

    // Calculate proper bottom padding for keyboard + safe area
    const totalBottomPadding = Math.max(insets.bottom, keyboardHeight) + KEYBOARD_SPACE_BUFFER;
    console.log('[BottomSheet] Total bottom padding:', totalBottomPadding, 'keyboardHeight:', keyboardHeight);

    // If not visible, we can return null, but Modal handles visibility.
    // However, specifically for the drag reset, we rely on the hook's effect.

    return (
        <Modal
            visible={visible}
            animationType="none" // We handle animation with Reanimated
            transparent
            onRequestClose={onClose}
        // Removed statusBarTranslucent to fix keyboard alignment issues
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                        <Animated.View
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={styles.backdrop}
                        />
                    </Pressable>

                    {/* Direct keyboard handling without KeyboardAvoidingView wrapper */}
                    <Animated.View
                        entering={SlideInDown.springify().damping(16).mass(0.6).stiffness(150)}
                        exiting={SlideOutDown}
                        style={[
                            styles.sheet,
                            animatedStyle,
                            {
                                paddingBottom: totalBottomPadding,
                                maxHeight: SCREEN_HEIGHT * 0.85,
                                backgroundColor: colors.backgroundSecondary,
                            }
                        ]}
                    >
                        <GestureDetector gesture={gesture}>
                            <View style={styles.handleHitArea}>
                                <View style={[styles.handle, { backgroundColor: colors.cardBorder }]} />
                            </View>
                        </GestureDetector>

                        {(title || subtitle) && (
                            <View style={styles.header}>
                                {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
                                {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
                            </View>
                        )}

                        <View style={styles.content}>{children}</View>
                    </Animated.View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        backgroundColor: Colors.backgroundSecondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        // maxHeight is now set dynamically with keyboard consideration
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    handleHitArea: {
        width: '100%',
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        // We want this area to be touchable for the drag
        backgroundColor: 'transparent',
    },
    handle: {
        width: 48,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: Colors.cardBorder,
    },
    header: {
        paddingTop: 8,
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        fontFamily: 'Inter_700Bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontFamily: 'Inter_400Regular',
        marginBottom: 12,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 0,
    },
});
