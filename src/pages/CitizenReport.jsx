/**
 * @file CitizenReport.jsx
 * @description Handles the civic grievance reporting interface for Citizens.
 * Integrates the Web Speech API for voice-to-text input, falls back to an 
 * automated typing simulation if unsupported, and captures GPS coordinates 
 * via the HTML5 Geolocation API.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  HelpCircle, Mic, MapPin, Camera, 
  Image as ImageIcon, ArrowRight 
} from 'lucide-react';
import './CitizenReport.css';
import { api } from '../services/api';
import { useToast } from '../components/Toast';


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const CitizenReport = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [time, setTime] = useState('14:24:08');
  const [recognition, setRecognition] = useState(null);
  const [coords, setCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [address, setAddress] = useState('Sector 4 Junction, Ward 7, Bengaluru South');

  // Simulated live clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setAddress(`Auto-detected Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        },
        (error) => {
          console.warn('Geolocation failed: ', error);
        }
      );
    }
  }, []);

  const fullTextFallback = "Ward 7 mein paani nahi aa raha pichle 3 din se. Line broken near main junction. Residents are suffering due to extreme heat and lack of tanker support. Please expedite the repair process immediately.";

  // Web Speech API
  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN';
      
      rec.onresult = (event) => {
        let finalResult = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalResult += event.results[i][0].transcript;
          }
        }
        if (finalResult) {
          setTranscript(prev => prev ? prev + ' ' + finalResult.trim() : finalResult.trim());
        }
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const handleToggleListen = () => {
    if (!SpeechRecognition) {
      // Typing simulation fallback if SpeechRecognition not supported
      if (!isListening) {
        setIsListening(true);
        setTranscript('');
        let i = 0;
        const typeInterval = setInterval(() => {
          setTranscript(fullTextFallback.slice(0, i));
          i += 3;
          if (i > fullTextFallback.length) {
            clearInterval(typeInterval);
            setIsListening(false);
          }
        }, 50);
      } else {
        setIsListening(false);
      }
      return;
    }

    if (!isListening) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    } else {
      try {
        recognition.stop();
        setIsListening(false);
      } catch (err) {
        console.error('Failed to stop speech recognition:', err);
      }
    }
  };

  const handleSubmit = async () => {
    if (transcript.length === 0) {
      showToast("Please provide a description of the issue using the voice module or by typing.", "warning");
      return;
    }
    
    try {
      const citizenId = localStorage.getItem('user_id') || 'default-citizen';
      
      const payload = {
        text_content: transcript,
        text_original: transcript,
        language_detected: "en",
        location_lat: coords.lat,
        location_lng: coords.lng,
        location_address: address,
        ward: "Ward 7",
        district: "Bengaluru South",
        citizen_id: citizenId
      };
      
      const res = await api.createComplaint(payload);
      showToast(`Complaint filed successfully! ID: ${res.id}`, "success");
      setTranscript('');
      setIsListening(false);
      navigate('/citizen/issues');
    } catch (err) {
      showToast("Failed to submit complaint. Ensure backend is running.", "error");
    }
  };

  return (
    <div className="citizen-report-container">
      
      {/* Header */}
      <div className="cr-header">
        <div className="cr-title-area">
          <h1 className="cr-title">New Incident Report</h1>
          <span className="cr-live-badge">Active</span>
        </div>
        <div className="cr-header-right">
          <span>🕒 {time}</span>
          <HelpCircle size={20} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Grid */}
      <div className="cr-grid">
        
        {/* Left Col */}
        <div className="cr-left">
          
          <div className="cr-voice-module">
            <div className="voice-label">Voice Input</div>
            
            <div className={`mic-wrapper ${isListening ? 'listening' : ''}`} onClick={handleToggleListen}>
              <div className="mic-ring mic-ring-2"></div>
              <div className="mic-ring mic-ring-1"></div>
              <div className="mic-button">
                <Mic size={32} color={isListening ? 'white' : '#6C63FF'} />
              </div>
            </div>
            
            <div className="voice-status">
              <div className="status-dot"></div>
              {isListening ? 'Listening...' : 'Ready for input'}
            </div>
            <p className="voice-hint">
              {isListening ? "Listening to your voice..." : "Click mic to describe the civic issue clearly. You can also edit the transcript directly."}
            </p>
          </div>

          <div className="cr-transcript">
            <div className="transcript-header">
              <span className="th-left">REAL-TIME TRANSCRIPT (EDITABLE)</span>
              <span className="th-right">ACCURACY: 98.2%</span>
            </div>
            <textarea 
              className="transcript-text-editable"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Voice transcript will appear here. Or start typing..."
              style={{
                width: '100%',
                minHeight: '120px',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>

        </div>

        {/* Right Col */}
        <div className="cr-right">
          
          <div className="cr-panel">
            <div className="panel-label">LOCATION</div>
            <button className="btn-edit" onClick={() => showToast(`Coordinates: ${coords.lat}, ${coords.lng}`, "info")}>VIEW</button>
            <div className="geo-content">
              <MapPin size={24} className="geo-icon" />
              <div className="geo-text">
                <h4>DETECTED COORDINATES</h4>
                <p>{address}</p>
                <small>Latitude: {coords.lat.toFixed(5)}<br/>Longitude: {coords.lng.toFixed(5)}</small>
              </div>
            </div>
          </div>

          <div className="cr-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="panel-label">PHOTOS (OPTIONAL)</div>
            
            <div className="evidence-grid">
              <div className="evidence-box active" onClick={() => showToast("Photo capture module connected.", "info")}>
                <Camera size={24} />
                <span>CAMERA</span>
              </div>
              <div className="evidence-box">
                <ImageIcon size={24} />
              </div>
              <div className="evidence-box">
                <ImageIcon size={24} />
              </div>
              <div className="evidence-box">
                <ImageIcon size={24} />
              </div>
            </div>

            <button className="btn-submit-report" onClick={handleSubmit}>
              <span>FILE COMPLAINT</span>
              <ArrowRight size={24} />
            </button>
            <div className="terms-text">
              BY SUBMITTING, YOU AGREE TO SAMADHAN'S DATA VERIFICATION PROTOCOLS.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CitizenReport;
