import React from 'react';
import { Pressable, StyleSheet, Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';

export type TermKey = 'Prerequisites' | 'Corequisites' | 'Unlocks' | 'Credits' | 'GPA' | 'Cumulative GPA' | 'Semester GPA';

const DEFINITIONS: Record<TermKey, string> = {
    'Prerequisites': 'Courses you must complete BEFORE you can take this course.',
    'Corequisites': 'Courses you must take AT THE SAME TIME as this course (or have already completed).',
    'Unlocks': 'Courses that require this course as a prerequisite. Completing this course will allow you to take these future courses.',
    'Credits': 'The value of the course towards your degree. Most courses are 3 credits. Lab courses are often 1 credit.',
    'GPA': 'Grade Point Average. A number representing the average value of your accumulated final grades earned in courses over time.',
    'Cumulative GPA': 'The average of all your grades from the beginning of your studies until now.',
    'Semester GPA': 'The average of your grades for a specific semester.',
};

interface TermInfoProps {
    term: TermKey;
    size?: number;
    color?: string;
    style?: any;
}

export function TermInfo({ term, size = 16, color, style }: TermInfoProps) {
    const { colors } = useTheme();
    const resolvedColor = color ?? colors.textSecondary;
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(term, DEFINITIONS[term]);
    };

    return (
        <Pressable onPress={handlePress} style={[styles.container, style]} hitSlop={8}>
            <Ionicons name="information-circle-outline" size={size} color={resolvedColor} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
