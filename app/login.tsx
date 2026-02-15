/**
 * Login Screen — Email/password authentication with Firebase.
 * Links to Register and Forgot Password screens.
 * Includes "Continue as Guest" for restricted access.
 */
import React, { useState } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
    Platform, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';

export default function LoginScreen() {
    const { login, continueAsGuest, isLoading } = useAuth();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.replace('/(tabs)');
        } catch (err: any) {
            const code = err?.code || '';
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else if (code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (code === 'auth/too-many-requests') {
                setError('Too many attempts. Please try again later.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = () => {
        continueAsGuest();
        router.replace('/(tabs)');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>

                        <Image
                            source={require('@/assets/images/Logo - UniFlow.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>UniFlow</Text>
                        <Text style={styles.tagline}>Your academic journey, organized</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
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
                                    returnKeyType="next"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={Colors.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                                </Pressable>
                            </View>
                        </View>

                        <Pressable onPress={() => router.push('/forgot-password')} style={styles.forgotBtn}>
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </Pressable>

                        {/* Login Button */}
                        <Pressable
                            onPress={handleLogin}
                            disabled={loading}
                            style={({ pressed }) => [styles.loginBtn, { opacity: pressed || loading ? 0.7 : 1 }]}
                        >
                            <LinearGradient
                                colors={[Colors.primary, Colors.primaryDark]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.loginBtnGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.loginBtnText}>Log In</Text>
                                )}
                            </LinearGradient>
                        </Pressable>

                        {/* Register Link */}
                        <View style={styles.registerRow}>
                            <Text style={styles.registerLabel}>Don't have an account?</Text>
                            <Pressable onPress={() => router.push('/register')}>
                                <Text style={styles.registerLink}> Create Account</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Guest Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.divider} />
                    </View>

                    {/* Continue as Guest */}
                    <Pressable
                        onPress={handleGuest}
                        style={({ pressed }) => [styles.guestBtn, { opacity: pressed ? 0.7 : 1 }]}
                    >
                        <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                        <Text style={styles.guestBtnText}>Continue as Guest</Text>
                    </Pressable>
                    <Text style={styles.guestNote}>Limited features — progress won't be saved</Text>
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
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 16,
        borderRadius: 24,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.text,
        fontFamily: 'Inter_700Bold',
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontFamily: 'Inter_400Regular',
        marginTop: 4,
    },
    form: {
        marginBottom: 24,
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
        marginBottom: 16,
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
    eyeBtn: {
        padding: 4,
        marginLeft: 4,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        marginTop: 4,
    },
    forgotText: {
        fontSize: 13,
        color: Colors.primary,
        fontFamily: 'Inter_500Medium',
    },
    loginBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 16,
    },
    loginBtnGradient: {
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },
    loginBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        fontFamily: 'Inter_700Bold',
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontFamily: 'Inter_400Regular',
    },
    registerLink: {
        fontSize: 14,
        color: Colors.primary,
        fontFamily: 'Inter_600SemiBold',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.cardBorder,
    },
    dividerText: {
        fontSize: 13,
        color: Colors.textMuted,
        fontFamily: 'Inter_400Regular',
        marginHorizontal: 16,
    },
    guestBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        backgroundColor: Colors.card,
    },
    guestBtnText: {
        fontSize: 15,
        color: Colors.textSecondary,
        fontFamily: 'Inter_600SemiBold',
    },
    guestNote: {
        fontSize: 12,
        color: Colors.textMuted,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        marginTop: 8,
    },
});
