import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Share2, Printer, MapPin, 
  Cpu, MessageSquare, ChevronRight, AlertCircle
} from 'lucide-react';
import './Escalations.css';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const Escalations = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEscalated = async () => {
    try {
      const data = await api.getComplaints({ complaint_status: 'ESCALATED' });
      // Sort by priority/date
      const sorted = data.sort((a, b) => b.criticality_score - a.criticality_score);
      setComplaints(sorted);
      if (sorted.length > 0) {
        setActiveComplaint(sorted[0]);
      } else {
        setActiveComplaint(null);
      }
    } catch (err) {
      console.error('Failed to load escalated complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalated();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateComplaintStatus(id, newStatus);
      showToast(`Complaint status updated to ${newStatus}`, 'success');
      await fetchEscalated();
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="escalations-loading">
        <div className="spinner"></div>
        <p>SCANNING OVERDUE GRID QUEUE...</p>
      </div>
    );
  }

  return (
    <div className="escalations-container">
      {/* Top Header */}
      <div className="escalations-header">
        <div className="header-stats">
          <div className="stat-group">
            <span className="stat-label">ACTIVE ESCALATIONS</span>
            <div className="stat-value">
              <span className="dot red"></span>
              {complaints.length}
            </div>
          </div>
          <div className="stat-group">
            <span className="stat-label">GRID STATUS</span>
            <div className="stat-value green">ONLINE</div>
          </div>
          <div className="stat-group">
            <span className="stat-label">SWEEP INTERVAL</span>
            <div className="stat-value blue">60s</div>
          </div>
        </div>
        <button className="btn-ghost" onClick={() => fetchEscalated()} style={{ padding: '0.5rem 1rem' }}>
          REFRESH GRID
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-escalations">
          <AlertCircle size={48} color="#10b981" />
          <h2>NO ESCALATIONS DETECTED</h2>
          <p>All grievances are currently being processed within nominal deadline boundaries.</p>
        </div>
      ) : (
        <div className="escalations-body">
          {/* Left Column Feed */}
          <div className="feed-column">
            <div className="feed-header">
              Escalation Feed ({complaints.length})
            </div>
            <div className="feed-list">
              {complaints.map((complaint) => {
                const isActive = activeComplaint && complaint.id === activeComplaint.id;
                const badgeClass = complaint.criticality_level === 'CATASTROPHIC' || complaint.criticality_level === 'CRITICAL' ? 'critical' : 
                                  complaint.criticality_level === 'HIGH' ? 'high' : 'moderate';

                return (
                  <div 
                    key={complaint.id}
                    className={`feed-card ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(`/official/complaint/${complaint.id}`)}
                    onMouseEnter={() => setActiveComplaint(complaint)}
                  >
                    <div className="card-meta">
                      <div className="card-badges">
                        <span className={`card-badge ${badgeClass}`}>{complaint.criticality_level}</span>
                        <span className="card-badge neutral">{complaint.category}</span>
                      </div>
                      <span className="card-time">{complaint.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <h3>{complaint.text_original?.substring(0, 50) || complaint.text_content?.substring(0, 50)}...</h3>
                    <p>{complaint.text_content}</p>
                    <div className="card-footer">
                      <div className="card-footer-item">
                        <MapPin size={10} /> {complaint.location_address || 'Auto Location'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column Details */}
          {activeComplaint && (
            <div className="details-column">
              <div className="details-scroll">
                
                <div className="details-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="priority-tag">
                      <div className="dot"></div> PRIORITY: {activeComplaint.criticality_level}
                    </div>
                    <div className="details-id">ID: {activeComplaint.id.substring(0, 8).toUpperCase()}</div>
                  </div>
                  <div className="details-actions">
                    <button className="icon-btn" onClick={() => showToast('Secure share payload generated', 'success')}><Share2 size={16} /></button>
                    <button className="icon-btn" onClick={() => window.print()}><Printer size={16} /></button>
                  </div>
                </div>

                <h1 className="details-title">{activeComplaint.text_original?.substring(0, 70) || activeComplaint.text_content?.substring(0, 70)}...</h1>

                <div className="details-meta-grid">
                  <div className="meta-block">
                    <span className="meta-label">JURISDICTION</span>
                    <span className="meta-value">{activeComplaint.ward}</span>
                  </div>
                  <div className="meta-block">
                    <span className="meta-label">LOCATION</span>
                    <span className="meta-value">{activeComplaint.location_address}</span>
                  </div>
                  <div className="meta-block">
                    <span className="meta-label">DEADLINE</span>
                    <span className="meta-value">{new Date(activeComplaint.deadline_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="content-split">
                  <div>
                    <div className="section-label">ORIGINAL COMPLAINT</div>
                    <div className="complaint-text">
                      "{activeComplaint.text_original || activeComplaint.text_content}"
                    </div>
                  </div>

                  <div>
                    <div className="ai-panel">
                      <div className="ai-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Cpu size={14} /> AI SYSTEM ANALYSIS
                        </div>
                      </div>
                      
                      <div className="ai-bullet">
                        <ChevronRight size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Criticality score:</strong> {activeComplaint.criticality_score}/100
                        </div>
                      </div>
                      
                      <div className="ai-bullet">
                        <ChevronRight size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Urgency level:</strong> {activeComplaint.criticality_level}
                        </div>
                      </div>

                      <div className="ai-bullet">
                        <ChevronRight size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Language detected:</strong> {activeComplaint.language_detected || 'en'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="timeline-section">
                  <div className="section-label">RESOLUTION TIMELINE</div>
                  <div className="timeline-container">
                    <div className="timeline-row">
                      <div className="timeline-node">
                        <div className="node-icon active"></div>
                        <div className="node-line"></div>
                      </div>
                      <div className="timeline-content-box active">
                        <span className="time-stamp active">DEADLINE BREACHED</span>
                        <h4 className="timeline-title">Auto-Escalated to Tier {activeComplaint.assigned_tier}</h4>
                        <p className="timeline-desc">Assigned window breached. Escalation sweeping routine reallocated ownership to representative {activeComplaint.assigned_to}.</p>
                      </div>
                    </div>

                    <div className="timeline-row">
                      <div className="timeline-node">
                        <div className="node-icon"></div>
                        <div className="node-line"></div>
                      </div>
                      <div className="timeline-content-box">
                        <span className="time-stamp">{new Date(activeComplaint.assigned_at).toLocaleString()}</span>
                        <h4 className="timeline-title">Assigned to Official Node</h4>
                      </div>
                    </div>

                    <div className="timeline-row">
                      <div className="timeline-node">
                        <div className="node-icon"></div>
                      </div>
                      <div className="timeline-content-box">
                        <span className="time-stamp">{new Date(activeComplaint.filed_at).toLocaleString()}</span>
                        <h4 className="timeline-title">Grievance Filed by Citizen</h4>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="details-footer">
                <button 
                  className="btn-ghost"
                  onClick={() => handleStatusChange(activeComplaint.id, 'VIEWED')}
                ><MessageSquare size={14}/> MARK VIEWED</button>
                <button 
                  className="btn-ghost"
                  onClick={() => handleStatusChange(activeComplaint.id, 'IN_PROGRESS')}
                >MARK IN PROGRESS</button>
                <button 
                  className="btn-primary-purple"
                  onClick={() => navigate(`/official/complaint/${activeComplaint.id}`)}
                >RESOLVE INCIDENT</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Escalations;
