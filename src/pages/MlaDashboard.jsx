import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, MapPin, Navigation, UserCheck, 
  CheckCircle2, Plus, AlertTriangle
} from 'lucide-react';
import './MlaDashboard.css';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const MlaDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [feed, setFeed] = React.useState([]);
  const [mlaInfo, setMlaInfo] = React.useState(null);
  const [userName, setUserName] = React.useState('Hon. MLA');

  const fetchDashboardData = async () => {
    try {
      const mlaId = localStorage.getItem('user_id') || 'default-mla-id';
      const name = localStorage.getItem('user_name') || 'Hon. MLA';
      setUserName(name);
      
      // Load Suresh's official profile stats
      const officials = await api.getOfficials();
      const profile = officials.find(o => o.id === mlaId) || officials.find(o => o.role === 'MLA') || officials[0];
      setMlaInfo(profile);

      // Load all complaints assigned to this MLA (or for Ward 7)
      const data = await api.getComplaints();
      const mlaComplaints = data.filter(c => c.assigned_to === profile.id);
      
      // Map to view structure
      const mapped = mlaComplaints.map(c => {
        const colorMap = {
          CATASTROPHIC: 'red',
          CRITICAL: 'red',
          HIGH: 'orange',
          ELEVATED: 'yellow',
          MODERATE: 'blue',
          ROUTINE: 'green'
        };
        const iconMap = {
          Water: '🚰',
          Roads: '🛣️',
          Sanitation: '🚱',
          Electrical: '💡',
          Health: '🏥',
          Education: '🏫'
        };
        
        // Calculate overdue days
        let overdueDays = null;
        if (c.status !== 'RESOLVED' && c.status !== 'ARCHIVED' && new Date(c.deadline_at) < new Date()) {
          const diffTime = Math.abs(new Date() - new Date(c.deadline_at));
          overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          id: c.id,
          criticality: c.criticality_level,
          title: c.text_original || c.text_content,
          stars: c.star_rating,
          category: c.category || 'General',
          location: c.location_address || 'Sector 4, Ward 7',
          affected: `${c.duplicate_count * 25 + 50} affected`,
          time: new Date(c.filed_at).toLocaleDateString(),
          status: c.status,
          overdueDays: overdueDays,
          colorClass: colorMap[c.criticality_level] || 'blue',
          icon: iconMap[c.category] || '🚧'
        };
      });

      setFeed(mapped);
    } catch (err) {
      console.error('Failed to load MLA data:', err);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleResolve = async (id) => {
    try {
      // Submit resolution
      await api.submitResolution(id, {
        resolution_note: "Issue successfully repaired and verified by Ward field squad.",
        resolution_action: "REPAIRED",
        amount_spent: 45000.0,
        resolution_photos: []
      });
      
      // Auto verify for quick hackathon demo feedback loop!
      const citizenId = localStorage.getItem('user_id') || 'dummy-citizen-id';
      await api.verifyResolution(id, citizenId, true);
      
      showToast('Issue status marked as RESOLVED and verified.', 'success');
      fetchDashboardData();
    } catch {
      showToast('Failed to resolve issue.', 'error');
    }
  };

  return (
    <div className="mla-container">
      {/* Header & Filter Bar */}
      <div className="mla-header-section">
        <div>
          <h1 className="mla-title">FIELD OPERATIONS — WARD 7–12</h1>
          <div className="mla-subtitle">{mlaInfo?.name || userName} · Accountability Score: {mlaInfo?.accountability_score || 74}/100 🟡 · {feed.filter(c => c.status !== 'RESOLVED').length} open complaints</div>
        </div>

        <div className="mla-filter-bar">
          <div className="filter-pills">
            <div className="pill-dropdown">All Criticality <ChevronDown size={14}/></div>
            <div className="pill-dropdown">All Categories <ChevronDown size={14}/></div>
            <div className="pill-dropdown">🗓️ Date <ChevronDown size={14}/></div>
            <div className="pill-dropdown">Sort: Criticality ↓ <ChevronDown size={14}/></div>
          </div>
          <button className="btn-report">
            <Plus size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} /> 
            Report Field Issue
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mla-main">
        
        {/* LEFT COLUMN: Issue Feed */}
        <div className="mla-left-col">
          {feed.map(item => (
            <div key={item.id} className="mla-card">
              <div className={`card-criticality-bar ${item.colorClass}`}></div>
              
              <div className="card-row-top">
                <span className={`c-badge ${item.criticality.toLowerCase()}`}>{item.criticality}</span>
                <h3 className="mla-card-title">{item.title}</h3>
                <div className="mla-card-stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < item.stars ? 'filled' : ''}`}>★</span>
                  ))}
                </div>
              </div>

              <div className="card-row-meta">
                <span className="meta-item">{item.icon} {item.category}</span>
                <span>·</span>
                <span className="meta-item"><MapPin size={12} /> {item.location}</span>
                <span>·</span>
                <span className="meta-item">{item.affected}</span>
                <span>·</span>
                <span className="meta-item">📅 {item.time}</span>
              </div>

              <div className="card-row-status">
                <span className={`status-chip ${item.status.toLowerCase().replace(' ', '-')}`}>
                  {item.status}
                </span>
                {item.overdueDays && (
                  <span className="overdue-text">⏰ OVERDUE by {item.overdueDays} days</span>
                )}
              </div>

              <div className="card-row-actions">
                <button className="ghost-btn details" onClick={() => navigate(`/official/complaint/${item.id}`)} style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Details
                </button>
                {item.status !== 'RESOLVED' && (
                  <button className="ghost-btn green" onClick={() => handleResolve(item.id)}>
                    <CheckCircle2 size={12} /> Resolve
                  </button>
                )}
                <button className="ghost-btn neutral">
                  <UserCheck size={12} /> Assign
                </button>
                <button className="ghost-btn violet">
                  <Navigation size={12} /> Navigate
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: Map & Stats */}
        <div className="mla-right-col">
          
          <div>
            <div className="ward-map-container">
              <div className="live-label">YOUR WARD — LIVE</div>
              {/* Simulated map pins */}
              <div className="map-pin red" style={{ top: '40%', left: '50%' }}></div>
              <div className="map-pin orange" style={{ top: '60%', left: '30%' }}></div>
              <div className="map-pin yellow" style={{ top: '30%', left: '70%' }}></div>
              <div className="map-pin green" style={{ top: '70%', left: '80%' }}></div>
            </div>
            
            <div className="map-stats-row">
              <span className="stat-red">🔴 {feed.filter(c => c.criticality === 'CRITICAL' && c.status !== 'RESOLVED').length} Critical</span>
              <span className="stat-orange">🟠 {feed.filter(c => c.criticality === 'HIGH' && c.status !== 'RESOLVED').length} High</span>
              <span className="stat-yellow">🟡 {feed.filter(c => c.criticality === 'ELEVATED' && c.status !== 'RESOLVED').length} Elevated</span>
              <span className="stat-green">🟢 {feed.filter(c => c.status === 'RESOLVED').length} Resolved</span>
            </div>
          </div>

          <div className="perf-panel">
            <div className="perf-header">MY PERFORMANCE</div>
            
            <div className="perf-score-row">
              <span className="perf-score">{mlaInfo?.accountability_score || 74}</span>
              <span className="perf-max">/100</span>
            </div>
            
            <div className="perf-track">
              <div className="perf-fill" style={{ width: `${mlaInfo?.accountability_score || 74}%` }}></div>
            </div>
            
            <div className="perf-mini-stats">
              <span>Assigned: {mlaInfo?.complaints_assigned || 89}</span> · 
              <span>Resolved: {mlaInfo?.complaints_resolved || 65}</span> · 
              <span>Avg: {mlaInfo?.avg_response_time || 11.2}d</span>
            </div>
          </div>

          <div className="warning-panel">
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              {feed.filter(c => c.status === 'ESCALATED').length} complaints escalated to MP due to inaction. Address these to improve your score.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MlaDashboard;
