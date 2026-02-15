import React from 'react';
import { View, Text, StyleSheet, Linking, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme-context';

export function AppFooter() {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { borderTopColor: colors.cardBorder }]}>
            {/* Decorative divider with icon */}
            <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
                <Ionicons name="code-slash-outline" size={14} color={colors.textMuted} />
                <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            </View>

            {/* Developer Credits */}
            <Text style={[styles.credit, { color: colors.textSecondary }]}>
                Designed & Developed by
            </Text>
            <Text style={[styles.name, { color: colors.text }]}>
                Ali Sallam Ghandour
            </Text>

            {/* Contact Link */}
            <Pressable
                onPress={() => Linking.openURL('tel:+96179307904')}
                style={({ pressed }) => [styles.phoneRow, pressed && { opacity: 0.6 }]}
            >
                <Ionicons name="call-outline" size={12} color={colors.primary} />
                <Text style={[styles.phone, { color: colors.primary }]}>+961 79 307 904</Text>
            </Pressable>

            <Text style={[styles.copyright, { color: colors.textMuted }]}>
                © {new Date().getFullYear()} Student-OS. All rights reserved.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        width: '60%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    credit: {
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        marginBottom: 8,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 10,
    },
    phone: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    copyright: {
        fontSize: 10,
        fontFamily: 'Inter_400Regular',
    },
});
