import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">PrimeTrade</span>
      {user && (
        <>
          <span className="navbar-user">
            {user.name}
            <span className={`badge ${user.role}`}>{user.role}</span>
          </span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
}
