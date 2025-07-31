import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';
import { userActivityService } from './userActivityService';

export interface CoachingSession {
  id: string;
  goal: string;
  date: string;
  time: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  sessionType: 'call' | 'chat';
  fullDate: Date;
  displayTime: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: Date;
}

interface SessionsContextType {
  sessions: CoachingSession[];
  addSession: (session: Omit<CoachingSession, 'id' | 'status' | 'createdAt'>) => void;
  updateSession: (id: string, updates: Partial<CoachingSession>) => void;
  deleteSession: (id: string) => void;
  getUpcomingSessions: () => CoachingSession[];
  getCompletedSessions: () => CoachingSession[];
  loadSessions: () => Promise<void>;
  cleanupOldSessions: () => void;
}

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

export const useSessions = () => {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionsProvider');
  }
  return context;
};

interface SessionsProviderProps {
  children: React.ReactNode;
}

export const SessionsProvider: React.FC<SessionsProviderProps> = ({ children }) => {
  const [sessions, setSessions] = useState<CoachingSession[]>([]);

  // Load sessions from AsyncStorage on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Clean up old sessions when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      cleanupOldSessions();
    }
  }, [sessions]);

  // Set up periodic cleanup (every hour)
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupOldSessions();
    }, 60 * 60 * 1000); // Run every hour

    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const storedSessions = await AsyncStorage.getItem('coaching_sessions');
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions).map((session: any) => ({
          ...session,
          fullDate: new Date(session.fullDate),
          createdAt: new Date(session.createdAt),
        }));
        setSessions(parsedSessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const saveSessions = async (newSessions: CoachingSession[]) => {
    try {
      await AsyncStorage.setItem('coaching_sessions', JSON.stringify(newSessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  };

  const addSession = async (sessionData: Omit<CoachingSession, 'id' | 'status' | 'createdAt'>) => {
    const newSession: CoachingSession = {
      ...sessionData,
      id: Date.now().toString(),
      status: 'upcoming',
      createdAt: new Date(),
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    saveSessions(updatedSessions);

    // Schedule notifications for the new session
    try {
      await notificationService.scheduleSessionNotifications(newSession);
      console.log('Notifications scheduled for new session');
    } catch (error) {
      console.error('Error scheduling notifications for session:', error);
    }
  };

  const updateSession = (id: string, updates: Partial<CoachingSession>) => {
    const updatedSessions = sessions.map(session =>
      session.id === id ? { ...session, ...updates } : session
    );
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const deleteSession = async (id: string) => {
    const updatedSessions = sessions.filter(session => session.id !== id);
    setSessions(updatedSessions);
    saveSessions(updatedSessions);

    // Cancel notifications for the deleted session
    try {
      await notificationService.cancelSessionNotifications(id);
      console.log('Notifications cancelled for deleted session');
    } catch (error) {
      console.error('Error cancelling notifications for session:', error);
    }
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions
      .filter(session => session.status === 'upcoming' && session.fullDate > now)
      .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
  };

  const getCompletedSessions = () => {
    const now = new Date();
    return sessions
      .filter(session => 
        session.status === 'completed' || 
        (session.status === 'upcoming' && session.fullDate < now)
      )
      .sort((a, b) => b.fullDate.getTime() - a.fullDate.getTime());
  };

  // Clean up sessions older than 7 days and mark past sessions as completed
  const cleanupOldSessions = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    let sessionsChanged = false;
    let sessionsToKeep = sessions;
    let newlyCompletedSessions = 0;
    
    // First, mark past sessions as completed
    const updatedSessions = sessions.map(session => {
      if (session.status === 'upcoming' && session.fullDate < now) {
        sessionsChanged = true;
        newlyCompletedSessions++;
        return { ...session, status: 'completed' as const };
      }
      return session;
    });
    
    // Then, remove sessions older than 7 days
    sessionsToKeep = updatedSessions.filter(session => {
      // Keep upcoming sessions
      if (session.status === 'upcoming' && session.fullDate > now) {
        return true;
      }
      
      // Keep completed sessions that are less than 7 days old
      if (session.status === 'completed' && session.fullDate > sevenDaysAgo) {
        return true;
      }
      
      return false;
    });

    if (sessionsChanged || sessionsToKeep.length !== sessions.length) {
      const deletedCount = sessions.length - sessionsToKeep.length;
      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} old sessions`);
      }
      
      // Increment session count for newly completed sessions
      if (newlyCompletedSessions > 0) {
        for (let i = 0; i < newlyCompletedSessions; i++) {
          userActivityService.incrementSessionCount();
        }
        console.log(`Marked ${newlyCompletedSessions} sessions as completed`);
      }
      
      setSessions(sessionsToKeep);
      saveSessions(sessionsToKeep);
    }
  };

  const value: SessionsContextType = {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    getUpcomingSessions,
    getCompletedSessions,
    loadSessions,
    cleanupOldSessions,
  };

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  );
}; 