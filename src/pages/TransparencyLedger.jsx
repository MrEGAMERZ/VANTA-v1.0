import React, { useEffect, useState } from 'react';
import { ShieldCheck, IndianRupee, HardHat, FileText } from 'lucide-react';
import { api } from '../services/api';
import './TransparencyLedger.css';

const TransparencyLedger = () => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        const data = await api.authFetch('/api/transparency/ledgers');
        setLedgers(data);
      } catch (err) {
        console.error('Failed to load transparency ledgers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLedgers();
  }, []);

  if (loading) {
    return (
      <div className="ledger-loading">
        <h2>ACCESSING PUBLIC PROCUREMENT LEDGER...</h2>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="ledger-container">
      <header className="ledger-header">
        <h1>Public Transparency Ledger</h1>
        <p>Immutable record of infrastructure spending, contractor bids, and phase-wise payments for resolved community issues.</p>
      </header>

      {ledgers.length === 0 ? (
        <div className="ledger-empty">
          <ShieldCheck size={48} color="#6C63FF" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>NO PUBLIC LEDGERS AVAILABLE YET</h3>
          <p>Once a civic issue is resolved and contractor payments begin, the records will permanently appear here.</p>
        </div>
      ) : (
        <div className="ledger-grid">
          {ledgers.map((ledger) => (
            <div key={ledger.id} className="ledger-card">
              <div className="ledger-card-header">
                <div className="ledger-project-info">
                  <h2>{ledger.project_title}</h2>
                  <span className="ward-badge">{ledger.ward}</span>
                </div>
                <div className="ledger-status-badge">
                  {ledger.milestone_status.replace('_', ' ')}
                </div>
              </div>

              <div className="ledger-financials">
                <div className="fin-metric">
                  <span className="fin-label"><HardHat size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> CONTRACTOR</span>
                  <span className="fin-value">{ledger.contractor_name}</span>
                </div>
                <div className="fin-metric">
                  <span className="fin-label"><FileText size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> APPROVED BID</span>
                  <span className="fin-value accent">{formatCurrency(ledger.bid_amount)}</span>
                </div>
                <div className="fin-metric">
                  <span className="fin-label"><IndianRupee size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> FUNDS RELEASED</span>
                  <span className="fin-value">{formatCurrency(ledger.funds_released)}</span>
                </div>
              </div>

              {ledger.phase_wise_payments && ledger.phase_wise_payments.length > 0 && (
                <div className="ledger-phases">
                  <h3>Phase-Wise Payment Trajectory</h3>
                  <table className="phase-table">
                    <thead>
                      <tr>
                        <th>Phase / Milestone</th>
                        <th>Amount</th>
                        <th>Date of Clearance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.phase_wise_payments.map((payment, idx) => (
                        <tr key={idx}>
                          <td>{payment.phase}</td>
                          <td>{formatCurrency(payment.amount)}</td>
                          <td>{formatDate(payment.date)}</td>
                          <td className={payment.status === 'PAID' ? 'status-paid' : 'status-pending'}>
                            {payment.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransparencyLedger;
