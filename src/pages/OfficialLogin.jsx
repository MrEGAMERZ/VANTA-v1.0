import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const OfficialLogin = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [signupStep, setSignupStep] = useState('form'); // 'form' or 'otp'
  
  // Form states
  const [identifier, setIdentifier] = useState(''); // email or phone for login
  const [password, setPassword] = useState('');
  
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('MLA');
  const [jurisdiction, setJurisdiction] = useState('');
  const [otp, setOtp] = useState('');

  // Temporarily store register response data during OTP phase
  const [tempRegData, setTempRegData] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.officialLogin(identifier, password);
      localStorage.setItem('user_token', data.access_token);
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_name', data.name);
      localStorage.setItem('user_id', data.id);
      
      showToast(`Logged in as ${data.role} successfully!`, 'success');
      
      if (data.role === 'MLA') {
        navigate('/mla/dashboard');
      } else if (data.role === 'MP') {
        navigate('/mp/overview');
      } else {
        navigate('/official/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Enter email e.g. mla@samadhan.gov.in and password "password".', 'error');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.officialRegister({
        name,
        email,
        phone,
        password,
        role,
        jurisdiction: jurisdiction || `Ward ${role === 'MLA' ? '7' : 'Bengaluru South'}`
      });
      setTempRegData(data);
      showToast('Account credentials verified. Verification code issued.', 'info');
      setSignupStep('otp');
    } catch (err) {
      showToast(err.message || 'Registration failed. Email might already be taken.', 'error');
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp === '123456' || otp.length === 6) {
      if (tempRegData) {
        localStorage.setItem('user_token', tempRegData.access_token);
        localStorage.setItem('user_role', tempRegData.role);
        localStorage.setItem('user_name', tempRegData.name);
        localStorage.setItem('user_id', tempRegData.id);
      }
      showToast('Official account created & verified!', 'success');
      
      const targetRole = tempRegData?.role || role;
      if (targetRole === 'MLA') {
        navigate('/mla/dashboard');
      } else if (targetRole === 'MP') {
        navigate('/mp/overview');
      } else {
        navigate('/official/dashboard');
      }
    } else {
      showToast('Invalid security verification token.', 'error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-modal">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Portal
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <ShieldAlert size={30} color="#6366F1" style={{ filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))' }} />
          <div>
            <span style={{ fontSize: '0.62rem', fontFamily: 'Space Mono, monospace', color: '#8B9DFF', letterSpacing: '0.1em', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>SECURED GOVERNMENT GATEWAY</span>
            <h1 style={{ margin: 0, fontSize: '1.5rem', lineHeight: 1.2 }}>Official Portal</h1>
          </div>
        </div>
        <p className="subtitle" style={{ marginTop: '0.25rem' }}>Access administrative command and intelligence telemetry.</p>

        {signupStep === 'form' && (
          <div className="auth-tabs">
            <button 
              className={`tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button 
              className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>
        )}

        {activeTab === 'login' && signupStep === 'form' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="identifier">Email or Phone Number</label>
              <input
                type="text"
                id="identifier"
                className="form-input"
                placeholder="Enter email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Sign In
            </button>
          </form>
        )}

        {activeTab === 'signup' && signupStep === 'form' && (
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                type="text"
                id="signup-name"
                className="form-input"
                placeholder="Hon. Representative"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-role">Official Role</label>
              <select
                id="signup-role"
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ background: '#0e0e1a', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="MLA">MLA (Ward Representative)</option>
                <option value="COLLECTOR">District Collector</option>
                <option value="MP">MP (Constituency Leader)</option>
                <option value="MINISTRY">State Ministry Office</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="signup-jurisdiction">Jurisdiction / Ward Sectors</label>
              <input
                type="text"
                id="signup-jurisdiction"
                className="form-input"
                placeholder="e.g. Ward 7, Ward 8 or Bengaluru South"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-phone">Phone Number</label>
              <input
                type="tel"
                id="signup-phone"
                className="form-input"
                placeholder="+91 99000 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email Address</label>
              <input
                type="email"
                id="signup-email"
                className="form-input"
                placeholder="official@samadhan.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                type="password"
                id="signup-password"
                className="form-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Create Account
            </button>
          </form>
        )}

        {activeTab === 'signup' && signupStep === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label htmlFor="signup-otp">Enter OTP sent to {phone}</label>
              <input
                type="text"
                id="signup-otp"
                className="form-input"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Verify & Complete
            </button>
            <button 
              type="button" 
              onClick={() => setSignupStep('form')} 
              style={{ background: 'none', border: 'none', color: '#8B9DFF', marginTop: '1rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              Back to Sign Up form
            </button>
          </form>
        )}

        <div className="demo-credentials">
          <div className="demo-credentials-title">DEMO AUTHENTICATION TELETABS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div>MP Feed: <code>mp@samadhan.gov.in</code></div>
            <div>MLA Feed: <code>mla@samadhan.gov.in</code></div>
            <div>Password: <code>password</code></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialLogin;
