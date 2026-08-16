import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Bell, UserCircle, LayoutDashboard, Settings, Filter
} from 'lucide-react';
import '../pages/Dashboard.css'; // Reusing standard layout styling

const MlaLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          SAMADHAN GOV
        </div>
        
        <div 
          className="profile-snippet" 
          onClick={() => navigate('/official/profile')}
          style={{ marginTop: '1rem', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}
        >
          <div className="profile-info">
            <h3 style={{ fontSize: '1rem', color: 'white' }}>MLA Suresh K.</h3>
            <p style={{ color: 'var(--text-muted)' }}>Ward 7–12 Administrator</p>
          </div>
        </div>

        <nav className="nav-menu" style={{ marginTop: '2rem' }}>
          <NavLink to="/mla/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Filter size={18} />
            Issue Feed
          </NavLink>
          <NavLink to="/mla/performance" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={18} />
            Performance
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/official/dashboard" className="nav-item" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <LayoutDashboard size={18} />
            Switch to Official Portal
          </NavLink>
          <a href="#" className="nav-item">
            <Settings size={18} />
            System Settings
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header className="topbar" style={{ backgroundColor: '#08080E', borderBottom: '1px solid #1E1E35' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk' }}>SAMADHAN</span>
          </div>
          <div className="topbar-actions">
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="var(--text-muted)" />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: '#F87171', borderRadius: '50%' }}></div>
            </div>
            <UserCircle size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => navigate('/official/profile')} />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#08080E' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MlaLayout;
