import React, { useState, useMemo, useCallback, startTransition } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
  Dimensions, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle as SvgCircle, Rect, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAcademic } from '@/lib/academic-context';
import type { CourseWithPrereqs } from '@shared/schema';

const NODE_WIDTH = 130;
const NODE_HEIGHT = 56;
const YEAR_GAP = 180;
const COURSE_GAP = 16;
const LEFT_MARGIN = 20;
const TOP_MARGIN = 30;

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

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { courses, isLoading, getCourseStatus } = useAcademic();
  const [selectedFilter, setSelectedFilter] = useState<CourseStatus | 'all'>('all');
  const [pendingFilter, setPendingFilter] = useState<CourseStatus | 'all'>('all');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [pendingHighlight, setPendingHighlight] = useState<string | null | undefined>(undefined);

  const handleHighlight = useCallback((newId: string | null) => {
    setPendingHighlight(newId);
    startTransition(() => {
      setHighlightedId(newId);
      setPendingHighlight(undefined);
    });
  }, []);

  const handleFilterChange = useCallback((filter: CourseStatus | 'all') => {
    setPendingFilter(filter);
    startTransition(() => {
      setSelectedFilter(filter);
    });
  }, []);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

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

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <Text style={styles.headerTitle}>Degree Map</Text>
        <Text style={styles.headerSubtitle}>Computer Engineering</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        <FilterChip label="All" active={pendingFilter === 'all'} onPress={() => handleFilterChange('all')} />
        <FilterChip label="Completed" active={pendingFilter === 'completed'} onPress={() => handleFilterChange('completed')} />
        <FilterChip label="In Progress" active={pendingFilter === 'in_progress'} onPress={() => handleFilterChange('in_progress')} />
        <FilterChip label="Available" active={pendingFilter === 'available'} onPress={() => handleFilterChange('available')} />
        <FilterChip label="Locked" active={pendingFilter === 'locked'} onPress={() => handleFilterChange('locked')} />
      </ScrollView>

      {pendingFilter !== selectedFilter && (
        <View style={styles.filterLoading}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.filterLoadingText}>Filtering...</Text>
        </View>
      )}

      {pendingHighlight !== undefined && (
        <View style={styles.highlightLoading}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}

      <ScrollView
        style={styles.mapScroll}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Svg width={svgWidth} height={svgHeight}>
            {edges.map((edge, i) => {
              const fromX = edge.from.x + NODE_WIDTH / 2;
              const fromY = edge.from.y + NODE_HEIGHT;
              const toX = edge.to.x + NODE_WIDTH / 2;
              const toY = edge.to.y;
              const isVisible = filteredIds.has(edge.from.course.id) || filteredIds.has(edge.to.course.id);
              const isHighlighted = highlightedId ? connectedEdgeIndices.has(i) : false;
              const isDimmed = highlightedId ? !isHighlighted : false;

              if (isHighlighted) return null;

              return (
                <Line
                  key={`edge-${i}`}
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke={isDimmed ? Colors.cardBorder + '15' : isVisible ? statusColors[edge.status] + '50' : Colors.cardBorder + '30'}
                  strokeWidth={1.5}
                  strokeDasharray={edge.status === 'locked' ? '4,4' : undefined}
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
                  fill={Colors.textSecondary}
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
                    fill={isConnected && !isTheHighlighted ? color + '15' : Colors.card}
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
                    fill={Colors.textSecondary}
                    fontSize={9}
                    fontWeight="600"
                    opacity={opacity}
                  >
                    {pos.course.code}
                  </SvgText>
                  <SvgText
                    x={pos.x + 12}
                    y={pos.y + 36}
                    fill={Colors.text}
                    fontSize={10}
                    fontWeight="500"
                    opacity={opacity}
                  >
                    {pos.course.title.length > 16 ? pos.course.title.substring(0, 15) + '...' : pos.course.title}
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
                    {pos.course.credits} cr
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>

          <Pressable
            style={[StyleSheet.absoluteFill, { width: svgWidth, height: svgHeight }]}
            onPress={() => {
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
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleHighlight(highlightedId === courseId ? null : courseId);
                  }}
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
        </ScrollView>

        <View style={styles.legend}>
          {(['completed', 'in_progress', 'available', 'locked'] as CourseStatus[]).map(status => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: statusColors[status] }]} />
              <Text style={styles.legendText}>{status.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  filterLoadingText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
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
  mapScroll: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    flexWrap: 'wrap',
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
});
