import { STRIPE_SIMPLE_CONFIG } from './stripeSimpleConfig';
import { authService } from './authService';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  conversation_id?: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  conversation_id?: string;
  error?: string;
  upgradeMessage?: string;
}

export interface SendMessageRequest {
  message: string;
  conversation_id?: string;
  sessionContext?: {
    goal?: string;
    sessionType?: string;
    sessionId?: string;
  };
}

class AIChatService {
  private baseUrl: string;
  private isDevelopmentMode: boolean = false;

  constructor() {
    this.baseUrl = STRIPE_SIMPLE_CONFIG.backendUrl;
    console.log('AI Chat Service initialized with base URL:', this.baseUrl);
  }

  // Helper function to make authenticated requests with token refresh
  private async makeAuthenticatedRequest(
    url: string, 
    options: RequestInit
  ): Promise<Response> {
    let accessToken = await authService.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available. Please log in.');
    }

    // First attempt with current token
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

          // If token is expired, try to refresh it
      if (response.status === 401) {
        console.log('Token expired, attempting to refresh...');
        const refreshResponse = await authService.refreshToken();
        
        if (refreshResponse.success && refreshResponse.accessToken) {
          // Retry with new token
          accessToken = refreshResponse.accessToken;
          response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${accessToken}`,
            },
          });
        } else {
          console.log('Token refresh failed, clearing tokens and redirecting to login');
          // Clear tokens and redirect to login
          await authService.logout();
          throw new Error('Session expired. Please log in again.');
        }
      }

    return response;
  }

  // Send a message to the AI
  async sendMessage(request: SendMessageRequest): Promise<ChatResponse> {
    console.log('Sending message to AI:', {
      message: request.message,
      conversation_id: request.conversation_id,
      sessionContext: request.sessionContext,
      baseUrl: this.baseUrl
    });

    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: request.message,
          conversation_id: request.conversation_id,
          sessionContext: request.sessionContext,
        }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', {
          status: response.status,
          statusText: response.statusText,
          contentType: contentType,
        });
        
        // Try to get the response text to see what we're actually getting
        const responseText = await response.text();
        console.error('Response text:', responseText);
        
        throw new Error(`Server returned non-JSON response (${response.status}): ${responseText.substring(0, 200)}`);
      }
      
      const data = await response.json();
      console.log('AI Chat API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Log the actual HTTP status
      console.log(`HTTP Status: ${response.status} ${response.statusText}`);
      console.log('Response Data:', JSON.stringify(data, null, 2));
      console.log('Available fields in response:', Object.keys(data));
      console.log('Response field values:', {
        response: data.response,
        message: data.message,
        conversation_id: data.conversation_id,
        success: data.success
      });

      if (!response.ok) {
        console.error('Backend error details:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          requestBody: JSON.stringify({
            message: request.message,
            conversation_id: request.conversation_id,
            sessionContext: request.sessionContext,
          })
        });
        console.error(`HTTP ${response.status} Error: ${response.statusText}`);
        
        // Check for specific error messages that should trigger upgrade flow
        const errorMessage = data.message || data.error || `HTTP ${response.status}: Failed to send message`;
        
        if (errorMessage.includes('Daily message limit reached') || 
            errorMessage.includes('limit reached') ||
            errorMessage.includes('subscription') ||
            errorMessage.includes('upgrade')) {
          return {
            success: false,
            error: 'UPGRADE_REQUIRED',
            upgradeMessage: data.upgrade_message || 'To continue chatting with your AI wellness coach, please upgrade to our premium plan.',
          };
        }
        
        throw new Error(errorMessage);
      }

      return {
        success: true,
        message: data.data?.ai_response || data.response || data.message,
        conversation_id: data.data?.conversation_id || data.conversation_id,
      };
    } catch (error) {
      console.error('AI Chat error:', error);
      console.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      // Check if it's a backend processing error
      if ((error as Error).message.includes('Failed to process message')) {
        return {
          success: false,
          error: 'Our AI service is temporarily unavailable. Please try again in a few minutes.',
        };
      }
      
      return {
        success: false,
        error: (error as Error).message || 'Failed to get AI response',
      };
    }
  }

  // Get user conversations
  async getConversations(limit: number = 20): Promise<Conversation[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/api/chat/conversations?limit=${limit}`, {
        method: 'GET',
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response in getConversations:', responseText);
        throw new Error(`Server returned non-JSON response (${response.status}): ${responseText.substring(0, 200)}`);
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get conversations');
      }

      return data.conversations || data.data || [];
    } catch (error) {
      console.error('Get conversations error:', error);
      return [];
    }
  }

  // Get conversation history
  async getConversationHistory(conversation_id: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/api/chat/conversations/${conversation_id}?limit=${limit}`, {
        method: 'GET',
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response in getConversationHistory:', responseText);
        throw new Error(`Server returned non-JSON response (${response.status}): ${responseText.substring(0, 200)}`);
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get conversation history');
      }

      const messages = data.messages || data.data || [];
      return messages.map((msg: any) => ({
        id: msg.id || msg._id,
        text: msg.text || msg.message,
        isUser: msg.isUser || msg.sender === 'user',
        timestamp: new Date(msg.timestamp || msg.createdAt),
        conversation_id: msg.conversation_id,
      }));
    } catch (error) {
      console.error('Get conversation history error:', error);
      return [];
    }
  }

  // Delete a conversation
  async deleteConversation(conversation_id: string): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/api/chat/conversations/${conversation_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete conversation');
      }

      return true;
    } catch (error) {
      console.error('Delete conversation error:', error);
      return false;
    }
  }

  // Create a new conversation (conversations are created automatically when sending first message)
  async createConversation(title?: string): Promise<string | null> {
    try {
      console.log('Creating conversation by sending initial message...');
      
      // Send an initial message to create the conversation
      const response = await this.sendMessage({
        message: 'Hello! I\'m here to help you with your wellness journey.',
        conversation_id: undefined, // No conversation_id means create new
      });

      if (response.success && response.conversation_id) {
        console.log('Conversation created with ID:', response.conversation_id);
        return response.conversation_id;
      } else {
        console.error('Failed to create conversation:', response.error || 'No conversation_id in response');
        console.log('Full response:', response);
        return null;
      }
    } catch (error) {
      console.error('Create conversation error:', error);
      return null;
    }
  }

  // Check if the chat service is healthy
  async checkHealth(): Promise<boolean> {
    try {
      console.log('Checking chat health at:', `${this.baseUrl}/api/chat/health`);
      const response = await fetch(`${this.baseUrl}/api/chat/health`, {
        method: 'GET',
      });
      console.log('Health check response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      return response.ok;
    } catch (error) {
      console.error('Chat health check error:', error);
      return false;
    }
  }

     // Debug function to test API connectivity
  async debugAPI(): Promise<void> {
    try {
      console.log('=== API Debug Start ===');
      console.log('Base URL:', this.baseUrl);
      
      // Test 1: Health check
      console.log('\n1. Testing health endpoint...');
      const healthResponse = await fetch(`${this.baseUrl}/api/chat/health`);
      console.log('Health Status:', healthResponse.status, healthResponse.statusText);
      console.log('Health Headers:', Object.fromEntries(healthResponse.headers.entries()));
      
      if (healthResponse.ok) {
        const healthText = await healthResponse.text();
        console.log('Health Response:', healthText.substring(0, 200));
      }
      
      // Test 2: Authentication
      console.log('\n2. Testing authentication...');
      const token = await authService.getAccessToken();
      console.log('Token exists:', !!token);
      if (token) {
        console.log('Token length:', token.length);
        console.log('Token preview:', token.substring(0, 50) + '...');
      }
      
      // Test 3: Chat endpoint
      console.log('\n3. Testing chat endpoint...');
      const chatResponse = await fetch(`${this.baseUrl}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          message: 'Test message'
        }),
      });
      
      console.log('Chat Status:', chatResponse.status, chatResponse.statusText);
      console.log('Chat Headers:', Object.fromEntries(chatResponse.headers.entries()));
      
      const chatText = await chatResponse.text();
      console.log('Chat Response Text:', chatText.substring(0, 500));
      
      console.log('=== API Debug End ===');
    } catch (error) {
      console.error('Debug error:', error);
    }
  }

  // Simple test function
  async simpleTest(): Promise<boolean> {
    try {
      console.log('Simple test starting...');
      
      // Check health
      const healthResponse = await fetch(`${this.baseUrl}/api/chat/health`);
      console.log('Health status:', healthResponse.status);
      
      if (!healthResponse.ok) {
        console.error('Health check failed');
        return false;
      }
      
      // Test authentication
      const token = await authService.getAccessToken();
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.error('No token available');
        return false;
      }
      
      // Test a simple chat request
      console.log('Testing chat endpoint...');
      const chatResponse = await this.makeAuthenticatedRequest(`${this.baseUrl}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello'
        }),
      });
      
      console.log('Chat response status:', chatResponse.status);
      
      if (chatResponse.ok) {
        // Check if response is JSON before parsing
        const contentType = chatResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await chatResponse.text();
          console.error('Non-JSON response in simpleTest:', responseText);
          return false;
        }
        
        const data = await chatResponse.json();
        console.log('Chat response data:', data);
        return true;
      } else {
        // Check if response is JSON before parsing
        const contentType = chatResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await chatResponse.text();
          console.error('Non-JSON error response in simpleTest:', responseText);
          return false;
        }
        
        const errorData = await chatResponse.json();
        console.log('Chat error:', errorData);
        return false;
      }
      
    } catch (error) {
      console.error('Simple test failed:', error);
      return false;
    }
  }
 }

 export const aiChatService = new AIChatService(); 