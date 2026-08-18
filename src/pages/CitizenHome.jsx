/**
 * @file CitizenHome.jsx
 * @description Landing dashboard for the Citizen Portal.
 * Displays high-level personal statistics, recent issue statuses, 
 * and community-driven verification actions.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, CheckCircle2, Clock, PlusCircle, AlertCircle, 
  MapPin, Trophy, ShieldAlert, ChevronRight, MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import './CitizenHome.css';

const CitizenHome = () => {
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const citizenId = localStorage.getItem('user_id');
  const citizenName = localStorage.getItem('user_name') || 'Citizen';

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        if (citizenId) {
          const citizenData = await api.getCitizen(citizenId);
          setCitizen(citizenData);
          
          // Fetch ward complaints
          const ward = citizenData.ward || 'Ward 7';
          const allComplaints = await api.getComplaints({ ward });
          // Sort by filed_at descending
          const sorted = allComplaints.sort((a, b) => new Date(b.filed_at) - new Date(a.filed_at));
          setComplaints(sorted);
        }
      } catch (err) {
        console.error('Error fetching citizen home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [citizenId]);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Personal stats
  const personalComplaints = complaints.filter(c => c.citizen_id === citizenId);
  const totalFiled = personalComplaints.length;
  const totalResolved = personalComplaints.filter(c => c.status === 'RESOLVED').length;
  const totalPending = personalComplaints.filter(c => ['FILED', 'ASSIGNED', 'VIEWED', 'IN_PROGRESS', 'ESCALATED', 'PENDING_VERIFICATION'].includes(c.status)).length;
  
  // Ward stats
  const wardComplaints = complaints;
  const wardPending = wardComplaints.filter(c => c.status !== 'RESOLVED').length;

  return (
    <div className="citizen-home-container">
      {/* Welcome Banner */}
      <header className="welcome-banner">
        <div className="welcome-info">
          <span className="clearance-badge">Citizen Dashboard</span>
          <h1>Welcome, {citizen?.name || citizenName}</h1>
          <p className="location-detail">
            <MapPin size={16} className="text-accent" />
            <span>{citizen?.ward || 'Ward 7'}, {citizen?.district || 'Bengaluru South'}</span>
          </p>
        </div>
        <div className="reward-badge">
          <Trophy size={20} color="#EAB308" />
          <div>
            <span className="reward-points">{citizen?.reward_points || 0}</span>
            <span className="reward-label">Citizen Reward Points</span>
          </div>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="home-grid">
        {/* Left Column: Stats & Actions */}
        <div className="home-main">
          {/* Stats Bar */}
          <section className="stats-strip">
            <div className="stat-card">
              <div className="stat-icon filed"><FileText size={20} /></div>
              <div className="stat-data">
                <span className="stat-val">{totalFiled}</span>
                <span className="stat-lbl">Filed by You</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pending"><Clock size={20} /></div>
              <div className="stat-data">
                <span className="stat-val">{totalPending}</span>
                <span className="stat-lbl">In Progress</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon resolved"><CheckCircle2 size={20} /></div>
              <div className="stat-data">
                <span className="stat-val">{totalResolved}</span>
                <span className="stat-lbl">Resolved Tickets</span>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions-section">
            <h2>Quick Actions</h2>
            <div className="action-cards">
              <div className="action-card highlight" onClick={() => navigate('/citizen/file-report')}>
                <PlusCircle size={32} />
                <h3>File New Report</h3>
                <p>Submit a new localized grievance with AI-assisted voice translation & tagging.</p>
                <span className="action-btn">Report Issue <ChevronRight size={14} /></span>
              </div>

              <div className="action-card" onClick={() => navigate('/citizen/issues')}>
                <MessageSquare size={32} />
                <h3>Community Issues</h3>
                <p>Inspect existing reports in your ward, upvote issues, and verify official resolutions.</p>
                <span className="action-btn">Explore Database <ChevronRight size={14} /></span>
              </div>
            </div>
          </section>

          {/* Recent Ward Feed */}
          <section className="ward-feed-section">
            <div className="section-header">
              <h2>Recent Activity in Your Ward ({citizen?.ward || 'Ward 7'})</h2>
              <Link to="/citizen/issues" className="view-all">View All Complaints</Link>
            </div>
            
            {wardComplaints.length === 0 ? (
              <div className="empty-feed">
                <AlertCircle size={32} />
                <p>No complaints filed in this ward yet. Secure perimeter active.</p>
              </div>
            ) : (
              <div className="feed-list">
                {wardComplaints.slice(0, 3).map(c => (
                  <div key={c.id} className="feed-item" onClick={() => navigate(`/official/complaint/${c.id}`)}>
                    <div className="feed-item-header">
                      <span className={`status-pill ${c.status.toLowerCase()}`}>{c.status}</span>
                      <span className="feed-item-time">{new Date(c.filed_at).toLocaleDateString()}</span>
                    </div>
                    <p className="feed-item-content">{c.text_content}</p>
                    <div className="feed-item-meta">
                      <span className="category-tag">{c.category}</span>
                      <span className="priority-stars">{'★'.repeat(c.star_rating)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Information & Guidelines */}
        <aside className="home-sidebar-intel">
          <div className="intel-card">
            <div className="intel-header">
              <ShieldAlert size={20} color="#6366F1" />
              <h3>HOW SAMADHAN WORKS</h3>
            </div>
            <p>Every grievance filed is categorized in real-time by the Gemini AI core. Higher severity issues route automatically to ward MLAs or District Collectors.</p>
            <ul className="intel-rules">
              <li>Auto-escalation triggers on deadline breaches.</li>
              <li>Fake files result in accountability penalty actions.</li>
              <li>Resolution verification requires user verification votes.</li>
            </ul>
          </div>

          <div className="intel-card points-card">
            <h3>CITIZEN REWARDS</h3>
            <p>Earn points by participating in local governance:</p>
            <div className="points-rule">
              <span className="pts">+10 Pts</span>
              <span className="rule-lbl">Filing a verified complaint</span>
            </div>
            <div className="points-rule">
              <span className="pts">+5 Pts</span>
              <span className="rule-lbl">Voting on resolution verification</span>
            </div>
            <div className="points-rule">
              <span className="pts">+2 Pts</span>
              <span className="rule-lbl">Upvoting active ward issues</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CitizenHome;
