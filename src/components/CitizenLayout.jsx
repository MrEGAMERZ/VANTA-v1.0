import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Folder, PlusSquare, BarChart2,
  Settings, HelpCircle, Shield, LogOut, UserCircle, Database
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import '../pages/Dashboard.css';

import { useToast } from './Toast';

const CitizenLayout = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profile, setProfile] = useState({ name: 'Citizen', id: 'UNKNOWN' });

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'Citizen User';
    const rawId = localStorage.getItem('user_id') || 'UNKNOWN';
    const id = rawId !== 'UNKNOWN' ? rawId.substring(0, 8).toUpperCase() : 'UNKNOWN';
    setProfile({ name, id });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    showToast('Logged out successfully.', 'success');
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar" style={{ backgroundColor: '#0B0B13', borderRight: '1px solid #161625' }}>
        <div className="brand" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={24} color="#6C63FF" />
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk' }}>SAMADHAN</span>
        </div>
        
        <nav className="nav-menu" style={{ marginTop: '1rem', flex: 1 }}>
          <NavLink to="/citizen/home" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={18} />
            Home
          </NavLink>
          <NavLink to="/citizen/issues" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Folder size={18} />
            My Issues
          </NavLink>
          <NavLink to="/citizen/file-report" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <PlusSquare size={18} />
            File Report
          </NavLink>
          <NavLink to="/citizen/analytics" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <BarChart2 size={18} />
            Analytics
          </NavLink>
          <NavLink to="/citizen/ledger" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Database size={18} />
            Public Ledger
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #161625', paddingTop: '1rem' }}>
          <nav className="nav-menu">
            <a href="#" className="nav-item">
              <Settings size={18} />
              Settings
            </a>
            <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>
              <LogOut size={18} />
              Sign Out
            </button>
          </nav>

          <div className="profile-snippet" style={{ marginTop: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#08080E' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1E1E35', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <UserIcon />
            </div>
            <div className="profile-info">
              <h3 style={{ fontSize: '0.875rem', color: 'white', fontWeight: 600 }}>{profile.name}</h3>
              <p style={{ color: '#8888AA', fontSize: '0.65rem', fontFamily: 'monospace' }}>CITIZEN_ID: {profile.id}</p>
            </div>
            <Settings size={14} color="#8888AA" style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => navigate('/citizen/profile')} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#08080E' }}>
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.15rem', fontFamily: 'Space Grotesk', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="#6C63FF" />
              SAMADHAN Citizen Portal
            </span>
          </div>
          <div className="topbar-actions">
            <div className="pulse-indicator">
              <div className="pulse-dot"></div>
              <span>SYS_ONLINE</span>
            </div>
            
            <NotificationBell />
            <UserCircle size={22} style={{ cursor: 'pointer' }} onClick={() => navigate('/citizen/profile')} />
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

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8888AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default CitizenLayout;
