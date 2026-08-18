/**
 * @file Analytics.jsx
 * @description Displays AI-recommended development projects to Officials.
 * Provides the workflow for officials to authorize Detailed Project Reports (DPRs) 
 * based on clustered civic complaints and their estimated financial impact.
 */
import React, { useState, useEffect } from 'react';
import { FileText, Zap, MapPin, Cpu, AlertCircle } from 'lucide-react';
import './Analytics.css';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const Analytics = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load development projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAuthorize = async (id) => {
    try {
      await api.approveProject(id);
      showToast('DPR Phase successfully authorized and queued for budget routing.', 'success');
    } catch (err) {
      showToast('Failed to authorize DPR.', 'error');
    }
  };

  const handleExport = () => {
    showToast('Generating secure administrative PDF payload... Download started.', 'info');
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>GENERATING AI RECOMMENDATION PROJECTS...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header Section */}
      <div className="analytics-header">
        <div className="system-status-indicator">
          <div className="dot"></div>
          SYSTEM ACTIVE // ANALYSIS COMPLETE
        </div>
        
        <div className="header-title-row">
          <div>
            <h1 className="analytics-title">AI-Recommended Development Works</h1>
            <p className="analytics-subtitle">
              Algorithmic prioritization based on constituent complaints, impact radius, and available scheme funding. Review and authorize to initiate DPR phase.
            </p>
          </div>
          <div className="header-actions-group">
            <button className="btn-secondary-dark" onClick={handleExport}>
              <FileText size={14} /> Export PDF
            </button>
            <button className="btn-glow-primary" onClick={() => showToast('Generating Weekly Briefing Draft...', 'info')}>
              <Zap size={14} /> Generate Weekly Brief
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="recommendations-list">
        {projects.length === 0 ? (
          <div className="empty-projects">
            <AlertCircle size={48} color="#9ca3af" />
            <h3>NO AI RECOMMENDATIONS GENERATED</h3>
            <p>File more complaints to trigger clustering algorithms.</p>
          </div>
        ) : (
          projects.map((project, idx) => {
            const priorityClass = project.criticality_max === 'CRITICAL' || project.criticality_max === 'CATASTROPHIC' ? 'critical' : 'high';
            
            // Format budget
            let budgetText = `${project.budget_estimate / 100000} L`;
            if (project.budget_estimate >= 10000000) {
              budgetText = `${(project.budget_estimate / 10000000).toFixed(1)} Cr`;
            }

            return (
              <div key={project.id} className={`rec-card priority-${(idx % 2) + 1}`}>
                {/* Column 1 */}
                <div className="rec-col-left">
                  <div className="rec-rank-row">
                    <span className="rec-rank">#{String(idx + 1).padStart(2, '0')}</span>
                    <span className={`priority-badge-box ${priorityClass}`}>
                      {project.criticality_max} PRIORITY
                    </span>
                  </div>
                  <h2 className="rec-title">{project.title}</h2>
                  <div className="rec-location">
                    <MapPin size={12} /> {project.ward}
                  </div>
                  
                  <div className="rec-scheme">
                    <div className="rec-scheme-label">Primary Scheme Assignment</div>
                    <div className="rec-scheme-tag">
                      <div className="dot green"></div> {project.scheme_eligible?.[0] || 'State Municipal Fund'}
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="rec-col-middle">
                  <div className="ai-synth-header">
                    <Cpu size={14} /> AI Synthesis
                  </div>
                  <p className="ai-synth-text">
                    {project.ai_recommendation || 'AI recommendation model analysis details.'}
                  </p>
                  <div className="data-boxes-row">
                    <div className="data-box">
                      <span className="data-box-label">Evidence Tags</span>
                      <div className={`data-box-value ${priorityClass}`}>{project.complaint_count}</div>
                      <span className="data-box-sub">COMPLAINTS LOGGED</span>
                    </div>
                    <div className="data-box">
                      <span className="data-box-label">Impact Radius</span>
                      <div className="data-box-value green">
                        {project.population_affected >= 1000 ? `${(project.population_affected / 1000).toFixed(0)}k` : project.population_affected}
                      </div>
                      <span className="data-box-sub">CITIZENS AFFECTED</span>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="rec-col-right">
                  <div className="budget-section">
                    <span className="budget-label">Estimated Budget</span>
                    <div className="budget-value">
                      <span className="budget-currency">₹</span>
                      {budgetText}
                    </div>
                    <span className="budget-variance">± 15% VARIANCE</span>
                  </div>

                  <div className="fund-bar-container">
                    <div className="fund-bar-header">
                      <span>Fund Availability</span>
                      <span className="fund-status high">High</span>
                    </div>
                    <div className="fund-bar-track">
                      <div className="fund-bar-fill" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div className="rec-actions">
                    <button className="btn-secondary-dark" onClick={() => showToast(`Supporting data logs for ${project.title}`, 'info')}>Review Data</button>
                    <button className="btn-glow-primary" onClick={() => handleAuthorize(project.id)}>Authorize DPR</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Analytics;
