import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { aiChatService, ChatMessage, Conversation } from './aiChatService';
import { useAuth } from './authContext';

interface ConversationContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  createNewConversation: () => Promise<string | null>;
  loadConversations: () => Promise<void>;
  loadConversationHistory: (conversationId: string) => Promise<ChatMessage[]>;
  deleteConversation: (conversationId: string) => Promise<boolean>;
  setCurrentConversation: (conversationId: string | null) => void;
  addMessageToCurrentConversation: (message: ChatMessage) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load conversations when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const conversations = await aiChatService.getConversations();
      setConversations(conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (): Promise<string | null> => {
    try {
      const conversationId = await aiChatService.createConversation('New Conversation');
      if (conversationId) {
        setCurrentConversationId(conversationId);
        // Reload conversations to include the new one
        await loadConversations();
      }
      return conversationId;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  };

  const loadConversationHistory = async (conversationId: string): Promise<ChatMessage[]> => {
    try {
      return await aiChatService.getConversationHistory(conversationId);
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      return [];
    }
  };

  const deleteConversation = async (conversationId: string): Promise<boolean> => {
    try {
      const success = await aiChatService.deleteConversation(conversationId);
      if (success) {
        // Remove from local state
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        // If this was the current conversation, clear it
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null);
        }
      }
      return success;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return false;
    }
  };

  const setCurrentConversation = (conversationId: string | null) => {
    setCurrentConversationId(conversationId);
  };

  const addMessageToCurrentConversation = (message: ChatMessage) => {
    // This would typically update the conversation in the backend
    // For now, we'll just log it
    console.log('Message added to conversation:', message);
  };

  const value: ConversationContextType = {
    conversations,
    currentConversationId,
    isLoading,
    createNewConversation,
    loadConversations,
    loadConversationHistory,
    deleteConversation,
    setCurrentConversation,
    addMessageToCurrentConversation,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = (): ConversationContextType => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}; 