/**
 * Register Screen — Create a new account with Firebase Auth.
 * Includes major selection (CENG, EENG, MENG) with styled cards.
 * Password strength meter and validation included.
 */
import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
    Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';

const MAJORS = [
    { id: 'CENG', label: 'Computer Engineering', icon: 'laptop' as const, color: Colors.categoryColors['Computer Engineering'] || Colors.primary },
    { id: 'EENG', label: 'Electrical Engineering', icon: 'lightning-bolt' as const, color: Colors.categoryColors['Electrical Engineering'] || '#F97316' },
    { id: 'MENG', label: 'Mechanical Engineering', icon: 'cog' as const, color: Colors.categoryColors['Mechanical Engineering'] || '#F43F5E' },
];

export default function RegisterScreen() {
    const { register } = useAuth();
    const insets = useSafeAreaInsets();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password Validation State
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);

    useEffect(() => {
        validatePassword(password);
    }, [password]);

    const validatePassword = (pass: string) => {
        let score = 0;
        let feedback = [];

        if (pass.length >= 8) score += 1;
        else feedback.push('At least 8 characters');

        if (/\d/.test(pass)) score += 1;
        else feedback.push('Contains a number');

        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;
        else feedback.push('Contains a special character');

        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
        // Optional mixed case check, doesn't add to feedback list to keep it simple

        setPasswordStrength(score);
        setPasswordFeedback(feedback);
    };

    const getStrengthColor = () => {
        if (password.length === 0) return Colors.cardBorder;
        if (passwordStrength <= 1) return Colors.danger;
        if (passwordStrength === 2 || passwordStrength === 3) return '#EAB308'; // Yellow/Orange
        return Colors.primary; // Green/Primary
    };

    const getStrengthLabel = () => {
        if (password.length === 0) return '';
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength === 2 || passwordStrength === 3) return 'Medium';
        return 'Strong';
    };

    const handleRegister = async () => {
        // Validation
        if (!fullName.trim()) { setError('Please enter your full name.'); return; }
        if (!email.trim()) { setError('Please enter your email.'); return; }

        // Strict Password Validation
        if (passwordFeedback.length > 0) {
            setError(`Password requirement missing: ${passwordFeedback[0]}`);
            return;
        }

        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (!selectedMajor) { setError('Please select your major.'); return; }

        setError('');
        setLoading(true);
        try {
            await register(email, password, fullName.trim(), selectedMajor);
            router.replace('/(tabs)');
        } catch (err: any) {
            const code = err?.code || '';
            if (code === 'auth/email-already-in-use') {
                setError('This email is already registered. Please log in.');
            } else if (code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (code === 'auth/weak-password') {
                setError('Password is too weak.');
            } else {
                setError('Registration failed. Please try again.');
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

                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join UniFlow and start tracking your degree progress</Text>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                placeholderTextColor={Colors.textMuted}
                                value={fullName}
                                onChangeText={setFullName}
                                autoCapitalize="words"
                                returnKeyType="next"
                            />
                        </View>
                    </View>

                    {/* Email */}
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

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Min. 8 chars, number, special char"
                                placeholderTextColor={Colors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                returnKeyType="next"
                            />
                            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                            </Pressable>
                        </View>

                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <View style={styles.strengthContainer}>
                                <View style={styles.strengthBarBg}>
                                    <View
                                        style={[
                                            styles.strengthBarFill,
                                            {
                                                width: `${(Math.max(passwordStrength, 1) / 4) * 100}%`,
                                                backgroundColor: getStrengthColor()
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.strengthLabel, { color: getStrengthColor() }]}>
                                    {getStrengthLabel()}
                                </Text>
                            </View>
                        )}
                        {/* Missing Requirements */}
                        {password.length > 0 && passwordFeedback.length > 0 && (
                            <View style={styles.requirementsList}>
                                {passwordFeedback.map((req, index) => (
                                    <View key={index} style={styles.reqItem}>
                                        <Ionicons name="radio-button-off" size={12} color={Colors.textMuted} />
                                        <Text style={styles.reqText}>{req}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={[
                            styles.inputWrapper,
                            confirmPassword.length > 0 && password === confirmPassword && { borderColor: Colors.primary }
                        ]}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter password"
                                placeholderTextColor={Colors.textMuted}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                returnKeyType="done"
                            />
                            {confirmPassword.length > 0 && (
                                <Ionicons
                                    name={password === confirmPassword ? "checkmark-circle" : "close-circle"}
                                    size={20}
                                    color={password === confirmPassword ? Colors.primary : Colors.danger}
                                    style={{ marginRight: 8 }}
                                />
                            )}
                        </View>
                    </View>

                    {/* Major Selection */}
                    <View style={styles.majorSection}>
                        <Text style={styles.label}>Select Your Major</Text>
                        <View style={styles.majorGrid}>
                            {MAJORS.map((major) => {
                                const isSelected = selectedMajor === major.id;
                                return (
                                    <Pressable
                                        key={major.id}
                                        onPress={() => setSelectedMajor(major.id)}
                                        style={[
                                            styles.majorCard,
                                            isSelected && { borderColor: major.color, backgroundColor: major.color + '10' },
                                        ]}
                                    >
                                        <View style={[
                                            styles.majorIconWrap,
                                            { backgroundColor: isSelected ? major.color + '25' : Colors.cardBorder + '50' },
                                        ]}>
                                            <MaterialCommunityIcons
                                                name={major.icon}
                                                size={24}
                                                color={isSelected ? major.color : Colors.textMuted}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.majorLabel,
                                            isSelected && { color: major.color, fontFamily: 'Inter_700Bold' },
                                        ]}>
                                            {major.label}
                                        </Text>
                                        {isSelected && (
                                            <View style={[styles.checkCircle, { backgroundColor: major.color }]}>
                                                <Ionicons name="checkmark" size={14} color="#fff" />
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* Register Button */}
                    <Pressable
                        onPress={handleRegister}
                        disabled={loading}
                        style={({ pressed }) => [styles.registerBtn, { opacity: pressed || loading ? 0.7 : 1 }]}
                    >
                        <LinearGradient
                            colors={[Colors.primary, Colors.primaryDark]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.registerBtnGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.registerBtnText}>Create Account</Text>
                            )}
                        </LinearGradient>
                    </Pressable>

                    {/* Login Link */}
                    <View style={styles.loginRow}>
                        <Text style={styles.loginLabel}>Already have an account?</Text>
                        <Pressable onPress={() => router.back()}>
                            <Text style={styles.loginLink}> Log In</Text>
                        </Pressable>
                    </View>
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
        marginBottom: 24,
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
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 12,
    },
    strengthBarBg: {
        flex: 1,
        height: 4,
        backgroundColor: Colors.cardBorder,
        borderRadius: 2,
        overflow: 'hidden',
    },
    strengthBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        width: 50,
        textAlign: 'right',
    },
    requirementsList: {
        marginTop: 8,
        gap: 4,
    },
    reqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    reqText: {
        fontSize: 12,
        color: Colors.textMuted,
        fontFamily: 'Inter_400Regular',
    },
    majorSection: {
        marginBottom: 24,
        marginTop: 8,
    },
    majorGrid: {
        gap: 10,
    },
    majorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: Colors.card,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: Colors.cardBorder,
        padding: 16,
        position: 'relative',
    },
    majorIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    majorLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text,
        fontFamily: 'Inter_500Medium',
    },
    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 16,
    },
    registerBtnGradient: {
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },
    registerBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        fontFamily: 'Inter_700Bold',
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontFamily: 'Inter_400Regular',
    },
    loginLink: {
        fontSize: 14,
        color: Colors.primary,
        fontFamily: 'Inter_600SemiBold',
    },
});
