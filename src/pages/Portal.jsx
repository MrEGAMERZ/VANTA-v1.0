import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield } from 'lucide-react';

const Portal = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4rem' }}>
        
        <div className="portal-card citizen" onClick={() => navigate('/login/citizen')}>
          <div className="icon-wrapper">
            <User size={32} />
          </div>
          <h2>I&apos;m a Citizen</h2>
          <p>Report a problem in your area</p>
          <div className="card-link">
            Report an Issue &rarr;
          </div>
        </div>

        <div className="portal-card official" onClick={() => navigate('/login/official')}>
          <div className="icon-wrapper">
            <Shield size={32} />
          </div>
          <h2>I&apos;m an Official</h2>
          <p>Access your governance dashboard</p>
          <div className="card-link">
            Sign In &rarr;
          </div>
        </div>

      </div>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', letterSpacing: '-0.05em' }}>
          SAMADHAN
        </h1>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Engineered in the dark. Built to last.
        </p>
      </div>
    </div>
  );
};

export default Portal;
