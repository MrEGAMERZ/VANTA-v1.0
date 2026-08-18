import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  Map, LayoutDashboard, BarChart3, Users, Settings, LogOut, ShieldAlert
} from 'lucide-react';
import '../pages/Dashboard.css'; 
import { useToast } from '../components/Toast';

const MpLayout = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = () => {
    localStorage.clear();
    showToast('Session terminated.', 'success');
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
          <div 
            className="profile-avatar" 
            style={{ 
              backgroundImage: "url('https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Tejasvi')",
              backgroundSize: 'cover'
            }}
          ></div>
          <div className="profile-info">
            <h3>Tejasvi S.</h3>
            <p>MP COMMAND</p>
          </div>
        </div>

        <nav className="nav-menu">
          <div style={{ padding: '0 1.15rem 0.5rem 1.15rem', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            MP CONTROL SUITE
          </div>
          
          <NavLink to="/mp/overview" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>
          
          <NavLink to="/mp/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Map size={18} />
            <span>Live Map</span>
          </NavLink>
          
          <NavLink to="/mp/priority" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <BarChart3 size={18} />
            <span>Priority Ranker</span>
          </NavLink>
          
          <NavLink to="/mp/mlas" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={18} />
            <span>MLA Scoreboard</span>
          </NavLink>
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/official/dashboard" className="nav-item" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', color: '#8B9DFF', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
            <ShieldAlert size={18} />
            <span>Official Portal</span>
          </NavLink>
          <button 
            onClick={handleLogout} 
            className="nav-item" 
            style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
          >
            <LogOut size={18} />
            <span>Exit Command</span>
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
              Bengaluru South Constituency Command
            </span>
          </div>
          <div className="topbar-actions">
            <div className="pulse-indicator">
              <div className="pulse-dot"></div>
              <span>SYS_ONLINE</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MpLayout;
