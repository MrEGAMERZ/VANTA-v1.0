import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Play, MapPin, Cpu, ShieldAlert } from 'lucide-react';
import './Constituency.css';
import LiveMap from '../components/map/LiveMap';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const Constituency = () => {
  const { showToast } = useToast();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [emergencyAlert, setEmergencyAlert] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const pins = await api.getMapPins();
        // Look for catastrophic or highly critical ones
        const alertPin = pins.find(p => p.criticality === 'CATASTROPHIC') || pins.find(p => p.criticality === 'CRITICAL');
        if (alertPin) {
          setEmergencyAlert(alertPin);
          // Load this as initial selected
          const full = await api.getComplaint(alertPin.id);
          setSelectedComplaint(full);
        } else if (pins.length > 0) {
          const full = await api.getComplaint(pins[0].id);
          setSelectedComplaint(full);
        }
      } catch (err) {
        console.error('Error fetching constituency map data:', err);
      }
    };
    fetchInitialData();
  }, []);

  const handleMarkerClick = async (pin) => {
    try {
      const full = await api.getComplaint(pin.id);
      setSelectedComplaint(full);
    } catch (err) {
      console.error('Failed to load complaint details:', err);
    }
  };

  const handleAction = async (newStatus) => {
    if (!selectedComplaint) return;
    try {
      await api.updateComplaintStatus(selectedComplaint.id, newStatus);
      showToast(`Action verified: Grievance moved to status ${newStatus}`, 'success');
      // Refresh current details
      const updated = await api.getComplaint(selectedComplaint.id);
      setSelectedComplaint(updated);
    } catch {
      showToast('Failed to execute administrative command.', 'error');
    }
  };

  return (
    <div className="constituency-container">
      {/* Alert Banner */}
      {emergencyAlert && (
        <div className="alert-banner">
          <div className="alert-banner-content">
            <AlertTriangle size={16} className="pulse-icon" />
            <span>CRITICAL AREA EMERGENCY: {emergencyAlert.title.substring(0, 60)}...</span>
          </div>
          <button className="alert-banner-btn" onClick={() => handleMarkerClick(emergencyAlert)}>
            DEPLOY ANALYSIS
          </button>
        </div>
      )}

      <div className="map-layout">
        {/* Map Area */}
        <div className="map-area" style={{ position: 'relative', flex: 1, minHeight: '400px' }}>
          <LiveMap onMarkerClick={handleMarkerClick} />
        </div>

        {/* Details Panel */}
        <div className="details-panel">
          {selectedComplaint ? (
            <>
              <div className="panel-header">
                <X size={20} className="panel-close" onClick={() => setSelectedComplaint(null)} />
                <div className="incident-id">ID: #{selectedComplaint.id.substring(0, 8).toUpperCase()}</div>
                <h2 className="incident-title" style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                  {selectedComplaint.text_original?.substring(0, 60) || selectedComplaint.text_content?.substring(0, 60)}...
                </h2>
                <div className="incident-coord">
                  <MapPin size={12} /> Coord: {selectedComplaint.location_lat?.toFixed(4)}, {selectedComplaint.location_lng?.toFixed(4)}
                </div>
              </div>

              <div className="panel-body">
                <div className="criticality-card">
                  <div className="crit-left">
                    <h4>CRITICALITY LEVEL</h4>
                    <p className="level">{selectedComplaint.criticality_level}</p>
                  </div>
                  <div className="crit-divider"></div>
                  <div className="crit-right">
                    <h4>AI RISK SCORE</h4>
                    <p className="score">{selectedComplaint.criticality_score}/100</p>
                  </div>
                </div>

                <div className="section-title">AI GEOSPATIAL INTELLIGENCE</div>
                <div className="tags-container">
                  <div className={`tag ${selectedComplaint.criticality_level === 'CRITICAL' ? 'tag-red' : 'tag-orange'}`}>
                    <Cpu size={12} style={{ marginRight: '4px' }} />
                    {selectedComplaint.category || 'General'} / {selectedComplaint.sub_category || 'Other'}
                  </div>
                  {selectedComplaint.near_school && <div className="tag tag-red">NEAR SCHOOL ZONE</div>}
                  {selectedComplaint.near_hospital && <div className="tag tag-red">NEAR MEDICAL FACILITY</div>}
                  {selectedComplaint.near_highway && <div className="tag tag-grey">HIGHWAY ADJACENT</div>}
                </div>

                <div className="section-title">TRANSCRIPT TELEMETRY</div>
                <div className="complaint-transcript-box" style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  color: '#9ca3af'
                }}>
                  "{selectedComplaint.text_content}"
                </div>

                {selectedComplaint.voice_file_url && (
                  <div className="audio-player">
                    <h4>CITIZEN REPORT AUDIO</h4>
                    <div className="audio-controls">
                      <div className="play-btn">
                        <Play size={16} color="#000" style={{ marginLeft: 2 }} />
                      </div>
                      <div className="waveform">
                        <div className="wave-bar active" style={{ height: '40%' }}></div>
                        <div className="wave-bar active" style={{ height: '80%' }}></div>
                        <div className="wave-bar active" style={{ height: '100%' }}></div>
                        <div className="wave-bar active" style={{ height: '60%' }}></div>
                        <div className="wave-bar" style={{ height: '35%' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="panel-footer">
                <button 
                  className="btn-danger" 
                  onClick={() => handleAction('ESCALATED')}
                >
                  FORCE ESCALATION SWEEP
                </button>
                <div className="action-row">
                  <button 
                    className="btn-secondary"
                    onClick={() => handleAction('IN_PROGRESS')}
                  >
                    MARK IN PROGRESS
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => handleAction('PENDING_VERIFICATION')}
                  >
                    MARK RESOLVED
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-incident-panel">
              <ShieldAlert size={48} color="#6366f1" />
              <h3>INTEL PANEL STANDBY</h3>
              <p>Select any geographic marker pin on the telemetry map to analyze local structural grievances.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Constituency;
