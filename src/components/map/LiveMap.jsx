/**
 * @file LiveMap.jsx
 * @description React-Leaflet Map Component with real-time WebSocket integration.
 * Plots civic complaints with custom color-coded markers based on criticality.
 * Falls back to local simulation if the WebSocket connection fails.
 */
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Make L available globally for leaflet-heat to attach itself
window.L = L;
import './leaflet-heat.js';

import 'leaflet/dist/leaflet.css';
import './LiveMap.css';
import { api, WS_URL } from '../../services/api';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CRITICALITY_COLORS = {
  CATASTROPHIC: '#000000',  // Black pulsing
  CRITICAL:     '#FF3B3B',  // Red pulsing
  HIGH:         '#FF8C00',  // Orange
  ELEVATED:     '#FFD700',  // Yellow
  MODERATE:     '#4A90D9',  // Blue
  ROUTINE:      '#00C896',  // Green
  RESOLVED:     '#2D5A3D',  // Dark green
};

const STAR_RADIUS = {
  1: 12,
  2: 16,
  3: 20,
  4: 24,
  5: 32,
};

const createCustomIcon = (criticality, stars) => {
  const color = CRITICALITY_COLORS[criticality] || CRITICALITY_COLORS.MODERATE;
  const size = STAR_RADIUS[stars] || 16;
  
  let animationClass = '';
  if (criticality === 'CATASTROPHIC') animationClass = 'pulse-catastrophic';
  if (criticality === 'CRITICAL') animationClass = 'pulse-critical';

  const html = `
    <div class="vanta-marker" style="width: ${size}px; height: ${size}px; color: ${color};">
      <div class="vanta-marker-inner ${animationClass}" style="background-color: ${color}"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-div-icon',
    html: html,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
};

const HeatmapLayer = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const heat = L.heatLayer(points, {
      radius: 30,
      blur: 20,
      maxZoom: 16,
      gradient: {
        0.2: '#00C896', // ROUTINE
        0.4: '#4A90D9', // MODERATE
        0.6: '#FFD700', // ELEVATED
        0.8: '#FF8C00', // HIGH
        1.0: '#FF3B3B'  // CRITICAL / CATASTROPHIC
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);
  return null;
};

// Component to handle zoom events
const MapEventLogic = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => {
      setZoomLevel(e.target.getZoom());
    },
  });
  return null;
};

const initialComplaints = [
  { id: 'V-101', lat: 12.9716, lng: 77.5946, criticality: 'CRITICAL', stars: 5, title: 'Main Water Line Burst', ward: 'Ward 7' },
  { id: 'V-102', lat: 12.9650, lng: 77.5900, criticality: 'HIGH', stars: 4, title: 'Streetlight Outage', ward: 'Ward 8' },
  { id: 'V-103', lat: 12.9750, lng: 77.6000, criticality: 'ELEVATED', stars: 3, title: 'Pothole on High Street', ward: 'Ward 7' },
  { id: 'V-104', lat: 12.9800, lng: 77.5800, criticality: 'MODERATE', stars: 2, title: 'Garbage Collection Delay', ward: 'Ward 9' },
  { id: 'V-105', lat: 12.9600, lng: 77.6100, criticality: 'ROUTINE', stars: 1, title: 'Park Bench Broken', ward: 'Ward 10' },
];

const LiveMap = ({ onMarkerClick }) => {
  const [complaints, setComplaints] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(13); // Default zoom


  const loadPins = async () => {
    try {
      const data = await api.getMapPins();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load map pins:', err);
    }
  };

  useEffect(() => {
    loadPins();

    // Setup real-time WebSocket connection
    let ws;
    try {
      ws = new WebSocket(`${WS_URL}/map`);
      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        console.log('WS Map Update Received:', payload);
        loadPins(); // Reload all pins when an update happens
      };
      ws.onerror = (err) => {
        console.warn('WebSocket error, falling back to polling/simulation:', err);
      };
    } catch (e) {
      console.warn('Failed to establish WebSocket:', e);
    }

    // Fallback simulation to keep the map dynamic during demo
    const wsSimulation = setInterval(() => {
      setComplaints(prev => {
        const action = Math.random();
        if (action > 0.7 && prev.length < 20) {
          const newLat = 12.9716 + (Math.random() - 0.5) * 0.05;
          const newLng = 77.5946 + (Math.random() - 0.5) * 0.05;
          const criticalities = ['CATASTROPHIC', 'CRITICAL', 'HIGH', 'ELEVATED', 'MODERATE', 'ROUTINE'];
          const randomCrit = criticalities[Math.floor(Math.random() * criticalities.length)];
          const randomStars = Math.floor(Math.random() * 5) + 1;
          
          return [...prev, {
            id: `V-LIVE-${Math.floor(Math.random()*1000)}`,
            lat: newLat,
            lng: newLng,
            criticality: randomCrit,
            stars: randomStars,
            title: 'Live Sensor / Citizen Report',
            ward: 'Auto-Detected'
          }];
        }
        return prev;
      });
    }, 8000);

    return () => {
      clearInterval(wsSimulation);
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className="map-container">
      {/* Zoom Indicator Overlay */}
      <div className="zoom-indicator">
        {zoomLevel < 15 ? "🔥 HEATMAP MODE: Zoom in to view individual pins" : "📍 PIN MODE: Tap pins to view details"}
      </div>

      <MapContainer 
        center={[12.9716, 77.5946]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', background: '#0F0F1A' }}
        zoomControl={false}
      >
        <MapEventLogic setZoomLevel={setZoomLevel} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        
        {/* Render Heatmap if zoomed out (< 15) */}
        {zoomLevel < 15 && (
          <HeatmapLayer 
            points={complaints.map(c => {
              // Intensity based on criticality / stars (1 to 5) -> scale to 0.1 - 1.0
              const intensity = (c.stars * 2) / 10;
              return [c.lat, c.lng, intensity];
            })} 
          />
        )}

        {/* Render Pins if zoomed in (>= 15) */}
        {zoomLevel >= 15 && complaints.map((complaint, idx) => (
          <Marker 
            key={`${complaint.id}-${idx}`} // Force re-render on update
            position={[complaint.lat, complaint.lng]}
            icon={createCustomIcon(complaint.criticality, complaint.stars)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(complaint);
                }
              }
            }}
          >
            <Popup className="vanta-popup">
              <h3 className="popup-title">{complaint.title}</h3>
              <div className="popup-meta">ID: {complaint.id}</div>
              <div className="popup-meta" style={{ color: CRITICALITY_COLORS[complaint.criticality] }}>
                [{complaint.criticality}] • {complaint.stars} STARS
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
