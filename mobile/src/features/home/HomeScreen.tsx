import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View>
      </View>
      <Text>Test 2</Text>
    </View>
  );
}
