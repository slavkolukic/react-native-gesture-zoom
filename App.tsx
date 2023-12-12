import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, Text, View } from "react-native";
import { GestureZoom } from "./components/GestureZoom";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <GestureZoom>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1702288135917-bcb48253d2eb?q=80&w=3136&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
