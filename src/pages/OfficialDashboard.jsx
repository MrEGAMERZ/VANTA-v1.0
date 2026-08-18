import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, Filter, Download, CheckCircle, Clock, Volume2, 
  MoreHorizontal, Sparkles, Zap
} from 'lucide-react';

import { api, WS_URL } from '../services/api';
import { useToast } from '../components/Toast';

const OfficialDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: 'Representative', role: 'OFFICIAL' });
  const [isFlashing, setIsFlashing] = useState(false);

  const fetchComplaints = async () => {
    try {
      const data = await api.getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'Hon. Representative';
    const role = localStorage.getItem('user_role') || 'OFFICIAL';
    setProfile({ name, role });

    fetchComplaints();

    let ws;
    try {
      ws = new WebSocket(`${WS_URL}/map`);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { event: eventType } = payload;
          if (eventType === 'ESCALATION_SWEEP') {
            setIsFlashing(true);
            showToast('AUTO-ESCALATION DETECTED: A ticket was forcibly escalated to your tier.', 'warning');
            fetchComplaints();
            setTimeout(() => setIsFlashing(false), 2000);
          } else if (eventType === 'STATUS_CHANGE' || eventType === 'NEW_COMPLAINT') {
            fetchComplaints();
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };
    } catch (err) {
      console.error('WebSocket connection failed:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ color: 'white', padding: '3rem', fontFamily: 'Space Grotesk', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ACCESSING SECURE CONSTITUENCY TELEMETRY...</h2>
      </div>
    );
  }

  // Calculate dynamic stats
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;
  const pendingCount = complaints.filter(c => ['FILED', 'ASSIGNED', 'VIEWED', 'IN_PROGRESS'].includes(c.status)).length;
  const criticalCount = complaints.filter(c => ['CRITICAL', 'CATASTROPHIC'].includes(c.criticality_level) && c.status !== 'RESOLVED').length;

  // Filter urgent queue
  const urgentQueue = complaints
    .filter(c => c.status !== 'RESOLVED')
    .sort((a, b) => (b.criticality_score || 0) - (a.criticality_score || 0))
    .slice(0, 4);

  return (
    <main className={`main-content ${isFlashing ? 'flash-red' : ''}`} style={{ overflow: 'visible', flex: 'none', transition: 'background-color 0.2s ease-in-out', backgroundColor: isFlashing ? 'rgba(220, 38, 38, 0.3)' : 'transparent' }}>
      <div className="dashboard-body">
        
        {/* Page Header */}
        <div className="page-header">
          <div>
            <div className="page-title">
              <h1 style={{ fontFamily: 'Space Grotesk', textTransform: 'uppercase' }}>
                {profile.role} COMMAND CENTER
              </h1>
            </div>
            <div className="system-status">
              SYS_OPERATOR: <span style={{ color: '#8B9DFF', fontWeight: 600 }}>{profile.name}</span> // SECURITY STATUS: SAFE
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => showToast('Filtering options activated.', 'info')}>
              <Filter size={14} /> FILTER SECTOR
            </button>
            <button className="btn-accent" onClick={() => showToast('Downloading reports in CSV/PDF format...', 'success')}>
              <Download size={14} /> EXPORT TELEMETRY
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Total Open Issues</span>
            </div>
            <div className="stat-value">
              {totalCount} <span className="stat-trend">&uarr;12% WoW</span>
            </div>
            <div className="stat-bg-icon"><BarChart2 size={48} /></div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span>Resolved Incidents</span>
            </div>
            <div className="stat-value">
              {resolvedCount} <span className="stat-trend">&uarr;5.4%</span>
            </div>
            <div className="stat-bg-icon"><CheckCircle size={48} /></div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Pending Action</span>
            </div>
            <div className="stat-value">
              {pendingCount} <span className="stat-trend critical-trend">&uarr;2%</span>
            </div>
            <div className="stat-bg-icon"><Clock size={48} /></div>
          </div>

          <div className="stat-card critical">
            <div className="stat-header">
              <span className="critical-text" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444', boxShadow: '0 0 6px #EF4444' }}></span>
                Critical Escalations
              </span>
            </div>
            <div className="stat-value" style={{ color: '#FCA5A5' }}>
              {criticalCount} <span className="stat-trend critical-trend">&uarr;14.2%</span>
            </div>
            <div className="stat-bg-icon" style={{ color: '#EF4444' }}><Volume2 size={48} /></div>
          </div>
        </div>

        {/* Layout Split */}
        <div className="dashboard-split">
          
          {/* Urgent Queue Table */}
          <div className="queue-section">
            <div className="section-header">
              <h2 style={{ fontSize: '1rem', letterSpacing: '0.05em', color: 'white' }}>URGENT INCIDENTS QUEUE</h2>
              <MoreHorizontal size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>INCIDENT ID</th>
                  <th>CATEGORY</th>
                  <th>WARD SECTOR</th>
                  <th>CRITICALITY</th>
                  <th style={{ textAlign: 'right' }}>DEPT STATUS</th>
                  <th style={{ textAlign: 'right' }}>TACTICAL ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {urgentQueue.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#8B9DFF' }}>
                      #{item.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td>{item.category || 'General'}</td>
                    <td>{item.ward || 'Ward 7'}</td>
                    <td>
                      <span className={`badge ${['critical', 'catastrophic'].includes(item.criticality_level.toLowerCase()) ? 'badge-severe' : 'badge-high'}`}>
                        {item.criticality_level}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} className={`status-cell ${item.is_overdue ? 'overdue' : ''}`}>
                      {item.status} {item.is_overdue ? '⚠' : ''}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '0.35rem 0.85rem', display: 'inline-flex', borderRadius: '6px' }} 
                        onClick={() => navigate(`/official/complaint/${item.id}`)}
                      >
                        VIEW TICKET
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Intelligence & Escalations Panel */}
          <div className="side-panel">
            
            {/* Intelligence Brief */}
            <div className="intel-brief">
              <div className="intel-header">
                <Sparkles size={14} color="#8B9DFF" /> AI COGNITIVE BRIEF
              </div>
              <div className="intel-content">
                <p style={{ color: 'white', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <strong>AUTOMATED BRIEF:</strong> Ward 7 telemetry indicates a 12% WoW increase in civic reports, heavily clustered around <strong>Water Infrastructure</strong> outages. Structural thresholds are near-capacity.
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Prioritize Jal Jeevan budget reallocation to Ward 7 to preempt localized network pressure.
                </p>
              </div>
              <button className="btn-outline" onClick={() => showToast('DPR Brief downloaded to system storage.', 'success')}>
                <Download size={14} /> DOWNLOAD INTEL BRIEF
              </button>
            </div>

            {/* Live Escalations */}
            <div className="escalations-card">
              <div className="section-header" style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'white' }}>
                  <Zap size={14} color="#EF4444" style={{ fill: '#EF4444' }} /> LIVE TELEMETRY LOGS
                </h2>
              </div>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-icon"></div>
                  <div className="timeline-content">
                    <div className="timeline-meta">10 MINS AGO // SYS_ROUTING</div>
                    <div className="timeline-text">
                      High volume warning triggered in Sector 4G. Assigned to Suresh K.
                    </div>
                  </div>
                </div>

                <div className="timeline-item warning">
                  <div className="timeline-icon"></div>
                  <div className="timeline-content">
                    <div className="timeline-meta">2 HOURS AGO // AI_ENGINE</div>
                    <div className="timeline-text">
                      Safety index degraded below 80% near Ward 9 Healthcare Facility.
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-icon" style={{ backgroundColor: '#8B9DFF', boxShadow: '0 0 8px #8B9DFF' }}></div>
                  <div className="timeline-content">
                    <div className="timeline-meta">4 HOURS AGO // EXEC_OFFICER</div>
                    <div className="timeline-text">
                      Weekly fund usage statement updated for Smart City allocations.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};

export default OfficialDashboard;
