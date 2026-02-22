/**
 * Forgot Password Screen — Firebase password reset via email.
 */
import React, { useState } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
    Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';

export default function ForgotPasswordScreen() {
    const { resetPassword } = useAuth();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async () => {
        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await resetPassword(email);
            setSent(true);
        } catch (err: any) {
            const code = err?.code || '';
            if (code === 'auth/user-not-found') {
                setError('No account found with this email.');
            } else if (code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError('Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back Button */}
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </Pressable>

                    {sent ? (
                        /* Success State */
                        <View style={styles.successContainer}>
                            <View style={styles.successIconWrap}>
                                <Ionicons name="mail-open-outline" size={48} color={Colors.accent} />
                            </View>
                            <Text style={styles.title}>Check Your Email</Text>
                            <Text style={styles.successMessage}>
                                We've sent a password reset link to{'\n'}
                                <Text style={{ color: Colors.primary, fontFamily: 'Inter_600SemiBold' }}>{email}</Text>
                            </Text>
                            <Text style={styles.successHint}>
                                Didn't receive the email? Check your spam folder or try again.
                            </Text>

                            <Pressable
                                onPress={() => { setSent(false); setEmail(''); }}
                                style={({ pressed }) => [styles.tryAgainBtn, { opacity: pressed ? 0.7 : 1 }]}
                            >
                                <Text style={styles.tryAgainText}>Try a Different Email</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => router.back()}
                                style={({ pressed }) => [styles.backToLoginBtn, { opacity: pressed ? 0.7 : 1 }]}
                            >
                                <LinearGradient
                                    colors={[Colors.primary, Colors.primaryDark]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.backToLoginGradient}
                                >
                                    <Text style={styles.backToLoginText}>Back to Login</Text>
                                </LinearGradient>
                            </Pressable>
                        </View>
                    ) : (
                        /* Form State */
                        <>
                            <Text style={styles.title}>Reset Password</Text>
                            <Text style={styles.subtitle}>
                                Enter the email address associated with your account and we'll send you a reset link.
                            </Text>

                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="student@university.edu"
                                        placeholderTextColor={Colors.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        returnKeyType="done"
                                        onSubmitEditing={handleReset}
                                    />
                                </View>
                            </View>

                            <Pressable
                                onPress={handleReset}
                                disabled={loading}
                                style={({ pressed }) => [styles.resetBtn, { opacity: pressed || loading ? 0.7 : 1 }]}
                            >
                                <LinearGradient
                                    colors={[Colors.primary, Colors.primaryDark]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.resetBtnGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.resetBtnText}>Send Reset Link</Text>
                                    )}
                                </LinearGradient>
                            </Pressable>

                            <Pressable onPress={() => router.back()} style={styles.backLink}>
                                <Ionicons name="arrow-back" size={16} color={Colors.primary} />
                                <Text style={styles.backLinkText}>Back to Login</Text>
                            </Pressable>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
        fontFamily: 'Inter_700Bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontFamily: 'Inter_400Regular',
        marginBottom: 28,
        lineHeight: 22,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.danger + '15',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.danger + '30',
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: Colors.danger,
        fontFamily: 'Inter_500Medium',
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 6,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        paddingHorizontal: 14,
        height: 52,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: Colors.text,
        fontFamily: 'Inter_400Regular',
        height: '100%',
    },
    resetBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 20,
    },
    resetBtnGradient: {
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },
    resetBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        fontFamily: 'Inter_700Bold',
    },
    backLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    backLinkText: {
        fontSize: 14,
        color: Colors.primary,
        fontFamily: 'Inter_500Medium',
    },
    // Success state
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    successIconWrap: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.accent + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successMessage: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 8,
    },
    successHint: {
        fontSize: 13,
        color: Colors.textMuted,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        marginBottom: 32,
    },
    tryAgainBtn: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        backgroundColor: Colors.card,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 12,
    },
    tryAgainText: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontFamily: 'Inter_600SemiBold',
    },
    backToLoginBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        width: '100%',
    },
    backToLoginGradient: {
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },
    backToLoginText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
        fontFamily: 'Inter_700Bold',
    },
});
