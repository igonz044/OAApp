import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSessions } from '../../utils/sessionsContext';

export default function CoachScreen() {
  const { getUpcomingSessions, getCompletedSessions, deleteSession } = useSessions();
  const [showMenu, setShowMenu] = useState<string | null>(null); // Track which session's menu is open
  
  const upcomingSessions = getUpcomingSessions();
  const completedSessions = getCompletedSessions();

  const handleScheduleNewCoaching = () => {
    router.push('/goal-selection');
  };

  const handleJoinSession = (session: any) => {
    // Navigate to chat with session context
    router.push({
      pathname: '/(tabs)/chat',
      params: {
        sessionId: session.id,
        goal: session.goal,
        sessionType: session.sessionType,
        isActiveSession: 'true',
      },
    });
  };

  const handleDeleteSession = (session: any) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete your "${session.goal}" session on ${formatSessionTime(session)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSession(session.id);
            setShowMenu(null); // Close menu after deletion
          },
        },
      ]
    );
  };

  const toggleMenu = (sessionId: string) => {
    setShowMenu(showMenu === sessionId ? null : sessionId);
  };

  const canJoinSession = (session: any) => {
    const now = new Date();
    const sessionTime = session.fullDate;
    const timeDiff = sessionTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Can join 15 minutes before or up to 30 minutes after session start
    return minutesDiff >= -30 && minutesDiff <= 15;
  };

  const formatSessionTime = (session: any) => {
    const now = new Date();
    const sessionDate = session.fullDate;
    
    // Compare dates by day, not by exact time difference
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
    const diffTime = sessionDateOnly.getTime() - nowDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${session.time}`;
    } else if (diffDays === 1) {
      return `Tomorrow, ${session.time}`;
    } else if (diffDays < 7) {
      return `${sessionDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${session.time}`;
    } else {
      return `${sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${session.time}`;
    }
  };

  const formatCompletedTime = (session: any) => {
    const sessionDate = session.fullDate;
    const now = new Date();
    const diffTime = now.getTime() - sessionDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Yesterday, ${session.time}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago, ${session.time}`;
    } else {
      return `${sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${session.time}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={() => setShowMenu(null)}>
        <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Coaching Sessions</Text>
        </View>
        
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.btnPrimary} 
            onPress={handleScheduleNewCoaching}
          >
            <Text style={styles.btnPrimaryText}>Schedule New Wellness Coaching</Text>
          </TouchableOpacity>
          
          <View style={styles.coachSection}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTopic}>{session.goal}</Text>
                    <Text style={styles.sessionTime}>{formatSessionTime(session)}</Text>
                    <Text style={styles.sessionType}>
                      {session.sessionType === 'call' ? '📞 Voice Call' : '💬 Text Chat'}
                      {session.recurring !== 'none' && ` • ${session.recurring.charAt(0).toUpperCase() + session.recurring.slice(1)}`}
                    </Text>
                  </View>
                  
                  <View style={styles.sessionActions}>
                    {canJoinSession(session) && (
                      <TouchableOpacity 
                        style={styles.joinButton}
                        onPress={() => handleJoinSession(session)}
                      >
                        <Text style={styles.joinButtonText}>
                          {session.sessionType === 'call' ? 'Join Call' : 'Start Chat'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {/* Three-dot menu */}
                    <TouchableOpacity 
                      style={styles.menuButton}
                      onPress={() => toggleMenu(session.id)}
                    >
                      <Text style={styles.menuButtonText}>⋮</Text>
                    </TouchableOpacity>
                    
                    {/* Menu dropdown */}
                    {showMenu === session.id && (
                      <View style={styles.menuDropdown}>
                        <TouchableOpacity 
                          style={styles.menuOption}
                          onPress={() => handleDeleteSession(session)}
                        >
                          <Text style={styles.menuOptionText}>🗑️ Delete Session</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No upcoming sessions</Text>
                <Text style={styles.emptyStateSubtext}>Schedule your first coaching session to get started!</Text>
              </View>
            )}
          </View>
          
          <View style={styles.coachSection}>
            <Text style={styles.sectionTitle}>Previous Sessions</Text>
            {completedSessions.length > 0 ? (
              completedSessions.slice(0, 5).map((session) => (
                <View key={session.id} style={[styles.sessionCard, styles.completedSession]}>
                  <Text style={styles.sessionTopic}>{session.goal}</Text>
                  <Text style={styles.sessionTime}>{formatCompletedTime(session)}</Text>
                  <Text style={styles.sessionType}>
                    {session.sessionType === 'call' ? '📞 Voice Call' : '💬 Text Chat'}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No previous sessions</Text>
                <Text style={styles.emptyStateSubtext}>Your completed sessions will appear here</Text>
              </View>
            )}
          </View>
        </View>
        </ScrollView>
      </TouchableWithoutFeedback>
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
  coachSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#E0C68B',
    marginBottom: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sessionCard: {
    backgroundColor: 'rgba(196, 184, 221, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#E0C68B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(196, 184, 221, 0.2)',
  },
  menuButtonText: {
    fontSize: 18,
    color: '#C4B8DD',
    fontWeight: 'bold',
  },
  menuDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#2E2C58',
    borderWidth: 1,
    borderColor: '#C4B8DD',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  menuOptionText: {
    color: '#F9F8F4',
    fontSize: 14,
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
    marginBottom: 3,
  },
  sessionType: {
    color: '#C4B8DD',
    fontSize: 12,
    fontStyle: 'italic',
  },
  joinButton: {
    backgroundColor: '#E0C68B',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0C68B',
  },
  joinButtonText: {
    color: '#2E2C58',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedSession: {
    borderLeftColor: '#6B7280',
    opacity: 0.7,
  },
  emptyState: {
    backgroundColor: 'rgba(196, 184, 221, 0.05)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(196, 184, 221, 0.3)',
  },
  emptyStateText: {
    color: '#C4B8DD',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    color: '#C4B8DD',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  btnPrimary: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#E0C68B',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2C58',
    textAlign: 'center',
  },
}); 