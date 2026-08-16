import React, { useState, useEffect } from 'react';
import { Shield, Mail, Phone, Save, Activity, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import '../pages/Dashboard.css';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const OfficialProfile = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
    jurisdiction: '',
    avg_response_time: 0.0,
    resolution_rate: 0.0,
    complaints_assigned: 0,
    complaints_resolved: 0,
    accountability_score: 100
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (userId) {
          const data = await api.getOfficial(userId);
          setProfile({
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            role: data.role || 'OFFICIAL',
            jurisdiction: data.jurisdiction || '',
            avg_response_time: data.avg_response_time || 0.0,
            resolution_rate: data.resolution_rate || 0.0,
            complaints_assigned: data.complaints_assigned || 0,
            complaints_resolved: data.complaints_resolved || 0,
            accountability_score: data.accountability_score || 100
          });
        }
      } catch (err) {
        console.error('Failed to load official profile:', err);
        // Fallback from localStorage
        setProfile(prev => ({
          ...prev,
          name: localStorage.getItem('user_name') || '',
          role: localStorage.getItem('user_role') || 'OFFICIAL'
        }));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await api.updateOfficialProfile(userId, {
        name: profile.name,
        phone: profile.phone,
        email: profile.email
      });
      localStorage.setItem('user_name', result.name);
      showToast('Official credentials updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update official profile.', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'white', padding: '3rem', fontFamily: 'Space Grotesk', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DECRYPTING COMMAND CREDENTIALS...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-body" style={{ maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <div className="page-title">
            <h1 style={{ fontFamily: 'Space Grotesk', textTransform: 'uppercase' }}>
              OFFICIAL CONFIGURATION GATE
            </h1>
          </div>
          <div className="system-status">
            ROLE: <span style={{ color: '#8B9DFF', fontWeight: 600 }}>{profile.role}</span> // SECURITY STATUS: ENCRYPTED_TELEMETRY
          </div>
        </div>
      </div>

      {/* Grid containing Profile Edit and Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        
        {/* Left Col: Edit Fields */}
        <div className="queue-section" style={{ border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Shield size={24} color="var(--cyber-indigo)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontFamily: 'Space Grotesk', fontWeight: 600 }}>Account Telemetry</h2>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Modify operational credentials and emails.</p>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.5rem' }}>OFFICIAL FULL NAME</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter official name"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.5rem' }}>EMAIL ADDRESS (LOGIN IDENTIFIER)</label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="official@samadhan.gov.in"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.5rem' }}>TELEPHONE CONTACT</label>
              <input
                type="text"
                className="form-input"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Enter phone number"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', opacity: 0.8 }}>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.5rem' }}>ASSIGNED ROLE</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.role}
                  disabled
                  style={{ width: '100%', background: 'rgba(255,255,255,0.01)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                />
              </div>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.5rem' }}>JURISDICTION SECTOR</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.jurisdiction || 'N/A'}
                  disabled
                  style={{ width: '100%', background: 'rgba(255,255,255,0.01)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn-accent"
                disabled={saving}
                style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <Save size={16} /> {saving ? 'SYNCING TELETABS...' : 'SYNC CREDENTIALS'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Col: Performance Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Score Card */}
          <div className="intel-brief" style={{ borderLeft: '4px solid var(--cyber-emerald)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>ACCOUNTABILITY SCORE</span>
              <Activity size={18} color="var(--cyber-emerald)" />
            </div>
            <div style={{ fontSize: '2.5rem', fontFamily: 'Space Grotesk', fontWeight: 'bold', color: 'var(--cyber-emerald)', textShadow: '0 0 10px rgba(16, 185, 129, 0.15)' }}>
              {profile.accountability_score}
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Calculated dynamically from response deadlines and verified community feedback.
            </p>
          </div>

          {/* Stats Breakdown */}
          <div className="escalations-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.9rem', fontFamily: 'Space Grotesk', fontWeight: 600 }}>Performance Telemetry</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckCircle size={14} color="var(--cyber-emerald)" /> Resolution Rate</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'white' }}>{profile.resolution_rate}%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Activity size={14} color="var(--cyber-indigo)" /> Avg Response</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'white' }}>{profile.avg_response_time} days</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Star size={14} color="var(--cyber-amber)" /> Assigned Tickets</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'white' }}>{profile.complaints_assigned}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><AlertTriangle size={14} color="var(--text-muted)" /> Resolved Tickets</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'white' }}>{profile.complaints_resolved}</span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OfficialProfile;
