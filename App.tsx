import { Image, StyleSheet, View } from "react-native";
import { GestureZoom } from "./components/GestureZoom";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <GestureZoom>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1712290403808-2589bc83b4c6?q=80&w=2752&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          }}
          style={styles.container}
        />
      </GestureZoom>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",

    alignItems: "center",
    justifyContent: "center",
  },
});
