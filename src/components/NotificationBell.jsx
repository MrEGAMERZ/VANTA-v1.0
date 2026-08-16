import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Info, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { WS_URL } from '../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load existing notifications from localStorage
    const saved = localStorage.getItem('samadhan_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (e) {
        console.error('Failed to parse notifications:', e);
      }
    }

    // Connect to WebSocket
    let ws;
    try {
      ws = new WebSocket(`${WS_URL}/map`);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { event: eventType, data } = payload;

          let title = 'System Update';
          let message = 'A new event was registered in the database.';
          let type = 'info';
          let link = '';

          if (eventType === 'NEW_COMPLAINT') {
            title = 'New Complaint Filed';
            message = `Grievance registered in ${data.ward || 'Constituency'}: "${data.text_content?.substring(0, 40)}..."`;
            type = 'warning';
            link = `/official/complaint/${data.id}`;
          } else if (eventType === 'STATUS_CHANGE') {
            title = 'Incident Status Update';
            message = `Ticket #${data.id?.substring(0, 8).toUpperCase()} status changed to ${data.status}.`;
            type = data.status === 'RESOLVED' ? 'success' : (data.status === 'ESCALATED' ? 'error' : 'info');
            link = `/official/complaint/${data.id}`;
          } else if (eventType === 'ESCALATION_SWEEP') {
            title = 'Administrative Auto-Escalation';
            message = `${data.count} breached tickets reallocated up the tier chain.`;
            type = 'error';
            link = `/official/escalations`;
          }

          const newNotification = {
            id: String(Date.now()),
            title,
            message,
            type,
            link,
            time: new Date().toLocaleTimeString(),
            read: false
          };

          setNotifications(prev => {
            const updated = [newNotification, ...prev].slice(0, 20); // Keep last 20
            localStorage.setItem('samadhan_notifications', JSON.stringify(updated));
            setUnreadCount(updated.filter(n => !n.read).length);
            return updated;
          });
        } catch (err) {
          console.error('Error handling WS notification message:', err);
        }
      };
    } catch (e) {
      console.warn('Notification WS failed:', e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read when opening
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, read: true }));
        localStorage.setItem('samadhan_notifications', JSON.stringify(updated));
        setUnreadCount(0);
        return updated;
      });
    }
  };

  const handleNotificationClick = (n) => {
    setIsOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('samadhan_notifications');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={14} color="#10B981" />;
      case 'error': return <AlertTriangle size={14} color="#EF4444" />;
      case 'warning': return <Info size={14} color="#F59E0B" />;
      default: return <MessageSquare size={14} color="#3B82F6" />;
    }
  };

  return (
    <div className="notification-bell-container">
      <button className="bell-btn" onClick={handleToggle}>
        <Bell size={20} color="#fff" />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="nd-header">
            <span>COMMAND FEED</span>
            <button className="clear-btn" onClick={clearNotifications}>Clear All</button>
          </div>
          
          <div className="nd-body">
            {notifications.length === 0 ? (
              <div className="empty-nd">
                <Info size={24} />
                <p>Telemetry log is empty. Standing by...</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="nd-item" onClick={() => handleNotificationClick(n)}>
                  <div className="nd-item-title">
                    {getIcon(n.type)}
                    <h4>{n.title}</h4>
                    <span className="nd-time">{n.time}</span>
                  </div>
                  <p>{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
