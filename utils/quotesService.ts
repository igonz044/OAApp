import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuoteData {
  quote: string;
  author: string;
  lastUpdated: string;
}

const INSPIRATIONAL_QUOTES = [
  {
    quote: "Your small habits today create your future.",
    author: "Unknown"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    quote: "The only limit to our realization of tomorrow is our doubts of today.",
    author: "Franklin D. Roosevelt"
  },
  {
    quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar"
  },
  {
    quote: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu"
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
  },
  {
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
  },
  {
    quote: "Every expert was once a beginner.",
    author: "Robert T. Kiyosaki"
  },
  {
    quote: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson"
  },
  {
    quote: "Small progress is still progress.",
    author: "Unknown"
  },
  {
    quote: "Your potential is limitless. Your success is inevitable.",
    author: "Unknown"
  }
];

export const quotesService = {
  // Get today's quote (changes every 24 hours)
  async getTodaysQuote(): Promise<{ quote: string; author: string }> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const storedData = await AsyncStorage.getItem('todaysQuote');
      
      if (storedData) {
        const data: QuoteData = JSON.parse(storedData);
        
        // If we have a quote from today, return it
        if (data.lastUpdated === today) {
          return {
            quote: data.quote,
            author: data.author
          };
        }
      }
      
      // If no quote for today or quote is old, generate a new one
      return await this.generateNewQuote(today);
    } catch (error) {
      console.error('Error getting today\'s quote:', error);
      // Return a default quote if there's an error
      return {
        quote: "Your small habits today create your future.",
        author: "Unknown"
      };
    }
  },

  // Generate a new quote for today
  async generateNewQuote(today: string): Promise<{ quote: string; author: string }> {
    try {
      // Use the date as a seed to ensure consistent quote for the day
      const dateSeed = new Date(today).getTime();
      const quoteIndex = Math.abs(dateSeed) % INSPIRATIONAL_QUOTES.length;
      const selectedQuote = INSPIRATIONAL_QUOTES[quoteIndex];
      
      // Store the quote for today
      const quoteData: QuoteData = {
        quote: selectedQuote.quote,
        author: selectedQuote.author,
        lastUpdated: today
      };
      
      await AsyncStorage.setItem('todaysQuote', JSON.stringify(quoteData));
      
      return {
        quote: selectedQuote.quote,
        author: selectedQuote.author
      };
    } catch (error) {
      console.error('Error generating new quote:', error);
      return {
        quote: "Your small habits today create your future.",
        author: "Unknown"
      };
    }
  },

  // Get all available quotes (for testing or future features)
  getAllQuotes(): Array<{ quote: string; author: string }> {
    return INSPIRATIONAL_QUOTES;
  },

  // Clear stored quote (useful for testing)
  async clearStoredQuote(): Promise<void> {
    try {
      await AsyncStorage.removeItem('todaysQuote');
    } catch (error) {
      console.error('Error clearing stored quote:', error);
    }
  }
}; 