const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  return `${window.location.origin}/api`;
};

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'ws://localhost:8000/ws';
  }
  return `${protocol}//${window.location.host}/ws`;
};

const BASE_URL = getApiUrl();
const WS_URL = getWsUrl();

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('user_token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_role');
    window.location.href = '/';
  }
  
  return response;
};

export const api = {
  // Auth
  citizenRequestOtp: async (phone) => {
    const res = await authFetch(`${BASE_URL}/auth/citizen/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return res.json();
  },

  citizenVerifyOtp: async (phone, otp) => {
    const res = await authFetch(`${BASE_URL}/auth/citizen/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    return res.json();
  },

  officialLogin: async (email, password) => {
    const res = await authFetch(`${BASE_URL}/auth/official/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  officialRegister: async (profileData) => {
    const res = await authFetch(`${BASE_URL}/auth/official/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  // Complaints
  getComplaints: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    const res = await authFetch(`${BASE_URL}/complaints?${params.toString()}`);
    return res.json();
  },

  getComplaint: async (id) => {
    const res = await authFetch(`${BASE_URL}/complaints/${id}`);
    return res.json();
  },

  createComplaint: async (complaintData) => {
    const res = await authFetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData),
    });
    return res.json();
  },

  updateComplaintStatus: async (id, statusVal) => {
    const res = await authFetch(`${BASE_URL}/complaints/${id}/status?status_val=${statusVal}`, {
      method: 'PUT',
    });
    return res.json();
  },

  upvoteComplaint: async (id, citizenId) => {
    const res = await authFetch(`${BASE_URL}/complaints/${id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citizen_id: citizenId }),
    });
    return res.json();
  },

  // Map
  getMapPins: async () => {
    const res = await authFetch(`${BASE_URL}/map/pins`);
    return res.json();
  },

  getHeatmap: async () => {
    const res = await authFetch(`${BASE_URL}/map/heatmap`);
    return res.json();
  },

  // Scoreboard
  getMlaScoreboard: async () => {
    const res = await authFetch(`${BASE_URL}/officials/scoreboard`);
    return res.json();
  },

  getOfficials: async () => {
    const res = await authFetch(`${BASE_URL}/officials`);
    return res.json();
  },

  getOfficial: async (id) => {
    const res = await authFetch(`${BASE_URL}/officials/${id}`);
    return res.json();
  },

  // Resolution
  submitResolution: async (id, resolutionData) => {
    const res = await authFetch(`${BASE_URL}/complaints/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolutionData),
    });
    return res.json();
  },

  verifyResolution: async (id, citizenId, vote) => {
    const res = await authFetch(`${BASE_URL}/complaints/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citizen_id: citizenId, vote }),
    });
    return res.json();
  },

  // Admin Sweep
  runEscalationSweep: async () => {
    const res = await authFetch(`${BASE_URL}/admin/run-escalation`, {
      method: 'POST',
    });
    return res.json();
  },

  // Profiles
  getCitizen: async (id) => {
    const res = await authFetch(`${BASE_URL}/auth/citizen/${id}`);
    return res.json();
  },

  updateCitizenProfile: async (citizenId, profileData) => {
    const res = await authFetch(`${BASE_URL}/auth/citizen/profile?citizen_id=${citizenId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  updateOfficialProfile: async (officialId, profileData) => {
    const res = await authFetch(`${BASE_URL}/auth/official/profile?official_id=${officialId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return res.json();
  },

  // Projects
  getProjects: async () => {
    const res = await authFetch(`${BASE_URL}/projects`);
    return res.json();
  },

  generateProjects: async () => {
    const res = await authFetch(`${BASE_URL}/projects/generate`, {
      method: 'POST',
    });
    return res.json();
  },

  approveProject: async (id) => {
    const res = await authFetch(`${BASE_URL}/projects/${id}/approve`, {
      method: 'POST',
    });
    return res.json();
  },
};
export { WS_URL };
