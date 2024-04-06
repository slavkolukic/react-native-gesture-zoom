import React, { FC, PropsWithChildren, memo } from "react";

import { Dimensions, View, StyleSheet } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  WithSpringConfig,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const WINDOW_HEIGHT = Dimensions.get("window").height;
const WINDOW_WIDTH = Dimensions.get("window").width;

const HALF_WINDOW_WIDTH = WINDOW_WIDTH / 2;
const HALF_WINDOW_HEIGHT = WINDOW_HEIGHT / 2;

const bounceBackConfig: WithSpringConfig = { mass: 1, damping: 12, stiffness: 80 };

interface GestureZoomItemProps extends PropsWithChildren {}

export const GestureZoom: FC<GestureZoomItemProps> = memo(({ children }) => {
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

  const zoomPointX = useSharedValue(0);
  const zoomPointY = useSharedValue(0);

  const resetState = () => {
    "worklet";
    scale.value = withSpring(1, bounceBackConfig);
    panTranslationX.value = withSpring(0, bounceBackConfig);
    panTranslationY.value = withSpring(0, bounceBackConfig);
    pinchTranslationX.value = withSpring(0, bounceBackConfig);
    pinchTranslationY.value = withSpring(0, bounceBackConfig);
    savedScale.value = 1;
    savedPanTranslationX.value = 0;
    savedPanTranslationY.value = 0;
    savedPinchTranslationX.value = 0;
    savedPinchTranslationY.value = 0;
    zoomPointX.value = 0;
    zoomPointY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      zoomPointX.value = e.focalX - HALF_WINDOW_WIDTH;
      zoomPointY.value = e.focalY - HALF_WINDOW_HEIGHT;
    })
    .onChange((e) => {
      const newScale = savedScale.value * e.scale;
      const scaleChange = newScale - savedScale.value;

      const x = savedPinchTranslationX.value + savedPanTranslationX.value;
      const y = savedPinchTranslationY.value + savedPanTranslationY.value;

      const offsetX = (zoomPointX.value - x) / savedScale.value;
      const offsetY = (zoomPointY.value - y) / savedScale.value;

      pinchTranslationX.value = -(offsetX * scaleChange) + savedPinchTranslationX.value;
      pinchTranslationY.value = -(offsetY * scaleChange) + savedPinchTranslationY.value;

      scale.value = newScale;
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
    .onEnd(() => {
      savedPanTranslationX.value = panTranslationX.value;
      savedPanTranslationY.value = panTranslationY.value;

      if (scale.value < 1) resetState();
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

  const composed = Gesture.Simultaneous(pinch, pan);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={composed}>
        <View style={styles.container}>
          <Animated.View style={[animatedStyle, { flex: 1 }]}>{children}</Animated.View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
