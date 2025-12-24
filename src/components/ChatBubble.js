 import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const ChatBubble = ({ message, isUser, image, file }) => {
  return (
    <View style={[styles.bubble, isUser ? styles.user : styles.ai]}>
      {image && <Image source={{ uri: image }} style={styles.image} />}

      {file && <Text style={styles.file}>📎 {file.name}</Text>}

      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

export default ChatBubble;

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "80%",
    padding: 10,
    marginVertical: 6,
    borderRadius: 10,
  },
  user: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  ai: {
    backgroundColor: "#EAEAEA",
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 5,
  },
  file: {
    fontSize: 14,
    marginBottom: 5,
  },
});
