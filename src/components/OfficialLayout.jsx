import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  UserCircle, LayoutDashboard, Map, 
  AlertTriangle, BarChart2, Archive, Settings, LogOut, ShieldAlert
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import '../pages/Dashboard.css';

import { useToast } from './Toast';

const OfficialLayout = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profile, setProfile] = useState({ name: 'Representative', role: 'Official' });

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'Hon. Representative';
    const role = localStorage.getItem('user_role') || 'District Office';
    setProfile({ name, role });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    showToast('Logged out successfully.', 'success');
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span>SAMADHAN</span>
        </div>

        <div className="profile-snippet" onClick={() => navigate('/official/profile')} style={{ cursor: 'pointer' }}>
          <div className="profile-avatar"></div>
          <div className="profile-info">
            <h3>{profile.name}</h3>
            <p>{profile.role}</p>
          </div>
        </div>

        <nav className="nav-menu">
          <NavLink to="/official/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/official/constituency" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Map size={18} />
            Constituency Map
          </NavLink>
          <NavLink to="/official/escalations" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <AlertTriangle size={18} />
            Escalated Items
          </NavLink>
          <NavLink to="/official/analytics" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <BarChart2 size={18} />
            AI Intelligence
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {profile.role === 'MLA' && (
            <NavLink to="/mla/dashboard" className="nav-item" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', color: '#8B9DFF', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
              <UserCircle size={18} />
              Switch to MLA Portal
            </NavLink>
          )}
          {profile.role === 'MP' && (
            <NavLink to="/mp/overview" className="nav-item" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', color: '#8B9DFF', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
              <UserCircle size={18} />
              Switch to MP Portal
            </NavLink>
          )}
          <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
            <LogOut size={18} />
            Exit Command
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.15rem', fontFamily: 'Space Grotesk', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#6366F1" />
              SAMADHAN Governance Suite
            </span>
          </div>
          <div className="topbar-actions">
            <div className="pulse-indicator">
              <div className="pulse-dot"></div>
              <span>SYS_ONLINE</span>
            </div>
            
            <NotificationBell />
            <UserCircle size={22} style={{ cursor: 'pointer' }} onClick={() => navigate('/official/profile')} />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OfficialLayout;
