import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/ExpensesPage';
import Budgets from './pages/Budgets';
import Cards from './pages/CardsPage';
import Profile from './pages/Profile';
import AppNavbar from './components/AppNavbar';
import './App.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <AppNavbar />}
      <div className="app-container">
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
          <Route path="/budgets"  element={<PrivateRoute><Budgets /></PrivateRoute>} />
          <Route path="/cards"    element={<PrivateRoute><Cards /></PrivateRoute>} />
        </Routes>
      </div>
    </>
  );
}

export default App;
