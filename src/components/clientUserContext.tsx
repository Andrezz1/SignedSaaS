import React, { createContext, useContext, useState, useEffect } from 'react';

type ClientUserContextType = {
  userId: number | null;
};

const ClientUserContext = createContext<ClientUserContextType>({ userId: null });

export const useClientUser = () => useContext(ClientUserContext);

export const ClientUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userId');
    if (stored) {
      setUserId(Number(stored));
    }
  }, []);

  return (
    <ClientUserContext.Provider value={{ userId }}>
      {children}
    </ClientUserContext.Provider>
  );
};
