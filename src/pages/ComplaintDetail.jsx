import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Bell, User, MapPin, 
  Home, AlertTriangle, Map, Play, ArrowRightLeft, AlertCircle, CheckCircle2
} from 'lucide-react';
import './ComplaintDetail.css';
import { api } from '../services/api';
import { useToast } from '../components/Toast';


const ComplaintDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  
  const [complaint, setComplaint] = useState(null);
  const [citizen, setCitizen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadComplaintData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch complaint
      const c = await api.getComplaint(id);
      if (c && !c.detail) {
        setComplaint(c);
        // Fetch citizen details if citizen_id is present
        if (c.citizen_id) {
          try {
            const cit = await api.getCitizen(c.citizen_id);
            if (cit && !cit.detail) {
              setCitizen(cit);
            }
          } catch (err) {
            console.error("Failed to load citizen profile:", err);
          }
        }
      }
    } catch (err) {
      console.error("Error loading complaint from DB:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaintData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ color: 'white', padding: '5rem', textAlign: 'center', fontFamily: 'Space Grotesk' }}>
        <h2>ACCESSING SECURE DATABASE TELEMETRY...</h2>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div style={{ color: 'white', padding: '5rem', textAlign: 'center', fontFamily: 'Space Grotesk' }}>
        <h2>COMPLAINT NOT FOUND</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>The requested incident could not be located in the database.</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: 'var(--cyber-indigo)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          GO BACK
        </button>
      </div>
    );
  }

  const activeComplaint = complaint;

  // Map to UI Structure
  const displayComplaint = {
    id: activeComplaint.id ? (activeComplaint.id.substring(0, 8).toUpperCase()) : 'UNKNOWN',
    rawId: activeComplaint.id,
    title: activeComplaint.text_original || activeComplaint.title || 'No Title Available',
    priority: activeComplaint.criticality_level || activeComplaint.priority || 'ROUTINE',
    type: activeComplaint.category || activeComplaint.type || 'General',
    status: activeComplaint.status || 'FILED',
    reportedAt: activeComplaint.filed_at ? new Date(activeComplaint.filed_at).toLocaleString() : (activeComplaint.reportedAt || 'N/A'),
    location: {
      desc: activeComplaint.location_address || (activeComplaint.location && activeComplaint.location.desc) || 'Auto-detected Location',
      lat: activeComplaint.location_lat || (activeComplaint.location && activeComplaint.location.lat) || '12.9716',
      lon: activeComplaint.location_lng || (activeComplaint.location && activeComplaint.location.lon) || '77.5946',
      grid: `${activeComplaint.ward || 'Ward Sector'}, ${activeComplaint.district || 'District'}`
    },
    description: activeComplaint.text_content || activeComplaint.description || '',
    aiDiagnostics: {
      type: activeComplaint.sub_category || (activeComplaint.aiDiagnostics && activeComplaint.aiDiagnostics.type) || 'GENERAL OUTAGE',
      probability: activeComplaint.criticality_score ? `${activeComplaint.criticality_score}% Score` : ((activeComplaint.aiDiagnostics && activeComplaint.aiDiagnostics.probability) || '95% Score'),
      risk: activeComplaint.criticality_level ? `${activeComplaint.criticality_level} Level` : ((activeComplaint.aiDiagnostics && activeComplaint.aiDiagnostics.risk) || 'Normal Risk')
    },
    timeline: activeComplaint.timeline || [
      { action: 'FILED', time: activeComplaint.filed_at ? new Date(activeComplaint.filed_at).toLocaleTimeString() : '08:42 AM', desc: 'Initial Citizen Report received.' },
      ...(activeComplaint.assigned_at ? [{ action: 'ASSIGNED', time: new Date(activeComplaint.assigned_at).toLocaleTimeString(), desc: 'Routed to jurisdiction official.' }] : []),
      ...(activeComplaint.first_viewed_at ? [{ action: 'VIEWED', time: new Date(activeComplaint.first_viewed_at).toLocaleTimeString(), desc: 'Incident viewed by assignee.' }] : []),
      ...(activeComplaint.resolved_at ? [{ action: 'RESOLVED', time: new Date(activeComplaint.resolved_at).toLocaleTimeString(), desc: 'Resolution submitted.' }] : [])
    ]
  };

  const handleMarkInProgress = async () => {
    try {
      await api.updateComplaintStatus(complaint.id, 'IN_PROGRESS');
      showToast('Status updated to IN PROGRESS', 'success');
      loadComplaintData();
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleResolve = async () => {
    const note = prompt("Enter resolution notes:");
    if (note === null) return;
    if (note.trim() === '') {
      showToast("Resolution note is required.", "warning");
      return;
    }
    try {
      await api.submitResolution(complaint.id, {
        resolution_note: note,
        resolution_action: 'REPAIRED',
        amount_spent: 24000.0,
        resolution_photos: []
      });
      showToast('Resolution submitted for verification!', 'success');
      loadComplaintData();
    } catch {
      showToast('Failed to submit resolution.', 'error');
    }
  };

  return (
    <div className="cmd-view-container">
      {/* Custom Topbar */}
      <header className="cmd-topbar">
        <div className="cmd-topbar-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div className="cmd-brand">CivicPulse Governance</div>
          <div className="cmd-badge">CMD_VIEW: #{displayComplaint.id}</div>
        </div>
        <div className="cmd-topbar-right">
          <Bell size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
          <User size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="cmd-main-layout">
        
        {/* Left Column */}
        <div className="cmd-left-col">
          
          {/* Header Card */}
          <div className="cmd-card">
            <div className="header-card-top">
              <div className="header-badges">
                <span className={`h-badge ${['critical', 'catastrophic'].includes(displayComplaint.priority.toLowerCase()) ? 'critical' : 'neutral'}`}>{displayComplaint.priority} PRIORITY</span>
                <span className="h-badge neutral">{displayComplaint.type}</span>
              </div>
              <div className="active-status">
                <div className="dot"></div> {displayComplaint.status}
              </div>
            </div>
            
            <h1 className="cmd-title">{displayComplaint.title}</h1>
            <div className="cmd-meta">
              REPORTED: {displayComplaint.reportedAt} | LAT: {displayComplaint.location.lat}, LON: {displayComplaint.location.lon}
            </div>
            
            <p className="cmd-desc">
              {displayComplaint.description}
            </p>
          </div>

          {/* Reporting Citizen Card */}
          <div className="cmd-card" style={{ padding: '1.5rem' }}>
            <h3 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={14} color="#8B9DFF" /> REPORTING CITIZEN PROFILE
            </h3>
            {citizen ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1c1e24', paddingBottom: '0.5rem' }}>
                  <span>NAME:</span>
                  <strong style={{ color: 'white' }}>{citizen.name || 'Anonymous Citizen'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1c1e24', paddingBottom: '0.5rem' }}>
                  <span>PHONE:</span>
                  <strong style={{ color: 'white' }}>{citizen.phone || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1c1e24', paddingBottom: '0.5rem' }}>
                  <span>WARD / JURISDICTION:</span>
                  <strong style={{ color: 'white' }}>{citizen.ward || 'N/A'}, {citizen.district || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                  <span>REWARD POINTS:</span>
                  <strong style={{ color: '#8B9DFF' }}>{citizen.reward_points} PTS</strong>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active citizen profile linked to this telemetry incident (filed anonymously or system auto-generated).
              </div>
            )}
          </div>

          {/* Evidence Card */}
          <div className="cmd-card" style={{ padding: '1.5rem' }}>
            <h3 className="section-heading">EVIDENCE & AI DIAGNOSTICS</h3>
            <div className="evidence-split">
              
              {/* Simulated Image */}
              <div className="evidence-image-container">
                <div className="fake-sinkhole"></div>
                <div className="ai-bounding-box">
                  <div className="ai-box-label">{displayComplaint.aiDiagnostics.type}: 98%</div>
                </div>
              </div>

              {/* AI Diagnostics */}
              <div className="evidence-data">
                <div className="ai-box purple">
                  <div className="ai-box-head">
                    <Home size={12} /> AI DETECT: {displayComplaint.aiDiagnostics.type}
                  </div>
                  <div className="ai-box-val purple-text">{displayComplaint.aiDiagnostics.probability}</div>
                </div>

                <div className="ai-box red">
                  <div className="ai-box-head">
                    <AlertTriangle size={12} /> RISK ASSESSMENT
                  </div>
                  <div className="ai-box-val red-text">{displayComplaint.aiDiagnostics.risk}</div>
                </div>

                <div className="location-box">
                  <MapPin size={20} color="var(--text-muted)" />
                  <div className="loc-text">{displayComplaint.location.grid}</div>
                </div>
                <button className="btn-loc" onClick={() => showToast('Opening maps route...', 'info')}>
                  <Map size={12} /> GET DIRECTIONS
                </button>
              </div>

            </div>
          </div>

          {/* Command Log Card */}
          <div className="cmd-card" style={{ padding: '1.5rem' }}>
            <h3 className="section-heading">COMMAND LOG ENTRY</h3>
            <textarea 
              className="log-textarea" 
              placeholder="Enter tactical update or resolution notes..."
            ></textarea>
          </div>

        </div>

        {/* Right Column (Timeline) */}
        <div className="cmd-right-col">
          <div className="timeline-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            EVENT TIMELINE
          </div>

          <div className="timeline-wrapper">
            
            {displayComplaint.timeline.map((event, idx) => (
              <div key={idx} className={`t-node ${idx % 2 !== 0 ? 'offset-left' : ''}`}>
                <div className="t-box">
                  <div className="t-box-head">
                    <span className="t-action">{event.action}</span>
                    <span className="t-time">{event.time}</span>
                  </div>
                  <p className="t-desc">{event.desc}</p>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Fixed Footer Bar */}
        <div className="cmd-footer">
          <div className="footer-left">
            <button className="btn-cmd-primary" onClick={handleMarkInProgress}>
              <Play size={14} style={{ fill: 'currentColor' }} /> MARK IN PROGRESS
            </button>
            <button className="btn-cmd-outline" onClick={handleResolve}>
              <CheckCircle2 size={14} /> SUBMIT RESOLUTION
            </button>
          </div>
          <div className="footer-right">
            <button className="btn-cmd-outline" onClick={() => showToast('Reassign protocol initialized.', 'info')}>
              <ArrowRightLeft size={14} /> REASSIGN
            </button>
            <button className="btn-cmd-outline danger-text" onClick={() => showToast('Escalation request submitted.', 'warning')}>
              <AlertCircle size={14} /> REQUEST ESCALATION
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComplaintDetail;
