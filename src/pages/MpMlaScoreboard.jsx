import React from 'react';
import { ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react';
import '../pages/Dashboard.css';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const MpMlaScoreboard = () => {
  const { showToast } = useToast();
  const [scoreboard, setScoreboard] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchScoreboard = async () => {
      try {
        const data = await api.getMlaScoreboard();
        setScoreboard(data);
      } catch (err) {
        console.error('Failed to load scoreboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScoreboard();
  }, []);

  if (loading) {
    return (
      <div style={{ color: 'white', padding: '3rem', fontFamily: 'Space Grotesk', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>COLLECTING LEAGUE INTELLIGENCE...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-body" style={{ backgroundColor: 'transparent' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div className="page-title">
            <h1 style={{ fontFamily: 'Space Grotesk', textTransform: 'uppercase' }}>
              MLA ACCOUNTABILITY SCOREBOARD
            </h1>
          </div>
          <div className="system-status">
            TRACKING TIER 1 RESPONSE METRICS // BENGALURU SOUTH JURISDICTIONS
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="queue-section">
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', letterSpacing: '0.05em', color: 'white' }}>MLA TELEMETRY LEAGUE</h2>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>OFFICIAL / WARD SECTOR</th>
              <th>ACCOUNTABILITY SCORE</th>
              <th>RESOLUTION RATE</th>
              <th>AVG RESPONSE TIME</th>
              <th style={{ textAlign: 'right' }}>ESCALATED TICKETS</th>
            </tr>
          </thead>
          <tbody>
            {scoreboard.map(mla => {
              const isRed = mla.accountability_score < 60;
              const isYellow = mla.accountability_score >= 60 && mla.accountability_score < 80;
              
              let scoreColor = 'var(--cyber-emerald)';
              let scoreGlow = 'rgba(16, 185, 129, 0.15)';
              if (isRed) {
                scoreColor = 'var(--cyber-rose)';
                scoreGlow = 'rgba(239, 68, 68, 0.2)';
              } else if (isYellow) {
                scoreColor = 'var(--cyber-amber)';
                scoreGlow = 'rgba(245, 158, 11, 0.15)';
              }

              // Compute initials
              const initials = mla.name
                ? mla.name.split(' ').map(n => n[0]).join('')
                : 'OF';

              return (
                <tr 
                  key={mla.id} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => showToast(`Drilling into ${mla.name} complaints...`, 'info')}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div 
                        style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '8px', 
                          backgroundColor: 'rgba(255,255,255,0.03)', 
                          border: '1px solid var(--border-glass)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: scoreColor,
                          boxShadow: `0 0 10px ${scoreGlow}`
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {mla.name} {isRed && <ShieldAlert size={16} color="var(--cyber-rose)" />}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{mla.jurisdiction || 'MLA Jurisdiction'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      style={{ 
                        fontFamily: 'Space Grotesk', 
                        fontWeight: 700, 
                        fontSize: '1.25rem', 
                        color: scoreColor,
                        textShadow: `0 0 8px ${scoreGlow}`
                      }}
                    >
                      {mla.accountability_score}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isRed ? 'var(--cyber-rose)' : 'white' }}>
                      {mla.resolution_rate}% 
                      {!isRed && <TrendingUp size={14} color="var(--cyber-emerald)" />}
                      {isRed && <TrendingDown size={14} color="var(--cyber-rose)" />}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {mla.avg_response_time} days
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span 
                      className={`badge ${isRed ? 'badge-severe' : 'badge-resolved'}`}
                      style={{ minWidth: '32px', justifyContent: 'center' }}
                    >
                      {mla.escalated_count ?? (isRed ? '4' : '0')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default MpMlaScoreboard;
