import React, { useState, useMemo, useCallback, startTransition, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
  Dimensions, ActivityIndicator, LayoutAnimation, UIManager, TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDecay, withSpring, runOnJS } from 'react-native-reanimated';
import Svg, { Line, Circle as SvgCircle, Rect, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';
import { useAcademic } from '@/lib/academic-context';
import type { CourseWithPrereqs } from '@shared/schema';

const NODE_WIDTH = 140;
const NODE_HEIGHT = 56;
const YEAR_GAP = 180;
const COURSE_GAP = 16;
const LEFT_MARGIN = 20;
const TOP_MARGIN = 30;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

type CourseStatus = 'completed' | 'in_progress' | 'available' | 'locked' | 'future';

const statusColors: Record<CourseStatus, string> = {
  completed: Colors.courseCompleted,
  in_progress: Colors.courseInProgress,
  available: Colors.primary,
  locked: Colors.courseLocked,
  future: Colors.courseFuture,
};

interface NodePosition {
  x: number;
  y: number;
  course: CourseWithPrereqs;
}

interface TooltipData {
  course: CourseWithPrereqs;
  status: CourseStatus;
  screenX: number;
  screenY: number;
}

const statusLabels: Record<string, string> = {
  completed: 'Completed',
  in_progress: 'In Progress',
  available: 'Available',
  locked: 'Locked',
  future: 'Future',
};

const TOOLTIP_WIDTH = 220;
const TOOLTIP_AUTO_DISMISS_MS = 3000;

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[styles.filterChip, { backgroundColor: colors.card, borderColor: colors.cardBorder }, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, { color: colors.textSecondary }, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SkeletonBlock({ width, height, style }: { width: number | string; height: number; style?: any }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.skeletonBlock, { width, height, backgroundColor: colors.card, borderColor: colors.cardBorder }, style]} />
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { courses, isLoading, getCourseStatus } = useAcademic();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ filter?: string }>();
  const [mapSearch, setMapSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<CourseStatus | 'all'>('all');
  const [pendingFilter, setPendingFilter] = useState<CourseStatus | 'all'>('all');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [pendingHighlight, setPendingHighlight] = useState<string | null | undefined>(undefined);
  const [filterProgress, setFilterProgress] = useState(100);
  const [displayedProgress, setDisplayedProgress] = useState(100);
  const [displayedFilterProgress, setDisplayedFilterProgress] = useState(100);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapContainerRef = useRef<View>(null);
  const mapContainerTopRef = useRef(0);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastScale = useSharedValue(1);
  const lastTranslateX = useSharedValue(0);
  const lastTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const viewportWidth = useSharedValue(Dimensions.get('window').width);
  const viewportHeight = useSharedValue(Dimensions.get('window').height * 0.6);

  useFocusEffect(
    useCallback(() => {
      if (params.filter && ['completed', 'in_progress', 'available', 'locked'].includes(params.filter)) {
        const f = params.filter as CourseStatus;
        setPendingFilter(f);
        setSelectedFilter(f);
      }
      return () => {
        setHighlightedId(null);
        setPendingHighlight(undefined);
        setTooltipData(null);
        setTooltipVisible(false);
        if (tooltipTimerRef.current) {
          clearTimeout(tooltipTimerRef.current);
          tooltipTimerRef.current = null;
        }
      };
    }, [params.filter])
  );

  const handleHighlight = useCallback((newId: string | null) => {
    setPendingHighlight(newId);
    startTransition(() => {
      setHighlightedId(newId);
      setPendingHighlight(undefined);
    });
  }, []);

  const handleFilterChange = useCallback((filter: CourseStatus | 'all') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPendingFilter(filter);
    setFilterProgress(0);
    startTransition(() => {
      setSelectedFilter(filter);
    });
  }, []);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  // Filter progress: compute target based on transition state
  useEffect(() => {
    if (pendingFilter === selectedFilter) {
      setFilterProgress(100);
      setDisplayedFilterProgress(100);
      return;
    }
    setFilterProgress(0);
    setDisplayedFilterProgress(0);
    // Simulate milestones: quickly ramp to 90 then wait for transition to complete
    const milestones = [15, 35, 55, 75, 90];
    let i = 0;
    const interval = setInterval(() => {
      if (i < milestones.length) {
        setFilterProgress(milestones[i]);
        i++;
      }
    }, 120);
    return () => clearInterval(interval);
  }, [pendingFilter, selectedFilter]);

  // Smooth stepping for filter progress display
  useEffect(() => {
    if (displayedFilterProgress >= filterProgress) return;
    const timer = setTimeout(() => {
      setDisplayedFilterProgress(prev => {
        const step = Math.max(1, Math.floor((filterProgress - prev) / 3));
        return Math.min(filterProgress, prev + step);
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [displayedFilterProgress, filterProgress]);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const dismissTooltip = useCallback(() => {
    setTooltipVisible(false);
    setTooltipData(null);
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
  }, []);

  const showTooltip = useCallback((course: CourseWithPrereqs, status: CourseStatus, screenX: number, screenY: number) => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
    }
    setTooltipData({ course, status, screenX, screenY });
    setTooltipVisible(true);
    tooltipTimerRef.current = setTimeout(() => {
      setTooltipVisible(false);
      setTooltipData(null);
      tooltipTimerRef.current = null;
    }, TOOLTIP_AUTO_DISMISS_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mapSearch.trim().length > 0) {
      const query = mapSearch.toLowerCase();
      const match = courses.find(c =>
        c.code.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query)
      );
      if (match) {
        handleHighlight(match.id);
      }
    } else {
      handleHighlight(null);
    }
  }, [mapSearch, courses]);

  const resetZoom = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    lastScale.value = 1;
    lastTranslateX.value = 0;
    lastTranslateY.value = 0;
  }, [scale, translateX, translateY, lastScale, lastTranslateX, lastTranslateY]);

  const mapTransformStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const semesters = useMemo(() => {
    const grouped = new Map<string, CourseWithPrereqs[]>();
    courses.forEach(c => {
      const key = `Y${c.year}S${c.semester}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(c);
    });
    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [courses]);

  const { positions, svgWidth, svgHeight } = useMemo(() => {
    const posMap = new Map<string, NodePosition>();
    let maxX = 0;
    let currentY = TOP_MARGIN;

    for (const [_key, semCourses] of semesters) {
      let currentX = LEFT_MARGIN;
      for (const course of semCourses) {
        posMap.set(course.id, { x: currentX, y: currentY, course });
        currentX += NODE_WIDTH + COURSE_GAP;
        if (currentX > maxX) maxX = currentX;
      }
      currentY += NODE_HEIGHT + YEAR_GAP / 2;
    }

    return {
      positions: posMap,
      svgWidth: Math.max(maxX + LEFT_MARGIN, Dimensions.get('window').width),
      svgHeight: currentY + 40,
    };
  }, [semesters]);

  const contentWidth = useSharedValue(svgWidth);
  const contentHeight = useSharedValue(svgHeight);

  useEffect(() => {
    contentWidth.value = svgWidth;
    contentHeight.value = svgHeight;
  }, [svgWidth, svgHeight]);

  const isPinching = useSharedValue(false);

  const pinchGesture = useMemo(() => Gesture.Pinch()
    .onBegin((e) => {
      isPinching.value = true;
      lastScale.value = scale.value;
      focalX.value = e.focalX;
      focalY.value = e.focalY;
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, lastScale.value * e.scale));
      const scaleDiff = newScale / lastScale.value;
      translateX.value = focalX.value - scaleDiff * (focalX.value - lastTranslateX.value);
      translateY.value = focalY.value - scaleDiff * (focalY.value - lastTranslateY.value);
      scale.value = newScale;
    })
    .onEnd(() => {
      isPinching.value = false;
      lastScale.value = scale.value;

      const cW = contentWidth.value * scale.value;
      const cH = contentHeight.value * scale.value;
      const vw = viewportWidth.value;
      const vh = viewportHeight.value;
      let tx = translateX.value;
      let ty = translateY.value;

      if (cW <= vw) { tx = (vw - cW) / 2; }
      else { tx = Math.max(-(cW - vw), Math.min(0, tx)); }
      if (cH <= vh) { ty = (vh - cH) / 2; }
      else { ty = Math.max(-(cH - vh), Math.min(0, ty)); }

      if (tx !== translateX.value) translateX.value = withSpring(tx, { damping: 25, stiffness: 120 });
      if (ty !== translateY.value) translateY.value = withSpring(ty, { damping: 25, stiffness: 120 });
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    }), [lastScale, scale, focalX, focalY, lastTranslateX, lastTranslateY, translateX, translateY, isPinching, contentWidth, contentHeight, viewportWidth, viewportHeight]);

  const panGesture = useMemo(() => Gesture.Pan()
    .minDistance(5)
    .minPointers(1)
    .maxPointers(2)
    .onStart(() => {
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (isPinching.value) return;
      translateX.value = lastTranslateX.value + e.translationX;
      translateY.value = lastTranslateY.value + e.translationY;
    })
    .onEnd((e) => {
      if (isPinching.value) return;
      const cW = contentWidth.value * scale.value;
      const cH = contentHeight.value * scale.value;
      const vw = viewportWidth.value;
      const vh = viewportHeight.value;

      const minX = cW <= vw ? (vw - cW) / 2 : -(cW - vw);
      const maxX = cW <= vw ? (vw - cW) / 2 : 0;
      const minY = cH <= vh ? (vh - cH) / 2 : -(cH - vh);
      const maxY = cH <= vh ? (vh - cH) / 2 : 0;

      translateX.value = withDecay({
        velocity: e.velocityX,
        deceleration: 0.994,
        clamp: [minX, maxX],
      });
      translateY.value = withDecay({
        velocity: e.velocityY,
        deceleration: 0.994,
        clamp: [minY, maxY],
      });

      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    }), [lastTranslateX, lastTranslateY, translateX, translateY, scale, isPinching, contentWidth, contentHeight, viewportWidth, viewportHeight]);

  const mapGesture = useMemo(() => (
    Gesture.Simultaneous(panGesture, pinchGesture)
  ), [panGesture, pinchGesture]);

  const mapViewportRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !mapViewportRef.current) return;
    const el = mapViewportRef.current as unknown as HTMLElement;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
        const newS = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value * zoomFactor));
        const rect = el.getBoundingClientRect();
        const fx = e.clientX - rect.left;
        const fy = e.clientY - rect.top;
        const scaleDiff = newS / scale.value;
        translateX.value = fx - scaleDiff * (fx - translateX.value);
        translateY.value = fy - scaleDiff * (fy - translateY.value);
        scale.value = newS;
        lastScale.value = newS;
        lastTranslateX.value = translateX.value;
        lastTranslateY.value = translateY.value;
      } else {
        translateX.value = translateX.value - e.deltaX;
        translateY.value = translateY.value - e.deltaY;
        lastTranslateX.value = translateX.value;
        lastTranslateY.value = translateY.value;
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [scale, translateX, translateY, lastScale, lastTranslateX, lastTranslateY]);

  const edges = useMemo(() => {
    const result: { from: NodePosition; to: NodePosition; status: CourseStatus }[] = [];
    courses.forEach(course => {
      const toPos = positions.get(course.id);
      if (!toPos) return;
      course.prerequisites.forEach(prereqId => {
        const fromPos = positions.get(prereqId);
        if (!fromPos) return;
        result.push({ from: fromPos, to: toPos, status: getCourseStatus(course.id) });
      });
    });
    return result;
  }, [courses, positions, getCourseStatus]);

  const loadingProgress = useMemo(() => {
    if (!isLoading) return 100;
    if (courses.length > 0 && semesters.length > 0 && positions.size > 0 && edges.length > 0) return 100;
    let progress = 5;
    if (courses.length > 0) progress = 30;
    if (semesters.length > 0) progress = 55;
    if (positions.size > 0) progress = 75;
    if (edges.length > 0) progress = 90;
    return progress;
  }, [courses.length, semesters.length, positions.size, edges.length, isLoading]);

  // Smoothly animate displayed progress toward computed target
  useEffect(() => {
    if (displayedProgress >= loadingProgress) return;
    const timer = setTimeout(() => {
      setDisplayedProgress(prev => {
        const step = Math.max(1, Math.floor((loadingProgress - prev) / 3));
        return Math.min(loadingProgress, prev + step);
      });
    }, 80);
    return () => clearTimeout(timer);
  }, [displayedProgress, loadingProgress]);

  const { connectedNodeIds, connectedEdgeIndices } = useMemo(() => {
    if (!highlightedId) return { connectedNodeIds: new Set<string>(), connectedEdgeIndices: new Set<number>() };
    const nodeIds = new Set<string>([highlightedId]);
    const edgeIdxs = new Set<number>();
    edges.forEach((edge, i) => {
      const fromId = edge.from.course.id;
      const toId = edge.to.course.id;
      if (fromId === highlightedId || toId === highlightedId) {
        edgeIdxs.add(i);
        nodeIds.add(fromId);
        nodeIds.add(toId);
      }
    });
    return { connectedNodeIds: nodeIds, connectedEdgeIndices: edgeIdxs };
  }, [highlightedId, edges]);

  const filteredCourses = useMemo(() => {
    if (selectedFilter === 'all') return courses;
    return courses.filter(c => getCourseStatus(c.id) === selectedFilter);
  }, [courses, selectedFilter, getCourseStatus]);

  const filteredIds = useMemo(() => new Set(filteredCourses.map(c => c.id)), [filteredCourses]);

  const statusCounts = useMemo(() => {
    const counts: Record<CourseStatus, number> = {
      completed: 0,
      in_progress: 0,
      available: 0,
      locked: 0,
      future: 0,
    };
    courses.forEach(course => {
      const status = getCourseStatus(course.id);
      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });
    return counts;
  }, [courses, getCourseStatus]);

  const pendingCount = pendingFilter === 'all'
    ? courses.length
    : statusCounts[pendingFilter] ?? 0;

  const filterSummaryText = selectedFilter === 'all'
    ? `Showing ${courses.length} courses`
    : `Showing ${filteredCourses.length} of ${courses.length} courses`;

  const isWeb = Platform.OS === 'web';
  const webScrollRef = useRef<ScrollView>(null);
  const [webZoom, setWebZoom] = useState(1);

  const handleZoomIn = useCallback(() => {
    setWebZoom(prev => Math.min(2, prev + 0.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setWebZoom(prev => Math.max(0.4, prev - 0.2));
  }, []);

  const handleZoomReset = useCallback(() => {
    setWebZoom(1);
  }, []);

  if (displayedProgress < 100) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset, backgroundColor: colors.background }]}>
        <Text style={[styles.loadingPercent, { color: colors.primary }]}>{displayedProgress}%</Text>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading your degree map</Text>
        <View style={[styles.progressBar, { backgroundColor: colors.cardBorder }]}>
          <View style={[styles.progressFill, { width: `${displayedProgress}%` }]} />
        </View>
        <View style={styles.skeletonContainer}>
          <SkeletonBlock width="60%" height={20} style={{ marginBottom: 10 }} />
          <SkeletonBlock width="40%" height={14} style={{ marginBottom: 20 }} />
          <SkeletonBlock width="100%" height={44} style={{ marginBottom: 12 }} />
          <SkeletonBlock width="100%" height={44} style={{ marginBottom: 12 }} />
          <SkeletonBlock width="100%" height={44} style={{ marginBottom: 12 }} />
          <SkeletonBlock width="100%" height={200} />
        </View>
      </View>
    );
  }

  const semesterLabels = [
    'Year 1 - Fall', 'Year 1 - Spring',
    'Year 2 - Fall', 'Year 2 - Spring',
    'Year 3 - Fall', 'Year 3 - Spring',
    'Year 4 - Fall', 'Year 4 - Spring',
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Degree Map</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Computer Engineering</Text>
          </View>
        </View>
      </View>

      <View style={[styles.mapSearchContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.mapSearchInput, { color: colors.text }]}
          placeholder="Search courses on map..."
          placeholderTextColor={colors.textMuted}
          value={mapSearch}
          onChangeText={setMapSearch}
          returnKeyType="search"
        />
        {mapSearch.length > 0 && (
          <Pressable onPress={() => setMapSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <View style={[styles.controlsContainer, { backgroundColor: colors.background, borderBottomColor: colors.cardBorder + '30' }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          <FilterChip label={`All (${courses.length})`} active={pendingFilter === 'all'} onPress={() => handleFilterChange('all')} />
          <FilterChip label={`Completed (${statusCounts.completed})`} active={pendingFilter === 'completed'} onPress={() => handleFilterChange('completed')} />
          <FilterChip label={`In Progress (${statusCounts.in_progress})`} active={pendingFilter === 'in_progress'} onPress={() => handleFilterChange('in_progress')} />
          <FilterChip label={`Available (${statusCounts.available})`} active={pendingFilter === 'available'} onPress={() => handleFilterChange('available')} />
          <FilterChip label={`Locked (${statusCounts.locked})`} active={pendingFilter === 'locked'} onPress={() => handleFilterChange('locked')} />
        </ScrollView>

        {pendingFilter !== selectedFilter && (
          <View style={styles.filterLoading}>
            <View style={styles.filterLoadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.filterLoadingText, { color: colors.primary }]}>
                  {pendingFilter === 'all'
                    ? 'Showing all courses...'
                    : `Showing ${pendingFilter.replace('_', ' ')} courses...`}
                </Text>
                <Text style={[styles.filterLoadingSubtext, { color: colors.textMuted }]}>
                  Found {pendingCount} {pendingFilter === 'all' ? 'courses' : `${pendingFilter.replace('_', ' ')} courses`}
                </Text>
              </View>
              <Text style={styles.filterProgressText}>{displayedFilterProgress}%</Text>
            </View>
            <View style={styles.filterProgressBar}>
              <View style={[styles.filterProgressFill, { width: `${displayedFilterProgress}%` }]} />
            </View>
          </View>
        )}

        {pendingFilter === selectedFilter && (
          <View style={styles.filterSummary}>
            <Text style={[styles.filterSummaryText, { color: colors.textSecondary }]}>{filterSummaryText}</Text>
          </View>
        )}
      </View>

      {pendingHighlight !== undefined && (
        <View style={styles.highlightLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      <View
        ref={mapContainerRef}
        onLayout={() => {
          mapContainerRef.current?.measureInWindow((_x, y) => {
            mapContainerTopRef.current = y || 0;
          });
        }}
        style={[styles.mapContainer, { backgroundColor: colors.background }]}
      >
        {filteredCourses.length === 0 && selectedFilter !== 'all' ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              No {selectedFilter.replace('_', ' ')} courses found
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textMuted }]}>
              Try selecting a different filter
            </Text>
          </View>
        ) : isWeb ? (
          <View style={styles.mapViewport}>
            <ScrollView
              ref={webScrollRef}
              style={{ flex: 1 }}
              horizontal={false}
              showsVerticalScrollIndicator={true}
              bounces={true}
              scrollEventThrottle={16}
            >
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={true}
                bounces={true}
                nestedScrollEnabled={true}
                contentContainerStyle={{ width: Math.max(svgWidth * webZoom, 1), minHeight: svgHeight * webZoom }}
              >
                <View style={{ width: svgWidth, height: svgHeight, transform: [{ scale: webZoom }], transformOrigin: 'top left' }}>
                  <Svg width={svgWidth} height={svgHeight}>
                    {highlightedId && edges.map((edge, i) => {
                      if (connectedEdgeIndices.has(i)) return null;
                      const fromX = edge.from.x + NODE_WIDTH / 2;
                      const fromY = edge.from.y + NODE_HEIGHT;
                      const toX = edge.to.x + NODE_WIDTH / 2;
                      const toY = edge.to.y;
                      const isVisible = filteredIds.has(edge.from.course.id) || filteredIds.has(edge.to.course.id);
                      if (!isVisible) return null;

                      return (
                        <Line
                          key={`edge-${i}`}
                          x1={fromX}
                          y1={fromY}
                          x2={toX}
                          y2={toY}
                          stroke={colors.cardBorder + '15'}
                          strokeWidth={1}
                          strokeDasharray="4,4"
                        />
                      );
                    })}

                    {highlightedId && edges.map((edge, i) => {
                      if (!connectedEdgeIndices.has(i)) return null;
                      const fromX = edge.from.x + NODE_WIDTH / 2;
                      const fromY = edge.from.y + NODE_HEIGHT;
                      const toX = edge.to.x + NODE_WIDTH / 2;
                      const toY = edge.to.y;
                      const edgeColor = statusColors[getCourseStatus(highlightedId)];
                      return (
                        <React.Fragment key={`hl-edge-${i}`}>
                          <Line
                            x1={fromX}
                            y1={fromY}
                            x2={toX}
                            y2={toY}
                            stroke={edgeColor + '30'}
                            strokeWidth={8}
                            strokeLinecap="round"
                          />
                          <Line
                            x1={fromX}
                            y1={fromY}
                            x2={toX}
                            y2={toY}
                            stroke={edgeColor}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                          />
                          <SvgCircle cx={fromX} cy={fromY} r={4} fill={edgeColor} />
                          <SvgCircle cx={toX} cy={toY} r={4} fill={edgeColor} />
                        </React.Fragment>
                      );
                    })}

                    {semesters.map(([key], idx) => {
                      const semCourses = semesters[idx][1];
                      if (semCourses.length === 0) return null;
                      const firstPos = positions.get(semCourses[0].id);
                      if (!firstPos) return null;
                      return (
                        <SvgText
                          key={`label-${key}`}
                          x={LEFT_MARGIN}
                          y={firstPos.y - 10}
                          fill={colors.textSecondary}
                          fontSize={11}
                          fontWeight="600"
                          opacity={highlightedId ? 0.3 : 1}
                        >
                          {semesterLabels[idx] || key}
                        </SvgText>
                      );
                    })}

                    {Array.from(positions.entries()).map(([courseId, pos]) => {
                      const status = getCourseStatus(courseId);
                      const color = statusColors[status];
                      const isVisible = filteredIds.has(courseId);
                      const isConnected = highlightedId ? connectedNodeIds.has(courseId) : false;
                      const isTheHighlighted = courseId === highlightedId;
                      const dimForHighlight = highlightedId ? !isConnected : false;
                      const opacity = dimForHighlight ? 0.15 : isVisible ? 1 : 0.25;

                      return (
                        <React.Fragment key={courseId}>
                          {isTheHighlighted && (
                            <Rect
                              x={pos.x - 3}
                              y={pos.y - 3}
                              width={NODE_WIDTH + 6}
                              height={NODE_HEIGHT + 6}
                              rx={14}
                              fill="none"
                              stroke={color}
                              strokeWidth={2}
                              opacity={0.4}
                            />
                          )}
                          <Rect
                            x={pos.x}
                            y={pos.y}
                            width={NODE_WIDTH}
                            height={NODE_HEIGHT}
                            rx={12}
                            fill={isConnected && !isTheHighlighted ? color + '15' : colors.card}
                            stroke={isConnected ? color : color}
                            strokeWidth={isTheHighlighted ? 2.5 : isConnected ? 1.5 : 1}
                            opacity={opacity}
                          />
                          <Rect
                            x={pos.x}
                            y={pos.y}
                            width={4}
                            height={NODE_HEIGHT}
                            rx={2}
                            fill={color}
                            opacity={opacity}
                          />
                          <SvgText
                            x={pos.x + 12}
                            y={pos.y + 20}
                            fill={colors.textSecondary}
                            fontSize={9}
                            fontWeight="600"
                            opacity={opacity}
                          >
                            {pos.course.code}
                          </SvgText>
                          <SvgText
                            x={pos.x + 12}
                            y={pos.y + 36}
                            fill={colors.text}
                            fontSize={10}
                            fontWeight="500"
                            opacity={opacity}
                          >
                            {pos.course.title.length > 16 ? pos.course.title.substring(0, 20) + '...' : pos.course.title}
                          </SvgText>
                          <SvgText
                            x={pos.x + NODE_WIDTH - 8}
                            y={pos.y + 16}
                            fill={color}
                            fontSize={9}
                            fontWeight="700"
                            textAnchor="end"
                            opacity={opacity}
                          >
                            {`${pos.course.credits} credits`}
                          </SvgText>
                        </React.Fragment>
                      );
                    })}
                  </Svg>

                  <Pressable
                    style={[StyleSheet.absoluteFill, { width: svgWidth, height: svgHeight }]}
                    onPress={() => {
                      if (tooltipVisible) {
                        dismissTooltip();
                        return;
                      }
                      if (highlightedId) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        handleHighlight(null);
                      }
                    }}
                  >
                    {Array.from(positions.entries()).map(([courseId, pos]) => {
                      const isVisible = filteredIds.has(courseId);
                      if (!isVisible) return null;
                      return (
                        <Pressable
                          key={`touch-${courseId}`}
                          testID={`map-node-${pos.course.code}`}
                          onPress={(e) => {
                            e.stopPropagation();
                            if (tooltipVisible) {
                              dismissTooltip();
                              return;
                            }
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            handleHighlight(highlightedId === courseId ? null : courseId);
                          }}
                          onLongPress={(e) => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            const status = getCourseStatus(courseId);
                            const { pageX, pageY } = e.nativeEvent;
                            showTooltip(pos.course, status, pageX, pageY);
                          }}
                          delayLongPress={500}
                          style={{
                            position: 'absolute',
                            left: pos.x,
                            top: pos.y,
                            width: NODE_WIDTH,
                            height: NODE_HEIGHT,
                          }}
                        />
                      );
                    })}
                  </Pressable>
                </View>
              </ScrollView>
            </ScrollView>
            <View style={styles.zoomControls}>
              <Pressable onPress={handleZoomIn} style={({ pressed }) => [styles.zoomBtn, pressed && { opacity: 0.7 }]}>
                <Ionicons name="add" size={22} color={colors.text} />
              </Pressable>
              <Text style={styles.zoomLabel}>{Math.round(webZoom * 100)}%</Text>
              <Pressable onPress={handleZoomOut} style={({ pressed }) => [styles.zoomBtn, pressed && { opacity: 0.7 }]}>
                <Ionicons name="remove" size={22} color={colors.text} />
              </Pressable>
              <Pressable onPress={handleZoomReset} style={({ pressed }) => [styles.zoomBtn, styles.zoomResetBtn, pressed && { opacity: 0.7 }]}>
                <Ionicons name="contract-outline" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.mapViewport}>
            <ScrollView
              style={{ flex: 1 }}
              horizontal={false}
              showsVerticalScrollIndicator={true}
              bounces={true}
              scrollEventThrottle={16}
            >
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={true}
                bounces={true}
                nestedScrollEnabled={true}
                contentContainerStyle={{ width: Math.max(svgWidth * webZoom, 1), minHeight: svgHeight * webZoom }}
              >
                <View style={{ width: svgWidth, height: svgHeight, transform: [{ scale: webZoom }], transformOrigin: 'top left' }}>
                  <Svg width={svgWidth} height={svgHeight}>
                    {highlightedId && edges.map((edge, i) => {
                      if (connectedEdgeIndices.has(i)) return null;
                      const fromX = edge.from.x + NODE_WIDTH / 2;
                      const fromY = edge.from.y + NODE_HEIGHT;
                      const toX = edge.to.x + NODE_WIDTH / 2;
                      const toY = edge.to.y;
                      const isVisible = filteredIds.has(edge.from.course.id) || filteredIds.has(edge.to.course.id);
                      if (!isVisible) return null;
                      return (
                        <Line key={`edge-${i}`} x1={fromX} y1={fromY} x2={toX} y2={toY} stroke={colors.cardBorder + '15'} strokeWidth={1} strokeDasharray="4,4" />
                      );
                    })}
                    {highlightedId && edges.map((edge, i) => {
                      if (!connectedEdgeIndices.has(i)) return null;
                      const fromX = edge.from.x + NODE_WIDTH / 2;
                      const fromY = edge.from.y + NODE_HEIGHT;
                      const toX = edge.to.x + NODE_WIDTH / 2;
                      const toY = edge.to.y;
                      const edgeColor = statusColors[getCourseStatus(highlightedId)];
                      return (
                        <React.Fragment key={`hl-edge-${i}`}>
                          <Line x1={fromX} y1={fromY} x2={toX} y2={toY} stroke={edgeColor + '30'} strokeWidth={8} strokeLinecap="round" />
                          <Line x1={fromX} y1={fromY} x2={toX} y2={toY} stroke={edgeColor} strokeWidth={2.5} strokeLinecap="round" />
                          <SvgCircle cx={fromX} cy={fromY} r={4} fill={edgeColor} />
                          <SvgCircle cx={toX} cy={toY} r={4} fill={edgeColor} />
                        </React.Fragment>
                      );
                    })}
                    {semesters.map(([key], idx) => {
                      const semCourses = semesters[idx][1];
                      if (semCourses.length === 0) return null;
                      const firstPos = positions.get(semCourses[0].id);
                      if (!firstPos) return null;
                      return (
                        <SvgText key={`label-${key}`} x={LEFT_MARGIN} y={firstPos.y - 10} fill={colors.textSecondary} fontSize={11} fontWeight="600" opacity={highlightedId ? 0.3 : 1}>
                          {semesterLabels[idx] || key}
                        </SvgText>
                      );
                    })}
                    {Array.from(positions.entries()).map(([courseId, pos]) => {
                      const status = getCourseStatus(courseId);
                      const color = statusColors[status];
                      const isVisible = filteredIds.has(courseId);
                      const isConnected = highlightedId ? connectedNodeIds.has(courseId) : false;
                      const isTheHighlighted = courseId === highlightedId;
                      const dimForHighlight = highlightedId ? !isConnected : false;
                      const opacity = dimForHighlight ? 0.15 : isVisible ? 1 : 0.25;
                      return (
                        <React.Fragment key={courseId}>
                          {isTheHighlighted && (
                            <Rect x={pos.x - 3} y={pos.y - 3} width={NODE_WIDTH + 6} height={NODE_HEIGHT + 6} rx={14} fill="none" stroke={color} strokeWidth={2} opacity={0.4} />
                          )}
                          <Rect x={pos.x} y={pos.y} width={NODE_WIDTH} height={NODE_HEIGHT} rx={12} fill={isConnected && !isTheHighlighted ? color + '15' : colors.card} stroke={color} strokeWidth={isTheHighlighted ? 2.5 : isConnected ? 1.5 : 1} opacity={opacity} />
                          <Rect x={pos.x} y={pos.y} width={4} height={NODE_HEIGHT} rx={2} fill={color} opacity={opacity} />
                          <SvgText x={pos.x + 12} y={pos.y + 20} fill={colors.textSecondary} fontSize={9} fontWeight="600" opacity={opacity}>{pos.course.code}</SvgText>
                          <SvgText x={pos.x + 12} y={pos.y + 36} fill={colors.text} fontSize={10} fontWeight="500" opacity={opacity}>{pos.course.title.length > 16 ? pos.course.title.substring(0, 20) + '...' : pos.course.title}</SvgText>
                          <SvgText x={pos.x + NODE_WIDTH - 8} y={pos.y + 16} fill={color} fontSize={9} fontWeight="700" textAnchor="end" opacity={opacity}>{`${pos.course.credits} credits`}</SvgText>
                        </React.Fragment>
                      );
                    })}
                  </Svg>
                  <Pressable
                    style={[StyleSheet.absoluteFill, { width: svgWidth, height: svgHeight }]}
                    onPress={() => {
                      if (tooltipVisible) { dismissTooltip(); return; }
                      if (highlightedId) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleHighlight(null); }
                    }}
                  >
                    {Array.from(positions.entries()).map(([courseId, pos]) => {
                      const isVisible = filteredIds.has(courseId);
                      if (!isVisible) return null;
                      return (
                        <Pressable
                          key={`touch-${courseId}`}
                          testID={`map-node-${pos.course.code}`}
                          onPress={(e) => {
                            e.stopPropagation();
                            if (tooltipVisible) { dismissTooltip(); return; }
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            handleHighlight(highlightedId === courseId ? null : courseId);
                          }}
                          onLongPress={(e) => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            const status = getCourseStatus(courseId);
                            const { pageX, pageY } = e.nativeEvent;
                            showTooltip(pos.course, status, pageX, pageY);
                          }}
                          delayLongPress={500}
                          style={{ position: 'absolute', left: pos.x, top: pos.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
                        />
                      );
                    })}
                  </Pressable>
                </View>
              </ScrollView>
            </ScrollView>
            <View style={styles.zoomControls}>
              <Pressable onPress={handleZoomIn} style={({ pressed }) => [styles.zoomBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }, pressed && { opacity: 0.7 }]}>
                <Ionicons name="add" size={22} color={colors.text} />
              </Pressable>
              <Text style={[styles.zoomLabel, { color: colors.textMuted }]}>{Math.round(webZoom * 100)}%</Text>
              <Pressable onPress={handleZoomOut} style={({ pressed }) => [styles.zoomBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }, pressed && { opacity: 0.7 }]}>
                <Ionicons name="remove" size={22} color={colors.text} />
              </Pressable>
              <Pressable onPress={handleZoomReset} style={({ pressed }) => [styles.zoomBtn, styles.zoomResetBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }, pressed && { opacity: 0.7 }]}>
                <Ionicons name="contract-outline" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        )}

        {tooltipVisible && tooltipData && (() => {
          const vpWidth = Dimensions.get('window').width;
          const vpHeight = Dimensions.get('window').height;
          const TOOLTIP_HEIGHT = 180;

          // Offset by map container top to convert screen coords to container-relative
          const containerTop = mapContainerTopRef.current;

          // Position horizontally centered on tap point, clamped to screen
          let tooltipX = tooltipData.screenX - TOOLTIP_WIDTH / 2;
          tooltipX = Math.max(8, Math.min(tooltipX, vpWidth - TOOLTIP_WIDTH - 8));

          // Convert screen Y to container-relative Y
          const relativeY = tooltipData.screenY - containerTop;

          // Position above tap point by default; if not enough room, show below
          let tooltipY: number;
          if (relativeY - TOOLTIP_HEIGHT - 20 > 10) {
            // Enough room above
            tooltipY = relativeY - TOOLTIP_HEIGHT - 20;
          } else {
            // Show below the tap point
            tooltipY = relativeY + 20;
          }
          // Clamp to container bounds
          tooltipY = Math.max(10, Math.min(tooltipY, vpHeight - containerTop - TOOLTIP_HEIGHT - 40));

          const prereqCount = tooltipData.course.prerequisites.length;
          const unlocksCount = tooltipData.course.unlocks.length;
          const color = statusColors[tooltipData.status];

          return (
            <Pressable
              style={[styles.tooltipOverlay]}
              onPress={dismissTooltip}
            >
              <View
                style={[
                  styles.tooltipCard,
                  {
                    position: 'absolute',
                    left: tooltipX,
                    top: tooltipY,
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.tooltipHeader}>
                  <Text style={[styles.tooltipCode, { color: colors.text }]}>{tooltipData.course.code}</Text>
                  <View style={[styles.tooltipBadge, { backgroundColor: color + '25' }]}>
                    <View style={[styles.tooltipBadgeDot, { backgroundColor: color }]} />
                    <Text style={[styles.tooltipBadgeText, { color }]}>
                      {statusLabels[tooltipData.status] || tooltipData.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.tooltipTitle, { color: colors.textSecondary }]} numberOfLines={2}>{tooltipData.course.title}</Text>
                <View style={[styles.tooltipDivider, { backgroundColor: colors.cardBorder }]} />
                <View style={styles.tooltipRow}>
                  <Text style={[styles.tooltipLabel, { color: colors.textMuted }]}>Credits</Text>
                  <Text style={[styles.tooltipValue, { color: colors.textSecondary }]}>{tooltipData.course.credits}</Text>
                </View>
                <View style={styles.tooltipRow}>
                  <Text style={[styles.tooltipLabel, { color: colors.textMuted }]}>Category</Text>
                  <Text style={[styles.tooltipValue, { color: Colors.categoryColors[tooltipData.course.category] || colors.textSecondary }]}>
                    {tooltipData.course.category}
                  </Text>
                </View>
                <View style={styles.tooltipRow}>
                  <Text style={[styles.tooltipLabel, { color: colors.textMuted }]}>Prerequisites</Text>
                  <Text style={[styles.tooltipValue, { color: colors.textSecondary }]}>{prereqCount}</Text>
                </View>
                <View style={styles.tooltipRow}>
                  <Text style={[styles.tooltipLabel, { color: colors.textMuted }]}>Unlocks</Text>
                  <Text style={[styles.tooltipValue, { color: colors.textSecondary }]}>{unlocksCount}</Text>
                </View>
              </View>
            </Pressable>
          );
        })()}
      </View>

      <View style={styles.legendOverlay}>
        <View style={[styles.legendContainer, { backgroundColor: colors.card + 'EE', borderColor: colors.cardBorder }]}>
          {(['completed', 'in_progress', 'available', 'locked'] as CourseStatus[]).map(status => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: statusColors[status] }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>{status.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingPercent: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.primary,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter_500Medium',
    marginBottom: 16,
  },
  progressBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.cardBorder,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  skeletonContainer: {
    width: '90%',
    paddingHorizontal: 16,
  },
  skeletonBlock: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    opacity: 0.7,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  resetZoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  resetZoomText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  controlsContainer: {
    backgroundColor: Colors.background,
    zIndex: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder + '30',
  },
  filterRow: {
    maxHeight: 44,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.primary + '25',
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    fontFamily: 'Inter_500Medium',
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  filterLoading: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  filterLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterProgressText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
    fontFamily: 'Inter_700Bold',
  },
  filterProgressBar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.cardBorder + '40',
    overflow: 'hidden',
  },
  filterProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  filterLoadingText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
  },
  filterLoadingSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  filterSummary: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  filterSummaryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  highlightLoading: {
    position: 'absolute' as any,
    top: '50%' as any,
    alignSelf: 'center',
    zIndex: 50,
    backgroundColor: Colors.card + 'CC',
    borderRadius: 20,
    padding: 10,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  mapViewport: {
    flex: 1,
    overflow: 'hidden',
  },
  mapCanvas: {
    position: 'relative',
  },
  legendOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 80 : 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none', // Allow touches to pass through container
  },
  legendContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card + 'EE', // Slight transparency
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 16,
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    pointerEvents: 'auto', // Capture touches on legend
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    textTransform: 'capitalize',
  },
  mapSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  mapSearchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  tooltipOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  tooltipCard: {
    position: 'absolute',
    width: TOOLTIP_WIDTH,
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 10000,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tooltipCode: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  tooltipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  tooltipBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tooltipBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  tooltipTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  tooltipDivider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginBottom: 8,
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tooltipLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  tooltipValue: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    alignItems: 'center',
    gap: 4,
  },
  zoomBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomResetBtn: {
    marginTop: 4,
    width: 40,
    height: 32,
    borderRadius: 10,
  },
  zoomLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
});
