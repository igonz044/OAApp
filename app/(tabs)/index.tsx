import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useAuth } from '../../utils/authContext';
import { userActivityService } from '../../utils/userActivityService';
import { useSessions } from '../../utils/sessionsContext';
import { quotesService } from '../../utils/quotesService';

export default function HomeScreen() {
  const { user } = useAuth();
  const { getUpcomingSessions } = useSessions();
  const [daysActive, setDaysActive] = useState(0);
  const [upcomingSessionsCount, setUpcomingSessionsCount] = useState(0);
  const [todaysQuote, setTodaysQuote] = useState({ quote: '', author: '' });
  const [lastTopic, setLastTopic] = useState('');
  
  // Get user's first name, fallback to "there" if not available
  const userName = user?.first_name || 'there';

  // Track activity and load stats when component mounts
  useEffect(() => {
    const loadActivityData = async () => {
      // Track today's activity
      await userActivityService.trackActivity();
      
      // Load days active
      const days = await userActivityService.getDaysActive();
      setDaysActive(days);
    };

    loadActivityData();
  }, []);

  // Load today's quote when component mounts
  useEffect(() => {
    const loadTodaysQuote = async () => {
      const quote = await quotesService.getTodaysQuote();
      setTodaysQuote(quote);
    };

    loadTodaysQuote();
  }, []);

  // Update upcoming sessions count and last topic when sessions change
  useEffect(() => {
    const upcomingSessions = getUpcomingSessions();
    setUpcomingSessionsCount(upcomingSessions.length);
    
    // Get the most recently scheduled topic
    if (upcomingSessions.length > 0) {
      // Sort by creation date to get the most recent
      const sortedSessions = upcomingSessions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLastTopic(sortedSessions[0].goal);
    } else {
      setLastTopic('');
    }
  }, [getUpcomingSessions]);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi {userName}! 👋</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{daysActive}</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{upcomingSessionsCount}</Text>
              <Text style={styles.statLabel}>Upcoming Sessions</Text>
            </View>
          </View>
          
          {lastTopic && (
            <View style={styles.lastTopicCard}>
              <Text style={styles.lastTopicHeader}>🧘 Last Topic:</Text>
              <Text style={styles.lastTopicText}>{lastTopic}</Text>
            </View>
          )}
          
          <View style={styles.quoteCard}>
            <Text style={styles.quoteHeader}>✨ Tip of the Day ✨</Text>
            <Text style={styles.quoteText}>"{todaysQuote.quote}"</Text>
            <Text style={styles.quoteAuthor}>— {todaysQuote.author}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E2C58',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    color: '#E0C68B',
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0C68B',
    marginBottom: 5,
  },
  statLabel: {
    color: '#C4B8DD',
    fontSize: 14,
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E0C68B',
  },
  sessionTopic: {
    fontWeight: 'bold',
    color: '#F9F8F4',
    marginBottom: 5,
    fontSize: 16,
  },
  sessionTime: {
    color: '#C4B8DD',
    fontSize: 14,
  },
  quoteCard: {
    backgroundColor: 'rgba(224, 198, 139, 0.15)',
    padding: 25,
    borderRadius: 20,
    marginTop: 25,
    borderWidth: 2,
    borderColor: '#E0C68B',
    shadowColor: '#E0C68B',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  quoteHeader: {
    color: '#E0C68B',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 1,
  },
  quoteText: {
    color: '#F9F8F4',
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 28,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  quoteAuthor: {
    color: '#C4B8DD',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  lastTopicCard: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#C4B8DD',
  },
  lastTopicHeader: {
    color: '#C4B8DD',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  lastTopicText: {
    color: '#F9F8F4',
    fontSize: 16,
    fontWeight: '500',
  },
}); 