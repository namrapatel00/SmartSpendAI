import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name  = localStorage.getItem('name');
    const id    = localStorage.getItem('userId');
    if (token && name) setUser({ token, name, id: parseInt(id) });
  }, []);

  const loginUser = ({ token, name, userId }) => {
    localStorage.setItem('token',  token);
    localStorage.setItem('name',   name);
    localStorage.setItem('userId', userId);
    setUser({ token, name, id: userId });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
