import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, Shield, Zap, Search, Activity, Lock } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Header Navigation */}
      <header className="landing-header">
        <div className="landing-brand">SAMADHAN</div>
        <nav className="landing-nav">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#compliance">GIGW 3.0</a>
          <Link to="/portal" className="landing-nav-btn">Access Portal</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Next-Generation Civic Accountability Operating System</h1>
        <p className="hero-subtitle">
          SAMADHAN uses AI-driven intelligence to verify citizen reports, automate issue routing, and enforce strict accountability across all levels of government administration.
        </p>
        <div className="hero-cta">
          <Link to="/portal" className="btn-hero-primary">
            <Shield size={20} />
            Enter Official Command Center
          </Link>
          <Link to="/portal" className="btn-hero-secondary">
            Citizen Portal
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Core Intelligence Engines</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Search size={28} />
            </div>
            <h3>AI Fraud Detection</h3>
            <p>Our computer vision models analyze incoming photo evidence against citizen descriptions, immediately flagging potentially fake or misleading reports before dispatch.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Lock size={28} />
            </div>
            <h3>Anti-False-Closure</h3>
            <p>Issues cannot be unilaterally closed by officials. The system locks tickets in a verification state until the reporting citizen confirms the repair is complete.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={28} />
            </div>
            <h3>Auto-Escalation</h3>
            <p>If an official fails to resolve an issue within the SLA, the system automatically sweeps and reassigns the ticket up the chain of command, notifying higher authorities.</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="landing-brand">SAMADHAN</div>
            <p>A UX4G & GIGW 3.0 Compliant civic technology initiative bridging the gap between citizens and administration.</p>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#about">About SAMADHAN</a></li>
              <li><a href="#features">Core Engines</a></li>
              <li><Link to="/portal">Citizen Access</Link></li>
              <li><Link to="/portal">Official Access</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal & Compliance</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#accessibility">Accessibility Statement</a></li>
              <li><a href="#data">Data Policy</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#sitemap">Site Map</a></li>
              <li><a href="#api">API Documentation</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>&copy; 2026 SAMADHAN Governance Platform. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Activity size={16} /> Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
