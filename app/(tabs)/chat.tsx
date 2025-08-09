import React, { useState, useEffect, useRef } from 'react';
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
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { aiChatService, ChatMessage } from '../../utils/aiChatService';
import { usePayment } from '../../utils/paymentContext';
import { useConversation } from '../../utils/conversationContext';
import { freeTrialService } from '../../utils/freeTrialService';

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

  const { subscriptionStatus } = usePayment();
  const { 
    currentConversationId, 
    createNewConversation, 
    loadConversationHistory,
    addMessageToCurrentConversation 
  } = useConversation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [freeTrialStatus, setFreeTrialStatus] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize session-specific messages
  useEffect(() => {
    const initializeChat = async () => {
      // Check if chat service is healthy
      const isHealthy = await aiChatService.checkHealth();
      if (!isHealthy) {
        console.warn('Chat service is not healthy');
      }

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
        ];
        setMessages(regularMessages);
      }
    };

    initializeChat();
    
    // Load free trial status
    const loadFreeTrialStatus = async () => {
      if (!subscriptionStatus?.isActive) {
        const status = await freeTrialService.getFreeTrialStatus();
        setFreeTrialStatus(status);
      }
    };
    loadFreeTrialStatus();
  }, [isActiveSession, sessionGoal, sessionType, sessionStarted, subscriptionStatus]);

  // Debug: Monitor messages changes
  useEffect(() => {
    console.log('Messages state updated:', messages.length, 'messages');
    messages.forEach((msg, index) => {
      console.log(`Message ${index}:`, msg.text.substring(0, 50) + '...', 'isUser:', msg.isUser);
    });
  }, [messages]);

  const sendMessage = async () => {
    if (inputText.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setIsLoading(true);

      try {
        // Check subscription status first
        if (!subscriptionStatus?.isActive) {
          // Check if user is on free trial
          const isOnFreeTrial = await freeTrialService.isOnFreeTrial();
          
          if (!isOnFreeTrial) {
            Alert.alert(
              'Subscription Required',
              'You need an active subscription to use the AI chat. Please upgrade your plan.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Upgrade', onPress: () => router.push('/paywall') }
              ]
            );
            return;
          }
          
          // Check daily message limit for free trial users
          const isLimitReached = await freeTrialService.isDailyLimitReached();
          if (isLimitReached) {
            Alert.alert(
              'Daily Limit Reached',
              'You have reached your daily limit of 10 messages. Please upgrade to continue chatting.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Upgrade', onPress: () => router.push('/paywall') }
              ]
            );
            return;
          }
          
          // Increment message count for free trial users
          await freeTrialService.incrementMessageCount();
        }

        // Create conversation if needed
        // For the first message, we don't need a conversation_id - it will be created automatically
        let conversationId = currentConversationId;
        // Only create a new conversation if we're not in an active session
        if (!conversationId && !isActiveSession) {
          conversationId = await createNewConversation();
          if (!conversationId) {
            // Show upgrade message instead of error
            const upgradeMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: "I'd love to help you with your wellness journey! To continue our conversation, please upgrade to our premium plan for unlimited access to personalized coaching.",
              isUser: false,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, upgradeMessage]);
            
            // Show upgrade alert
            Alert.alert(
              'Upgrade Required',
              'To continue chatting with your AI wellness coach, please upgrade to our premium plan.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Upgrade', onPress: () => router.push('/paywall') }
              ]
            );
            return;
          }
        }

        console.log('Sending message to AI...');
        const response = await aiChatService.sendMessage({
          message: userMessage.text,
          conversation_id: conversationId || undefined,
          sessionContext: isActiveSession ? {
            goal: sessionGoal,
            sessionType: sessionType,
            sessionId: params.sessionId,
          } : undefined,
        });
        
        console.log('AI Response received:', {
          success: response.success,
          message: response.message,
          error: response.error,
          conversation_id: response.conversation_id
        });
        
        // Debug: Check if we have a valid message
        if (response.success && response.message) {
          console.log('✅ Valid AI response found:', response.message.substring(0, 100) + '...');
        } else {
          console.log('❌ No valid AI response:', response);
        }

        if (response.success && response.message) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response.message,
            isUser: false,
            timestamp: new Date(),
          };
          
          console.log('Adding AI message to chat:', aiMessage);
          setMessages(prev => {
            const newMessages = [...prev, aiMessage];
            console.log('Updated messages count:', newMessages.length);
            return newMessages;
          });
          
          // Add messages to conversation context
          addMessageToCurrentConversation(userMessage);
          addMessageToCurrentConversation(aiMessage);
          
          // Update free trial status after successful message
          if (!subscriptionStatus?.isActive) {
            const updatedStatus = await freeTrialService.getFreeTrialStatus();
            setFreeTrialStatus(updatedStatus);
          }
        } else {
          // Check if it's an upgrade required error
          if (response.error === 'UPGRADE_REQUIRED') {
            const upgradeMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: response.upgradeMessage || "I'd love to help you with your wellness journey! To continue our conversation, please upgrade to our premium plan for unlimited access to personalized coaching.",
              isUser: false,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, upgradeMessage]);
            
            // Show upgrade alert
            Alert.alert(
              'Upgrade Required',
              response.upgradeMessage || 'To continue chatting with your AI wellness coach, please upgrade to our premium plan.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Upgrade', onPress: () => router.push('/paywall') }
              ]
            );
          } else {
            // Show upgrade message instead of error
            const upgradeMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: "I'd love to help you with your wellness journey! To continue our conversation, please upgrade to our premium plan for unlimited access to personalized coaching.",
              isUser: false,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, upgradeMessage]);
            
            // Show upgrade alert
            Alert.alert(
              'Upgrade Required',
              'To continue chatting with your AI wellness coach, please upgrade to our premium plan.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Upgrade', onPress: () => router.push('/paywall') }
              ]
            );
          }
        }
      } catch (error) {
        console.error('Send message error:', error);
        // Show upgrade message instead of error
        const upgradeMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'd love to help you with your wellness journey! To continue our conversation, please upgrade to our premium plan for unlimited access to personalized coaching.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, upgradeMessage]);
        
        // Show upgrade alert
        Alert.alert(
          'Upgrade Required',
          'To continue chatting with your AI wellness coach, please upgrade to our premium plan.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/paywall') }
          ]
        );
      } finally {
        setIsLoading(false);
      }
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
            {freeTrialStatus?.isActive && (
              <View style={styles.freeTrialBadge}>
                <Text style={styles.freeTrialText}>
                  Free Trial: {freeTrialStatus.messagesUsedToday}/{freeTrialStatus.dailyLimit} messages
                </Text>
              </View>
            )}
          </View>

        </View>
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatMessages}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
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
          
          {isLoading && (
            <View style={[styles.message, styles.messageAI]}>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#E0C68B" />
                <Text style={[styles.messageText, styles.messageTextAI, styles.typingText]}>
                  AI is typing...
                </Text>
              </View>
            </View>
          )}
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
          <TouchableOpacity 
            style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]} 
            onPress={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#2E2C58" />
            ) : (
            <SendIcon />
            )}
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
  freeTrialBadge: {
    backgroundColor: '#E0C68B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 5,
  },
  freeTrialText: {
    color: '#2E2C58',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontStyle: 'italic',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
}); 