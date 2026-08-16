import React, { useState, useEffect } from 'react';
import { User, MapPin, Save, Award, Phone } from 'lucide-react';
import '../pages/Dashboard.css';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const CitizenProfile = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    ward: '',
    district: '',
    location_lat: 12.9716,
    location_lng: 77.5946,
    reward_points: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (userId) {
          const data = await api.getCitizen(userId);
          setProfile({
            name: data.name || '',
            phone: data.phone || '',
            ward: data.ward || 'Ward 7',
            district: data.district || 'Bengaluru South',
            location_lat: data.location_lat || 12.9716,
            location_lng: data.location_lng || 77.5946,
            reward_points: data.reward_points || 0
          });
        }
      } catch (err) {
        console.error('Failed to load citizen profile:', err);
        // Fallback from localStorage
        setProfile(prev => ({
          ...prev,
          name: localStorage.getItem('user_name') || '',
          phone: localStorage.getItem('citizen_phone') || ''
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
      const result = await api.updateCitizenProfile(userId, {
        name: profile.name,
        ward: profile.ward,
        district: profile.district,
        location_lat: parseFloat(profile.location_lat),
        location_lng: parseFloat(profile.location_lng)
      });
      localStorage.setItem('user_name', result.name);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile.', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'white', padding: '3rem', fontFamily: 'Space Grotesk', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ACCESSING IDENTITY DATA...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-body" style={{ maxWidth: '800px', margin: '0 auto', color: 'white' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div className="page-title">
            <h1 style={{ fontFamily: 'Space Grotesk', textTransform: 'uppercase' }}>
              CITIZEN PROFILE SETTINGS
            </h1>
          </div>
          <div className="system-status">
            CITIZEN_ID: <span style={{ color: '#8B9DFF', fontWeight: 600 }}>{userId?.substring(0,8).toUpperCase()}</span> // STATUS: SYNCHRONIZED
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Profile Card */}
        <div className="queue-section" style={{ border: '1px solid var(--border-glass)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.5rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <User size={32} color="var(--cyber-indigo)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'Space Grotesk', fontWeight: 600 }}>{profile.name || 'Anonymous Citizen'}</h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={12} /> {profile.phone}
              </p>
            </div>
            
            {/* Rewards telemetry indicator */}
            <div style={{ marginLeft: 'auto', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '10px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="var(--cyber-emerald)" />
              <div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>SAMADHAN POINTS</span>
                <span style={{ fontSize: '1.15rem', color: 'var(--cyber-emerald)', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{profile.reward_points}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              <div className="form-group">
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.5rem' }}>FULL NAME</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.5rem' }}>JURISDICTION WARD</label>
                <select
                  className="form-input"
                  value={profile.ward}
                  onChange={(e) => setProfile({ ...profile, ward: e.target.value })}
                  style={{ width: '100%', background: '#0F0F1A' }}
                >
                  <option value="Ward 3">Ward 3</option>
                  <option value="Ward 4">Ward 4</option>
                  <option value="Ward 5">Ward 5</option>
                  <option value="Ward 7">Ward 7</option>
                  <option value="Ward 8">Ward 8</option>
                  <option value="Ward 9">Ward 9</option>
                  <option value="Ward 10">Ward 10</option>
                  <option value="Ward 11">Ward 11</option>
                  <option value="Ward 12">Ward 12</option>
                </select>
              </div>

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              <div className="form-group">
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.5rem' }}>DISTRICT</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.district}
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  placeholder="District Sector"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.5rem' }}>GEOTAG_LAT</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={profile.location_lat}
                      onChange={(e) => setProfile({ ...profile, location_lat: e.target.value })}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '0.5rem' }}>GEOTAG_LNG</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={profile.location_lng}
                      onChange={(e) => setProfile({ ...profile, location_lng: e.target.value })}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn-accent"
                disabled={saving}
                style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <Save size={16} /> {saving ? 'SAVING DATA...' : 'SAVE CONFIGURATION'}
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default CitizenProfile;
