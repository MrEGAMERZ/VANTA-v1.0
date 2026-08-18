import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Check, X, Info } from 'lucide-react';
import { api, WS_URL } from '../services/api';
import './CitizenIssues.css';
import { useToast } from '../components/Toast';

const CitizenIssues = () => {
  const { showToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [activeIssue, setActiveIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchIssues = async () => {
    try {
      const citizenId = localStorage.getItem('user_id');
      const data = await api.getComplaints({ citizen_id: citizenId });
      
      // Map backend complaints to dashboard structure
      const mapped = data.map(c => {
        const colorMap = {
          CATASTROPHIC: 'red',
          CRITICAL: 'red',
          HIGH: 'orange',
          ELEVATED: 'yellow',
          MODERATE: 'blue',
          ROUTINE: 'green',
          RESOLVED: 'green',
          PENDING_VERIFICATION: 'violet'
        };

        const events = [
          {
            type: 'REPORT FILED',
            time: new Date(c.filed_at).toLocaleString(),
            content: 'Citizen Report entered system queue.',
            hasPhotos: c.photo_urls && c.photo_urls.length > 0
          }
        ];

        if (c.assigned_at) {
          events.push({
            type: 'OFFICIAL ROUTED',
            time: new Date(c.assigned_at).toLocaleString(),
            content: `Assigned to representative tier ${c.assigned_tier}.`
          });
        }

        if (c.first_viewed_at) {
          events.push({
            type: 'UNDER REVIEW',
            time: new Date(c.first_viewed_at).toLocaleString(),
            content: 'Grievance ticket opened and reviewed by assignee.'
          });
        }

        if (c.resolved_at) {
          events.push({
            type: 'RESOLUTION DEPLOYED',
            time: new Date(c.resolved_at).toLocaleString(),
            content: `Action: ${c.resolution_action || 'Repair'}. Note: ${c.resolution_note || 'None'}`
          });
        }

        if (c.status === 'RESOLVED') {
          events.push({
            type: 'TICKET CLOSED',
            time: new Date(c.verified_at || c.resolved_at).toLocaleString(),
            content: 'Resolution verified by citizen. Ticket finalized.'
          });
        }
        
        return {
          id: c.id.substring(0, 8).toUpperCase(),
          rawId: c.id,
          rawStatus: c.status,
          date: new Date(c.filed_at).toLocaleDateString(),
          title: c.text_original || c.text_content || 'No Title Available',
          criticality: c.status === 'RESOLVED' ? 'RESOLVED' : (c.status === 'PENDING_VERIFICATION' ? 'PENDING VERIFY' : c.criticality_level),
          category: c.category || 'General',
          priority: `P${5 - c.star_rating}`,
          colorClass: colorMap[c.status === 'RESOLVED' ? 'RESOLVED' : (c.status === 'PENDING_VERIFICATION' ? 'PENDING_VERIFICATION' : c.criticality_level)] || 'blue',
          diagnostic: c.text_content || 'AI analysis pending telemetry feedback.',
          risk: c.criticality_level,
          riskPercent: c.criticality_score || 30,
          unit: c.assigned_to ? 'ROUTED REPRESENTATIVE' : 'PENDING ROUTING',
          eta: c.status === 'RESOLVED' ? 'RESOLVED' : (c.deadline_at ? new Date(c.deadline_at).toLocaleDateString() : 'N/A'),
          budgetNode: c.fund_used || 'SECTOR_CAPITAL_OPEX',
          resolutionNote: c.resolution_note,
          resolutionPhotos: c.resolution_photos,
          events: events.sort((a, b) => new Date(a.time) - new Date(b.time))
        };
      });
      
      setIssues(mapped);
      if (mapped.length > 0) {
        // Maintain active item if reloading
        if (activeIssue) {
          const current = mapped.find(item => item.rawId === activeIssue.rawId);
          setActiveIssue(current || mapped[0]);
        } else {
          setActiveIssue(mapped[0]);
        }
      } else {
        setActiveIssue(null);
      }
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();

    let ws;
    try {
      ws = new WebSocket(`${WS_URL}/map`);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { event: eventType } = payload;
          if (eventType === 'STATUS_CHANGE' || eventType === 'NEW_COMPLAINT') {
            fetchIssues();
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

  const handleVerify = async (vote) => {
    if (!activeIssue) return;
    try {
      const citizenId = localStorage.getItem('user_id');
      await api.verifyResolution(activeIssue.rawId, citizenId, vote);
      showToast(vote ? 'Resolution verified successfully! Points awarded.' : 'Reported false closure. Complaint reopened.', 'success');
      await fetchIssues();
    } catch (err) {
      showToast(err.message || 'Verification failed.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="issues-container">
        <div className="issues-top-bar">
          <div className="top-title skeleton" style={{ width: '150px', height: '24px' }}></div>
        </div>
        <div className="issues-split">
          <div className="issues-left">
            <div className="receptacle-header">
              <span className="skeleton" style={{ width: '120px', height: '14px' }}></span>
            </div>
            <div className="receptacle-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="issue-list-item" style={{ pointerEvents: 'none' }}>
                  <div className="item-meta">
                    <span className="skeleton" style={{ width: '60px', height: '10px' }}></span>
                    <span className="skeleton" style={{ width: '80px', height: '10px' }}></span>
                  </div>
                  <h4 className="skeleton skeleton-title" style={{ marginTop: '8px' }}></h4>
                  <div className="skeleton skeleton-badge" style={{ marginTop: '8px' }}></div>
                </div>
              ))}
            </div>
          </div>
          <div className="issues-right" style={{ padding: '2rem' }}>
            <div className="skeleton skeleton-title" style={{ height: '32px', width: '40%', marginBottom: '1.5rem' }}></div>
            <div className="skeleton skeleton-text" style={{ height: '80px', marginBottom: '1.5rem' }}></div>
            <div className="skeleton skeleton-text" style={{ height: '150px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredIssues = issues.filter(issue => 
    issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="issues-container">
      
      {/* Absolute Top Bar */}
      <div className="issues-top-bar">
        <div className="top-title">MY ISSUES |</div>
        <div className="search-container">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="FILTER BY ID OR TAG..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {issues.length === 0 ? (
        <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>No issues filed yet. Use File Report to submit.</div>
      ) : (
        <div className="issues-split">
          
          {/* Left Column */}
          <div className="issues-left">
            <div className="receptacle-header">
              <span>MY REPORTS</span>
              <span style={{ color: '#555570' }}>TOTAL: {filteredIssues.length}</span>
            </div>
            
            <div className="receptacle-list">
              {filteredIssues.map(issue => (
                <div 
                  key={issue.id} 
                  className={`issue-list-item ${activeIssue && activeIssue.id === issue.id ? 'active' : ''}`}
                  onClick={() => setActiveIssue(issue)}
                >
                  <div className="item-meta">
                    <span>{issue.id}</span>
                    <span>{issue.date}</span>
                  </div>
                  <h4 className="item-title">{issue.title}</h4>
                  <div className="item-badges">
                    <div className={`badge-outline ${issue.criticality.toLowerCase().replace(' ', '-')}`}>
                      <div className={`badge-dot ${issue.colorClass}`}></div>
                      {issue.criticality}
                    </div>
                    <div className="badge-outline" style={{ border: 'none', paddingLeft: 0 }}>
                      {issue.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          {activeIssue ? (
            <div className="issues-right">
              
              <div className="detail-header-actions">
                <div className="action-block">
                  ISSUE ID: <span>{activeIssue.id}</span>
                </div>
                <div className="action-block priority">
                  PRIORITY:<br/>{activeIssue.priority}
                </div>
                <button className="btn-solid" onClick={() => alert("Issue flagged for review.")}>FLAG</button>
              </div>

              <h1 className="detail-title">{activeIssue.title}</h1>

              {/* Dynamic Verification Banner */}
              {activeIssue.rawStatus === 'PENDING_VERIFICATION' && (
                <div className="verification-panel">
                  <div className="vp-header">
                    <Info size={16} color="#c084fc" />
                    <span>RESOLUTON VERIFICATION REQUESTED</span>
                  </div>
                  <p className="vp-notes">
                    <strong>Official Note:</strong> {activeIssue.resolutionNote || 'No resolution description provided.'}
                  </p>
                  <div className="vp-buttons">
                    <button className="btn-verify-yes" onClick={() => handleVerify(true)}>
                      <Check size={16} /> YES, IT'S RESOLVED
                    </button>
                    <button className="btn-verify-no" onClick={() => handleVerify(false)}>
                      <X size={16} /> NO, STILL BROKEN
                    </button>
                  </div>
                </div>
              )}

              <div className="detail-panels">
                
                {/* Panel 1 */}
                <div className="panel-card">
                  <div className="panel-title">
                    AI ANALYSIS
                    <Sparkles size={14} />
                  </div>
                  <div className="panel-text">
                    {activeIssue.diagnostic}
                  </div>
                  <div className="risk-bar-container">
                    <div className="risk-track">
                      <div 
                        className="risk-fill" 
                        style={{ 
                          width: `${activeIssue.riskPercent}%`,
                          backgroundColor: activeIssue.risk === 'HIGH' || activeIssue.risk === 'CRITICAL' || activeIssue.risk === 'CATASTROPHIC' ? '#ef4444' : (activeIssue.risk === 'NOMINAL' || activeIssue.risk === 'ROUTINE' ? '#4ADE80' : '#F5C518') 
                        }}
                      ></div>
                    </div>
                    <div className="risk-label" style={{ color: activeIssue.risk === 'HIGH' || activeIssue.risk === 'CRITICAL' || activeIssue.risk === 'CATASTROPHIC' ? '#ef4444' : (activeIssue.risk === 'NOMINAL' || activeIssue.risk === 'ROUTINE' ? '#4ADE80' : '#F5C518') }}>
                      COLLAPSE RISK: {activeIssue.risk}
                    </div>
                  </div>
                </div>

                {/* Panel 2 */}
                <div className="panel-card">
                  <div className="panel-title">ASSIGNMENT DETAILS</div>
                  <div className="resource-grid">
                    <div className="rg-label">Assigned<br/>Unit:</div>
                    <div className="rg-value">{activeIssue.unit}</div>
                    
                    <div className="rg-label">ETA:</div>
                    <div className="rg-value">{activeIssue.eta}</div>
                    
                    <div className="rg-label">Budget<br/>Node:</div>
                    <div className="rg-value">{activeIssue.budgetNode}</div>
                  </div>
                </div>

              </div>

              {/* Timeline */}
              {activeIssue.events.length > 0 && (
                <div className="timeline-section">
                  <div className="timeline-title">TIMELINE</div>
                  
                  <div className="chronology-tree">
                    {activeIssue.events.map((event, idx) => (
                      <div key={idx} className="chrono-item">
                        <div className="chrono-node"></div>
                        <div className="chrono-header">
                          <span className="chrono-event">{event.type}</span>
                          <span className="chrono-time">{event.time}</span>
                        </div>
                        
                        {event.content && (
                          <div className="chrono-box">
                            {event.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div style={{ color: 'white', padding: '2rem' }}>Please select an issue to view its telemetry details.</div>
          )}

        </div>
      )}
    </div>
  );
};

export default CitizenIssues;
