import React, { useState, useEffect } from 'react';
import { Target, FileDown, RefreshCw, TrendingUp, Users, MapPin, Zap, Check, FileText } from 'lucide-react';
import { api } from '../services/api';
import '../pages/Dashboard.css';
import { useToast } from '../components/Toast';
import TenderModal from '../components/TenderModal';

const MpPriorityRanker = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [manageTenderProject, setManageTenderProject] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      const sorted = Array.isArray(data) ? data.sort((a, b) => a.rank - b.rank) : [];
      setProjects(sorted);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch development recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApprove = async (projectId) => {
    setActionLoading(prev => ({ ...prev, [projectId]: true }));
    try {
      await api.approveProject(projectId);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, approved: true } : p));
      showToast('Project approved successfully.', 'success');
    } catch (err) {
      console.error('Failed to approve project:', err);
      showToast('Error approving project. Please try again.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await api.generateProjects();
      const sorted = Array.isArray(data) ? data.sort((a, b) => a.rank - b.rank) : [];
      setProjects(sorted);
      showToast('AI Clustering Complete: New recommendations generated.', 'success');
    } catch (err) {
      console.error('Failed to generate projects:', err);
      showToast('Error clustering complaints.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (val) => {
    if (!val) return '₹0';
    if (val >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(1)} Cr`;
    }
    if (val >= 100000) {
      return `₹ ${(val / 100000).toFixed(0)} L`;
    }
    return `₹ ${val.toLocaleString('en-IN')}`;
  };

  const getCritBadge = (crit) => {
    const c = String(crit).toUpperCase();
    if (c === 'CATASTROPHIC' || c === 'CRITICAL') return 'badge-severe';
    if (c === 'HIGH' || c === 'ELEVATED') return 'badge-high';
    return 'badge-resolved';
  };

  return (
    <div className="dashboard-body" style={{ backgroundColor: 'transparent' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div className="page-title">
            <h1 style={{ fontFamily: 'Space Grotesk', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Target color="#A78BFA" />
              AI PRIORITY RANKER
            </h1>
          </div>
          <div className="system-status">
            DATA-DRIVEN DEVELOPMENT RECOMMENDATIONS // OPTIMAL ALLOCATIONS ENGINE
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-secondary" 
            onClick={handleGenerate}
            disabled={loading}
            style={{ fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> GENERATE PROJECT REPORTS
          </button>
          <button 
            className="btn-primary" 
            onClick={() => showToast('Compiling high-resolution PDF report...', 'success')}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <FileDown size={14} /> EXPORT PDF REPORT
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
          <div className="loading-spinner"></div>
          <span style={{ marginLeft: '1rem', fontFamily: 'monospace' }}>COMPUTING OPTIMAL ALLOCATIONS...</span>
        </div>
      ) : error ? (
        <div style={{ color: 'var(--cyber-rose)', padding: '2rem', border: '1px dashed var(--cyber-rose)', borderRadius: '12px', textAlign: 'center' }}>
          {error}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', padding: '2rem', border: '1px dashed var(--border-glass)', borderRadius: '12px', textAlign: 'center' }}>
          No development recommendations generated yet. Click "RE-RUN AI ENGINE" to cluster active citizen complaints.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {projects.map((project, idx) => {
            const isApproved = project.approved;
            const borderCol = idx === 0 ? 'var(--cyber-indigo)' : (idx === 1 ? 'var(--cyber-emerald)' : 'var(--border-glass)');
            const bgGlow = idx === 0 ? 'rgba(99, 102, 241, 0.05)' : (idx === 1 ? 'rgba(16, 185, 129, 0.05)' : 'none');
            const rankBg = idx === 0 
              ? 'linear-gradient(135deg, var(--cyber-indigo) 0%, var(--cyber-violet) 100%)' 
              : 'linear-gradient(135deg, var(--cyber-emerald) 0%, var(--cyber-cyan) 100%)';
            
            return (
              <div 
                key={project.id}
                className="queue-section" 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  border: '1px solid var(--border-glass)',
                  borderTop: `3px solid ${borderCol}`,
                  borderRadius: '16px',
                  boxShadow: `0 8px 32px ${bgGlow}`
                }}
              >
                {/* Header Area */}
                <div 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                    padding: '1.25rem 2rem', 
                    borderBottom: '1px solid var(--border-glass)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div 
                      style={{ 
                        background: rankBg, 
                        color: 'white', 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontFamily: 'Space Grotesk', 
                        fontWeight: 'bold', 
                        fontSize: '16px',
                        boxShadow: '0 0 12px rgba(99, 102, 241, 0.2)'
                      }}
                    >
                      {project.rank || (idx + 1)}
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.15rem', fontFamily: 'Space Grotesk', fontWeight: 700, color: 'white' }}>
                        {project.title}
                      </h2>
                      <small style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
                        ID: {project.id?.substring(0, 8).toUpperCase()} // SCHEME: {Array.isArray(project.scheme_eligible) ? project.scheme_eligible.join(', ').toUpperCase() : 'GENERAL'}
                      </small>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {isApproved ? (
                      <button 
                        className="btn-primary" 
                        onClick={() => setManageTenderProject(project)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <FileText size={14} /> MANAGE TENDER
                      </button>
                    ) : (
                      <button 
                        className="btn-primary" 
                        onClick={() => handleApprove(project.id)}
                        disabled={actionLoading[project.id]}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                      >
                        {actionLoading[project.id] ? 'AUTHORIZING...' : 'APPROVE FOR DPR'}
                      </button>
                    )}
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-glass)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                      {String(project.ward).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Main Area */}
                <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
                  <div 
                    style={{ 
                      backgroundColor: idx === 0 ? 'rgba(99, 102, 241, 0.03)' : 'rgba(16, 185, 129, 0.03)', 
                      border: idx === 0 ? '1px solid rgba(99, 102, 241, 0.12)' : '1px solid rgba(16, 185, 129, 0.12)', 
                      borderRadius: '12px', 
                      padding: '1.5rem' 
                    }}
                  >
                    <h3 style={{ fontSize: '0.72rem', color: idx === 0 ? '#A78BFA' : '#34D399', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      <Zap size={14} color={idx === 0 ? '#A78BFA' : '#34D399'} /> AI Synthesized Telemetry Brief
                    </h3>
                    <p style={{ color: '#E2E8F0', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                      {project.ai_recommendation}
                    </p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>CITIZEN COMPLAINTS</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Space Grotesk', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {project.complaint_count} <TrendingUp size={16} color="var(--cyber-rose)" />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>EST BUDGET</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--cyber-emerald)' }}>
                        {formatBudget(project.budget_estimate)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>POPULATION AFFECTED</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Space Grotesk', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={18} color="var(--text-muted)" /> {project.population_affected?.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>CRITICALITY LEVEL</div>
                      <div style={{ display: 'inline-flex', marginTop: '2px' }}>
                        <span className={`badge ${getCitBadge(project.criticality_max)}`}>{project.criticality_max}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {manageTenderProject && (
        <TenderModal 
          project={manageTenderProject} 
          onClose={() => setManageTenderProject(null)} 
          onAwarded={() => {
            setManageTenderProject(null);
            fetchProjects(); // Refresh if we need to show changes
          }} 
        />
      )}
    </div>
  );
};

export default MpPriorityRanker;
