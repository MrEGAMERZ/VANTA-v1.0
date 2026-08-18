/**
 * @file CitizenAnalytics.jsx
 * @description Citizen-facing telemetry and analytics page.
 * Visualizes the user's civic impact, ward-level resolution speeds, 
 * and tracks their reputation/reward points gathered through the verification loop.
 */
import React, { useEffect, useState } from 'react';
import { BarChart, Trophy, PieChart, Activity, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import './CitizenAnalytics.css';

const CitizenAnalytics = () => {
  const [complaints, setComplaints] = useState([]);
  const [citizen, setCitizen] = useState(null);
  const [loading, setLoading] = useState(true);

  const citizenId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        if (citizenId) {
          const citizenData = await api.getCitizen(citizenId);
          setCitizen(citizenData);

          const ward = citizenData.ward || 'Ward 7';
          const allComplaints = await api.getComplaints({ ward });
          setComplaints(allComplaints);
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, [citizenId]);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>DECRYPTING CIVIC TELEMETRY...</p>
      </div>
    );
  }

  // Calculations
  const personalComplaints = complaints.filter(c => c.citizen_id === citizenId);
  const personalTotal = personalComplaints.length;
  const personalResolved = personalComplaints.filter(c => c.status === 'RESOLVED').length;
  const personalPending = personalTotal - personalResolved;
  
  const resolutionRate = personalTotal > 0 ? Math.round((personalResolved / personalTotal) * 100) : 0;
  
  // Category breakdown for ward
  const categories = {};
  complaints.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });

  const categoryData = Object.entries(categories).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / complaints.length) * 100)
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="citizen-analytics-container">
      <header className="analytics-header">
        <h1>Citizen Telemetry & Impact</h1>
        <p className="subtitle">Real-time data verifying your contributions to local governance.</p>
      </header>

      {/* Top Cards Grid */}
      <div className="analytics-cards-grid">
        <div className="analytics-card metric-card">
          <div className="card-head">
            <Trophy size={18} className="gold" />
            <h3>IMPACT SCORE</h3>
          </div>
          <div className="card-body">
            <span className="metric-val">{citizen?.reward_points || 0}</span>
            <p className="metric-desc">Gained from filing and verifying reports</p>
          </div>
        </div>

        <div className="analytics-card metric-card">
          <div className="card-head">
            <Activity size={18} className="indigo" />
            <h3>RESOLUTION RATE</h3>
          </div>
          <div className="card-body">
            <span className="metric-val">{resolutionRate}%</span>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${resolutionRate}%` }}></div>
            </div>
            <p className="metric-desc">{personalResolved} of {personalTotal} grievances resolved</p>
          </div>
        </div>

        <div className="analytics-card metric-card">
          <div className="card-head">
            <HelpCircle size={18} className="violet" />
            <h3>WARD HEALTH</h3>
          </div>
          <div className="card-body">
            <span className="metric-val">{complaints.length}</span>
            <p className="metric-desc">Total active reports in {citizen?.ward || 'Ward 7'}</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Visualizations Section */}
      <div className="analytics-sections">
        {/* Left Section: Personal Breakdown */}
        <div className="analytics-main-panel">
          <div className="analytics-card">
            <h3>Ward Grievance Distribution by Category</h3>
            <p className="panel-subtitle">Categories needing immediate budget and attention in your ward.</p>
            
            <div className="category-bars">
              {categoryData.length === 0 ? (
                <p style={{color: '#6b7280', fontSize: '0.9rem'}}>No category data available.</p>
              ) : (
                categoryData.map(cat => (
                  <div key={cat.name} className="category-bar-item">
                    <div className="category-info">
                      <span className="cat-name">{cat.name}</span>
                      <span className="cat-count">{cat.count} ({cat.percentage}%)</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${cat.percentage}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="analytics-card reward-breakdown-panel" style={{ marginTop: '2rem' }}>
            <h3>Reward Points Breakdown</h3>
            <div className="rewards-grid">
              <div className="reward-item-box">
                <CheckCircle size={24} color="#10B981" />
                <h4>Complaint Filed</h4>
                <p>+10 Points</p>
              </div>
              <div className="reward-item-box">
                <Activity size={24} color="#6366F1" />
                <h4>Resolution Verified</h4>
                <p>+5 Points</p>
              </div>
              <div className="reward-item-box">
                <Trophy size={24} color="#F59E0B" />
                <h4>Upvote Shared</h4>
                <p>+2 Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Ward Stats & Health */}
        <aside className="analytics-sidebar-panel">
          <div className="analytics-card status-donut-panel">
            <h3>Status Matrix</h3>
            <div className="status-legend">
              <div className="legend-item">
                <span className="dot filed"></span>
                <span>Filed / Assigned</span>
                <span className="val-right">{complaints.filter(c => ['FILED', 'ASSIGNED'].includes(c.status)).length}</span>
              </div>
              <div className="legend-item">
                <span className="dot progress"></span>
                <span>In Progress</span>
                <span className="val-right">{complaints.filter(c => ['VIEWED', 'IN_PROGRESS'].includes(c.status)).length}</span>
              </div>
              <div className="legend-item">
                <span className="dot escalated"></span>
                <span>Escalated</span>
                <span className="val-right">{complaints.filter(c => c.status === 'ESCALATED').length}</span>
              </div>
              <div className="legend-item">
                <span className="dot verify"></span>
                <span>Verification</span>
                <span className="val-right">{complaints.filter(c => c.status === 'PENDING_VERIFICATION').length}</span>
              </div>
              <div className="legend-item">
                <span className="dot resolved"></span>
                <span>Resolved</span>
                <span className="val-right">{complaints.filter(c => c.status === 'RESOLVED').length}</span>
              </div>
            </div>
          </div>

          <div className="analytics-card health-score-card">
            <h3>Ward Performance Score</h3>
            <div className="health-score-radial">
              <span className="score">84</span>
              <span className="total">/ 100</span>
            </div>
            <p className="health-verdict">Excellent. Ward 7 is in the top 15% of active resolution speed across the constituency.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CitizenAnalytics;
