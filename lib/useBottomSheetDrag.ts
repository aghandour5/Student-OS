import { useEffect, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type WithSpringConfig,
} from 'react-native-reanimated';

type BottomSheetDragOptions = {
  threshold?: number;
  velocityThreshold?: number;
  hitSlop?: any;
  springConfig?: WithSpringConfig;
};

// Minimum drag distance (px) before the sheet considers closing
const DEFAULT_THRESHOLD = 120;
// Minimum fling velocity (px/s) that triggers close regardless of distance
const DEFAULT_VELOCITY = 900;
// Spring animation config for snapping back to the open position
const DEFAULT_SPRING: WithSpringConfig = {
  damping: 16,
  stiffness: 200,
};

/**
 * Reusable drag-to-dismiss behavior for bottom sheets.
 * - Sheet tracks finger while dragging down.
 * - If the drag crosses the threshold (distance or velocity) it animates off-screen then calls onClose.
 * - Otherwise it snaps back to the open position.
 */
export function useBottomSheetDrag(
  isOpen: boolean,
  onClose: () => void,
  options: BottomSheetDragOptions = {}
) {
  const translateY = useSharedValue(0);
  const screenHeight = Dimensions.get('window').height;

  // Expand the touch target beyond the drag handle for easier grabbing
  const hitSlop = useMemo(
    () => options.hitSlop ?? { top: 12, bottom: 12, left: 24, right: 24 },
    [options.hitSlop]
  );
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  const velocityThreshold = options.velocityThreshold ?? DEFAULT_VELOCITY;
  const springConfig = options.springConfig ?? DEFAULT_SPRING;

  // Reset translation when the sheet closes (so it starts fresh on re-open)
  useEffect(() => {
    if (!isOpen) {
      translateY.value = 0;
    }
  }, [isOpen, translateY]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(2)
        .hitSlop(hitSlop)
        .onUpdate((event) => {
          'worklet';
          if (event.translationY > 0) {
            translateY.value = event.translationY;
          }
        })
        .onEnd((event) => {
          'worklet';
          const shouldClose =
            event.translationY > threshold || event.velocityY > velocityThreshold;

          if (shouldClose) {
            translateY.value = withTiming(
              screenHeight,
              { duration: 220 },
              (finished) => {
                if (finished) runOnJS(onClose)();
              }
            );
          } else {
            translateY.value = withSpring(0, springConfig);
          }
        }),
    [hitSlop, threshold, velocityThreshold, screenHeight, onClose, springConfig, translateY]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return {
    gesture,
    animatedStyle,
    translateY,
    reset: () => {
      translateY.value = withSpring(0, springConfig);
    },
  };
}
