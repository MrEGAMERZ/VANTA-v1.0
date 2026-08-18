import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Portal from './pages/Portal';
import CitizenLogin from './pages/CitizenLogin';
import OfficialLogin from './pages/OfficialLogin';
import OfficialLayout from './components/OfficialLayout';
import OfficialDashboard from './pages/OfficialDashboard';
import Constituency from './pages/Constituency';
import Escalations from './pages/Escalations';
import Analytics from './pages/Analytics';
import ComplaintDetail from './pages/ComplaintDetail';
import MlaLayout from './components/MlaLayout';
import MlaDashboard from './pages/MlaDashboard';
import CitizenLayout from './components/CitizenLayout';
import CitizenReport from './pages/CitizenReport';
import CitizenIssues from './pages/CitizenIssues';
import MpLayout from './components/MpLayout';
import MpDashboard from './pages/MpDashboard';
import MpOverview from './pages/MpOverview';
import MpPriorityRanker from './pages/MpPriorityRanker';
import MpMlaScoreboard from './pages/MpMlaScoreboard';
import CitizenProfile from './pages/CitizenProfile';
import OfficialProfile from './pages/OfficialProfile';
import CitizenHome from './pages/CitizenHome';
import CitizenAnalytics from './pages/CitizenAnalytics';
import TransparencyLedger from './pages/TransparencyLedger';
import NotFound from './pages/NotFound';
import { AuthGuard } from './services/authGuard';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <Router>
      <Routes>
        <Route path="/" element={<Portal />} />
        
        {/* Login Routes */}
        <Route path="/login/official" element={<OfficialLogin />} />
        <Route path="/login/citizen" element={<CitizenLogin />} />

        {/* MP Portal Routes */}
        <Route element={<AuthGuard allowedRoles={['MP']} />}>
          <Route element={<MpLayout />}>
            <Route path="/mp/dashboard" element={<MpDashboard />} />
            <Route path="/mp/overview" element={<MpOverview />} />
            <Route path="/mp/priority" element={<MpPriorityRanker />} />
            <Route path="/mp/mlas" element={<MpMlaScoreboard />} />
          </Route>
        </Route>

        {/* Citizen Portal Routes */}
        <Route element={<AuthGuard allowedRoles={['CITIZEN']} />}>
          <Route element={<CitizenLayout />}>
            <Route path="/citizen/file-report" element={<CitizenReport />} />
            <Route path="/citizen/issues" element={<CitizenIssues />} />
            <Route path="/citizen/profile" element={<CitizenProfile />} />
            <Route path="/citizen/home" element={<CitizenHome />} />
            <Route path="/citizen/analytics" element={<CitizenAnalytics />} />
            <Route path="/citizen/ledger" element={<TransparencyLedger />} />
          </Route>
        </Route>

        {/* Official Protected Routes */}
        <Route element={<AuthGuard allowedRoles={['MLA', 'COLLECTOR', 'MP', 'MINISTRY']} />}>
          <Route element={<OfficialLayout />}>
            <Route path="/official/dashboard" element={<OfficialDashboard />} />
            <Route path="/official/constituency" element={<Constituency />} />
            <Route path="/official/escalations" element={<Escalations />} />
            <Route path="/official/analytics" element={<Analytics />} />
            <Route path="/official/profile" element={<OfficialProfile />} />
          </Route>
          {/* Official Standalone Routes */}
          <Route path="/official/complaint/:id" element={<ComplaintDetail />} />
        </Route>

        {/* MLA Routes */}
        <Route element={<AuthGuard allowedRoles={['MLA']} />}>
          <Route element={<MlaLayout />}>
            <Route path="/mla/dashboard" element={<MlaDashboard />} />
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </ToastProvider>
  );
}

export default App;
