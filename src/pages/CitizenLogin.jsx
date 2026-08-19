import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const CitizenLogin = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phone.length > 5) {
      try {
        const res = await api.citizenRequestOtp(phone);
        showToast(res.message || 'OTP Sent!', 'success');
        setStep('otp');
      } catch (err) {
        showToast('Failed to request OTP', 'error');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.citizenVerifyOtp(phone, otp);
      localStorage.setItem('user_token', data.access_token);
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_name', data.name);
      localStorage.setItem('user_id', data.id);
      localStorage.setItem('citizen_phone', phone);
      showToast('Logged in as Citizen successfully!', 'success');
      navigate('/citizen/file-report');
    } catch (err) {
      showToast('Invalid OTP code. Please try again.', 'error');
    }
  };

  const handleBypass = () => {
    localStorage.setItem('user_token', 'demo-citizen-token');
    localStorage.setItem('user_role', 'CITIZEN');
    localStorage.setItem('user_name', 'Demo Citizen');
    localStorage.setItem('user_id', 'demo-1234');
    localStorage.setItem('citizen_phone', '+919999999999');
    showToast('Bypassed login for demo!', 'success');
    navigate('/citizen/home');
  };

  return (
    <div className="auth-container">
      <div className="auth-modal">
        <Link to="/portal" className="back-link">
          <ArrowLeft size={16} /> Back to Portal
        </Link>
        
        <h1>Citizen Login</h1>
        <p className="subtitle">Report issues in your neighborhood</p>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit}>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                className="form-input"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Verify & Login
            </button>
            <button 
              type="button" 
              onClick={() => setStep('phone')} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', marginTop: '1rem', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Change Phone Number
            </button>
          </form>
        )}

        <div style={{ marginTop: '2rem', borderTop: '1px solid #1E1E35', paddingTop: '1rem', textAlign: 'center' }}>
          <button 
            onClick={handleBypass}
            style={{ background: '#1E1E35', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', width: '100%', fontWeight: 600 }}
          >
            Bypass Login (Hackathon Demo)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;
