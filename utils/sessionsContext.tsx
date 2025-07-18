import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const addSession = (sessionData: Omit<CoachingSession, 'id' | 'status' | 'createdAt'>) => {
    const newSession: CoachingSession = {
      ...sessionData,
      id: Date.now().toString(),
      status: 'upcoming',
      createdAt: new Date(),
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const updateSession = (id: string, updates: Partial<CoachingSession>) => {
    const updatedSessions = sessions.map(session =>
      session.id === id ? { ...session, ...updates } : session
    );
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const deleteSession = (id: string) => {
    const updatedSessions = sessions.filter(session => session.id !== id);
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
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

  const value: SessionsContextType = {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    getUpcomingSessions,
    getCompletedSessions,
    loadSessions,
  };

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  );
}; 