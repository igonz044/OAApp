import React, { useState, useEffect } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    sessionId?: string;
    goal?: string;
    sessionType?: string;
    isActiveSession?: string;
  }>();

  const isActiveSession = params.isActiveSession === 'true';
  const sessionGoal = params.goal || 'Wellness';
  const sessionType = params.sessionType || 'chat';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Initialize session-specific messages
  useEffect(() => {
    if (isActiveSession && !sessionStarted) {
      const sessionMessages: Message[] = [
        {
          id: '1',
          text: `Welcome to your ${sessionGoal} coaching session! I'm here to support you on your wellness journey.`,
          isUser: false,
          timestamp: new Date(),
        },
        {
          id: '2',
          text: `This is a ${sessionType === 'call' ? 'voice call' : 'text chat'} session. Let's begin by discussing your goals and any challenges you're facing.`,
          isUser: false,
          timestamp: new Date(),
        },
        {
          id: '3',
          text: `What would you like to focus on today?`,
          isUser: false,
          timestamp: new Date(),
        },
      ];
      setMessages(sessionMessages);
      setSessionStarted(true);
    } else if (!isActiveSession) {
      // Regular chat mode
      const regularMessages: Message[] = [
        {
          id: '1',
          text: "Hello! I'm here to help you with your wellness journey. What would you like to work on today?",
          isUser: false,
          timestamp: new Date(),
        },
        {
          id: '2',
          text: "I've been struggling with procrastination lately",
          isUser: true,
          timestamp: new Date(),
        },
        {
          id: '3',
          text: "I understand how challenging procrastination can be. Let's work together to identify some strategies that might help you. What specific tasks have you been putting off?",
          isUser: false,
          timestamp: new Date(),
        },
      ];
      setMessages(regularMessages);
    }
  }, [isActiveSession, sessionGoal, sessionType, sessionStarted]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Simulate AI response (in real app, this would call your AI API)
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: isActiveSession 
            ? "Thank you for sharing that. Let's explore this further together. What specific strategies have you tried before?"
            : "That's a great question! Let me help you work through that.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const SendIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <Path d="M22 2L11 13"/>
      <Path d="M22 2L15 22L11 13L2 9L22 2Z"/>
    </Svg>
  );

  const getChatTitle = () => {
    if (isActiveSession) {
      return `${sessionGoal} Session`;
    }
    return 'AI Wellness Coach';
  };

  const getSessionBadge = () => {
    if (isActiveSession) {
      return (
        <View style={styles.sessionBadge}>
          <Text style={styles.sessionBadgeText}>
            {sessionType === 'call' ? '📞 Voice Call' : '💬 Text Chat'}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.chatHeader}>
          <View style={styles.headerInfo}>
            <Text style={styles.chatTitle}>{getChatTitle()}</Text>
            {getSessionBadge()}
          </View>
          <TouchableOpacity 
            style={styles.chatToggle}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Text style={styles.chatToggleText}>
              {showHistory ? 'Hide History' : 'History'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.chatMessages}
          contentContainerStyle={styles.messagesContainer}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.message,
                message.isUser ? styles.messageUser : styles.messageAI,
              ]}
            >
              <Text style={[
                styles.messageText,
                message.isUser ? styles.messageTextUser : styles.messageTextAI,
              ]}>
                {message.text}
              </Text>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.chatInput}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#6B7280"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <SendIcon />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E2C58',
  },
  keyboardView: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 184, 221, 0.2)',
  },
  headerInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  chatTitle: {
    fontSize: 20,
    color: '#E0C68B',
    fontWeight: 'bold',
  },
  sessionBadge: {
    backgroundColor: '#E0C68B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 5,
  },
  sessionBadgeText: {
    color: '#2E2C58',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatToggle: {
    padding: 8,
  },
  chatToggleText: {
    color: '#C4B8DD',
    fontSize: 14,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContainer: {
    paddingVertical: 20,
  },
  message: {
    marginBottom: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  messageUser: {
    backgroundColor: '#E0C68B',
    alignSelf: 'flex-end',
  },
  messageAI: {
    backgroundColor: 'rgba(196, 184, 221, 0.2)',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#2E2C58',
  },
  messageTextAI: {
    color: '#F9F8F4',
  },
  chatInput: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(196, 184, 221, 0.2)',
    gap: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C4B8DD',
    borderRadius: 20,
    backgroundColor: '#F9F8F4',
    color: '#2E2C58',
    fontSize: 16,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#E0C68B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 