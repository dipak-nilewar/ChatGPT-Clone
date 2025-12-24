 import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const Loader = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#4f46e5" />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
});
