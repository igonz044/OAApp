import React, { createContext, useContext, useState } from 'react';

export interface SessionData {
  goal: string;
  date: string;
  time: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  sessionType: 'call' | 'chat';
  fullDate?: Date;
  displayTime?: string;
}

interface SessionContextType {
  sessionData: SessionData | null;
  setSessionData: (data: SessionData) => void;
  clearSessionData: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [sessionData, setSessionDataState] = useState<SessionData | null>(null);

  const setSessionData = (data: SessionData) => {
    setSessionDataState(data);
  };

  const clearSessionData = () => {
    setSessionDataState(null);
  };

  const value: SessionContextType = {
    sessionData,
    setSessionData,
    clearSessionData,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}; 