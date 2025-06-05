import React, { createContext, useContext, useState, useEffect } from 'react';

type ClientUserContextType = {
  userId: number | null;
  token: string | null;
  setUserData: (id: number, token: string) => void;
  clearUserData: () => void;
  loading: boolean;
};

const ClientUserContext = createContext<ClientUserContextType>({
  userId: null,
  token: null,
  setUserData: () => {},
  clearUserData: () => {},
  loading: true,
});

export const useClientUser = () => useContext(ClientUserContext);

export const ClientUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const storedId = localStorage.getItem('userId');
  const storedToken = localStorage.getItem('authToken');

  if (userId === null && storedId) setUserId(Number(storedId));
  if (token === null && storedToken) setToken(storedToken);

  setLoading(false);
  }, []);


  const setUserData = (id: number, token: string) => {
  console.log('[setUserData] Atualizando ID e token', id, token);

  localStorage.setItem('userId', String(id));
  localStorage.setItem('authToken', token);

  setUserId(id);
  setToken(token);
  };


  const clearUserData = () => {
    setUserId(null);
    setToken(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken');
  };

  return (
    <ClientUserContext.Provider value={{ userId, token, setUserData, clearUserData, loading }}>
      {children}
    </ClientUserContext.Provider>
  );
};
