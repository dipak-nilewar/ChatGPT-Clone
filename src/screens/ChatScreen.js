 
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';

import ChatBubble from '../components/ChatBubble';
import Loader from '../components/Loader';
import { sendMessageToGroq } from '../services/groqApi';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as DocumentPicker from 'react-native-document-picker';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Voice from '@react-native-voice/voice';
import { NativeModules } from 'react-native';

import { lightTheme, darkTheme } from '../theme/colors';

// VOICE SAFE FALLBACK
const rnVoice =
  Voice && typeof Voice === 'object'
    ? Voice
    : {
        start: async () => {},
        stop: async () => {},
        destroy: async () => {},
        removeAllListeners: () => {},
      };

const ChatScreen = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [model, setModel] = useState('llama3-8b');

  const theme = darkMode ? darkTheme : lightTheme;

  const flatListRef = useRef(null);

  // VOICE
  useEffect(() => {
    try {
      rnVoice.onSpeechResults = e => {
        if (e.value?.length) setInput(e.value[0]);
      };
      rnVoice.onSpeechError = () => setIsRecording(false);
    } catch {}

    return () => {
      try {
        rnVoice.destroy();
        rnVoice.removeAllListeners();
      } catch {}
    };
  }, []);

  const startRecording = async () => {
    if (!NativeModules?.Voice) return;
    setIsRecording(true);
    await rnVoice.start('en-US');
  };

  const stopRecording = async () => {
    await rnVoice.stop();
    setIsRecording(false);
  };

  // SEND MESSAGE
  const handleSend = async () => {
    if (!input.trim()) return;

    const updated = [...messages, { role: 'user', content: input }];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await sendMessageToGroq(
        updated.map(m => ({ role: m.role, content: m.content })),
        model,
      );
      setMessages([...updated, { role: 'assistant', content: res }]);
    } catch {
      Alert.alert('Error', 'AI response failed');
    }
    setLoading(false);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // ATTACHMENTS
  const openCamera = async () => {
    setMenuVisible(false);
    const res = await launchCamera({ mediaType: 'photo' });
    if (res.assets) addAttachment(res.assets[0].uri, 'camera');
  };

  const pickImage = async () => {
    setMenuVisible(false);
    const res = await launchImageLibrary({ mediaType: 'photo' });
    if (res.assets) addAttachment(res.assets[0].uri, 'image');
  };

  const pickFile = async () => {
    setMenuVisible(false);
    try {
      const file = await DocumentPicker.pickSingle();
      addAttachment(file, 'file');
    } catch {}
  };

  const addAttachment = (data, type) => {
    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        content: type === 'file' ? '📎 File attached' : '📷 Photo attached',
        image: type !== 'file' ? data : null,
        file: type === 'file' ? data : null,
      },
    ]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Keyboard listener for Android
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
          <TouchableOpacity onPress={() => setOptionsVisible(true)}>
            <Icon name="more-vert" size={26} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: theme.text }]}>ChatGPT Clone</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <ChatBubble
              message={item.content}
              isUser={item.role === 'user'}
              image={item.image}
              file={item.file}
              darkMode={darkMode}
            />
          )}
          contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {loading && <Loader />}

        {/* INPUT */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.iconBg }]}
            onPress={() => setMenuVisible(true)}
          >
            <Icon name="add" size={28} color={theme.text} />
          </TouchableOpacity>

          <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Ask anything..."
              placeholderTextColor={theme.placeholder}
              value={input}
              onChangeText={setInput}
              multiline
            />

            <TouchableOpacity
              style={[styles.rightIcon, { backgroundColor: theme.sendBtn }]}
              onPress={
                input.trim()
                  ? handleSend
                  : isRecording
                  ? stopRecording
                  : startRecording
              }
            >
              <Icon
                name={input.trim() ? 'send' : isRecording ? 'stop' : 'mic'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ATTACHMENT MENU (BOTTOM SHEET) */}
        <Modal transparent visible={menuVisible} animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setMenuVisible(false)}
          >
            <View style={[styles.bottomMenu, { backgroundColor: theme.menuBg }]}>
              <TouchableOpacity style={styles.menuItem} onPress={openCamera}>
                <Icon name="camera-alt" size={24} color={theme.text} />
                <Text style={[styles.menuText, { color: theme.text }]}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={pickImage}>
                <Icon name="photo" size={24} color={theme.text} />
                <Text style={[styles.menuText, { color: theme.text }]}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={pickFile}>
                <Icon name="attach-file" size={24} color={theme.text} />
                <Text style={[styles.menuText, { color: theme.text }]}>File</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* THREE DOT MENU */}
        <Modal transparent visible={optionsVisible} animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setOptionsVisible(false)}
          >
            <View style={[styles.menu, { backgroundColor: theme.menuBg }]}>
              <View style={styles.optionRow}>
                <Text style={{ color: theme.text }}>Dark Mode</Text>
                <Switch value={darkMode} onValueChange={setDarkMode} />
              </View>

              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setMessages([])}
              >
                <Text style={{ color: theme.text }}>Clear Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionRow}
                onPress={() =>
                  setModel(model === 'llama3-8b' ? 'mixtral' : 'llama3-8b')
                }
              >
                <Text style={{ color: theme.text }}>Model: {model}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 30,
  },

  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },

  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 10,
  },

  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 10,
    minHeight: 40,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
  },

  rightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  menu: {
    position: 'absolute',
    top: 70,
    left: 10,
    padding: 12,
    borderRadius: 10,
    elevation: 5,
  },

  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  menuText: {
    marginLeft: 10,
    fontSize: 16,
  },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
});
