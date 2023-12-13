import React, { FC, PropsWithChildren, memo } from "react";

import { Dimensions, View, StyleSheet } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  WithSpringConfig,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const WINDOW_HEIGHT = Dimensions.get("window").height;
const WINDOW_WIDTH = Dimensions.get("window").width;

const bounceBackConfig: WithSpringConfig = { mass: 1, damping: 12, stiffness: 80 };

// increase this to make scale weaker
const SCALE_STRENGTH_COEFFICIENT = 2;

const HALF_WINDOW_WIDTH = WINDOW_WIDTH / 2;
const HALF_WINDOW_HEIGHT = WINDOW_HEIGHT / 2;

const MAX_ALLOWED_SCALE = 5;

interface PreviewMediaListItemImageProps extends PropsWithChildren {
  onPress?: () => void;

  onPinchBegin?: () => void;
}

export const GestureZoom: FC<PreviewMediaListItemImageProps> = memo(
  ({ onPress, onPinchBegin, children }) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const panTranslationX = useSharedValue(0);
    const panTranslationY = useSharedValue(0);

    const savedPanTranslationX = useSharedValue(0);
    const savedPanTranslationY = useSharedValue(0);

    const pinchTranslationX = useSharedValue(0);
    const pinchTranslationY = useSharedValue(0);

    const savedPinchTranslationX = useSharedValue(0);
    const savedPinchTranslationY = useSharedValue(0);

    const pinchFocalX = useSharedValue(0);
    const pinchFocalY = useSharedValue(0);

    const resetState = () => {
      "worklet";
      scale.value = withSpring(1, bounceBackConfig);
      savedScale.value = 1;
      panTranslationX.value = withSpring(0, bounceBackConfig);
      panTranslationY.value = withSpring(0, bounceBackConfig);
      savedPanTranslationX.value = 0;
      savedPanTranslationY.value = 0;
      pinchTranslationX.value = withSpring(0, bounceBackConfig);
      pinchTranslationY.value = withSpring(0, bounceBackConfig);
      savedPinchTranslationX.value = 0;
      savedPinchTranslationY.value = 0;
      pinchFocalX.value = 0;
      pinchFocalY.value = 0;
    };

    const handleOutOfBounds = () => {
      "worklet";
      const scaleWidthDifferenceHalf = (WINDOW_WIDTH * (scale.value - 1)) / 2;
      const scaleHeightDifferenceHalf = (WINDOW_HEIGHT * (scale.value - 1)) / 2;

      const combinedTranslationX = panTranslationX.value + pinchTranslationX.value;
      const combinedTranslationY = panTranslationY.value + pinchTranslationY.value;

      const offsetX = combinedTranslationX - scaleWidthDifferenceHalf;
      const offsetY = combinedTranslationY - scaleHeightDifferenceHalf;

      const maxOffsetX = WINDOW_WIDTH - scale.value * WINDOW_WIDTH;
      const maxOffsetY = WINDOW_HEIGHT - scale.value * WINDOW_HEIGHT;

      if (offsetX > 0) {
        const newPanX = panTranslationX.value - offsetX;
        panTranslationX.value = withSpring(newPanX, bounceBackConfig);
        savedPanTranslationX.value = newPanX;
      } else if (offsetX < WINDOW_WIDTH - scale.value * WINDOW_WIDTH) {
        const newPanX = panTranslationX.value - offsetX + maxOffsetX;
        panTranslationX.value = withSpring(newPanX, bounceBackConfig);
        savedPanTranslationX.value = newPanX;
      } else {
        savedPanTranslationX.value = panTranslationX.value;
      }

      if (offsetY > 0) {
        const newPanY = panTranslationY.value - offsetY;
        panTranslationY.value = withSpring(newPanY, bounceBackConfig);
        savedPanTranslationY.value = newPanY;
      } else if (offsetY < maxOffsetY) {
        const newPanY = panTranslationY.value - offsetY + maxOffsetY;
        panTranslationY.value = withSpring(newPanY, bounceBackConfig);
        savedPanTranslationY.value = newPanY;
      } else {
        savedPanTranslationY.value = panTranslationY.value;
      }
    };

    const pinch = Gesture.Pinch()
      .onStart((e) => {
        if (onPinchBegin) runOnJS(onPinchBegin)();
        pinchFocalX.value = e.focalX;
        pinchFocalY.value = e.focalY;
      })
      .onChange((e) => {
        const scaleIntensity = 1 + (e.scale - 1) / SCALE_STRENGTH_COEFFICIENT;

        const translateIntensity = scaleIntensity - 1;

        if (savedScale.value * scaleIntensity < MAX_ALLOWED_SCALE) {
          const offsetX = HALF_WINDOW_WIDTH - pinchFocalX.value;
          const offsetY = HALF_WINDOW_HEIGHT - pinchFocalY.value;
          pinchTranslationX.value = translateIntensity * offsetX + savedPinchTranslationX.value;
          pinchTranslationY.value = translateIntensity * offsetY + savedPinchTranslationY.value;
          scale.value = savedScale.value * scaleIntensity;
        }
      })
      .onEnd(() => {
        savedScale.value = scale.value;
        savedPinchTranslationX.value = pinchTranslationX.value;
        savedPinchTranslationY.value = pinchTranslationY.value;

        if (scale.value < 1) resetState();
      });

    const pan = Gesture.Pan()
      .onChange((event) => {
        panTranslationX.value = event.translationX + savedPanTranslationX.value;
        panTranslationY.value = event.translationY + savedPanTranslationY.value;
      })
      .onEnd((event) => {
        if (scale.value < 1) return;

        handleOutOfBounds();
      })
      .maxPointers(2)
      .minPointers(2);

    const animatedStyle = useAnimatedStyle(() => ({
      borderWidth: 1,
      borderColor: "cyan",
      transform: [
        { translateX: panTranslationX.value },
        { translateY: panTranslationY.value },
        { translateX: pinchTranslationX.value },
        { translateY: pinchTranslationY.value },
        { scale: scale.value },
      ],
    }));

    const composedGestures = Gesture.Simultaneous(pinch, pan);

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={composedGestures}>
          <View style={styles.container}>
            <Animated.View style={[animatedStyle, { flex: 1 }]}>{children}</Animated.View>
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "black",
  },
});
