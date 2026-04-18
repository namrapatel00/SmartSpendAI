import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <span className="nav-logo">SmartSpend AI</span>
        <div className="nav-links">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/expenses">Expenses</NavLink>
          <NavLink to="/budgets">Budgets</NavLink>
          <NavLink to="/cards">Cards</NavLink>
        </div>
        <div className="nav-right">
          <NavLink to="/profile" className="nav-user-btn">{user?.name}</NavLink>
          <button className="btn btn-sm btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
