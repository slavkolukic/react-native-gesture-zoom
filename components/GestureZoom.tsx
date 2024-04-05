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

const HALF_WINDOW_WIDTH = WINDOW_WIDTH / 2;
const HALF_WINDOW_HEIGHT = WINDOW_HEIGHT / 2;

const MAX_ALLOWED_SCALE = 5;

interface PreviewMediaListItemImageProps extends PropsWithChildren {}

export const GestureZoom: FC<PreviewMediaListItemImageProps> = memo(({ children }) => {
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
    savedScale.value = 1;
    panTranslationX.value = withSpring(0, bounceBackConfig);
    panTranslationY.value = withSpring(0, bounceBackConfig);
    savedPanTranslationX.value = 0;
    savedPanTranslationY.value = 0;
    pinchTranslationX.value = withSpring(0, bounceBackConfig);
    pinchTranslationY.value = withSpring(0, bounceBackConfig);
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

      const offsetX = (zoomPointX.value - savedPinchTranslationX.value) / savedScale.value;
      const offsetY = (zoomPointY.value - savedPinchTranslationY.value) / savedScale.value;

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

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: 1,
    borderColor: "cyan",
    transform: [
      { translateX: pinchTranslationX.value },
      { translateY: pinchTranslationY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={pinch}>
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
