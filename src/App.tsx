// App.tsx
import React, { useEffect } from 'react';
import { DashboardProvider, useDashboard } from './store/DashboardContext';
import { SearchBar } from './components/SearchBar';
import { MachineDataGrid } from './components/MachineDataGrid';
import { fetchSearchResults } from './api/client';
import './App.css';

const DashboardContent = () => {
  const { setMachines, theme, setTheme } = useDashboard();

  useEffect(() => {
    // Initial load
    fetchSearchResults('').then(setMachines);
  }, [setMachines]);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2>Fleet Command</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="nav-item active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Overview</span>
            </li>
            <li className="nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10" />
                <path d="M12 20V4" />
                <path d="M6 20v-6" />
              </svg>
              <span>Analytics</span>
            </li>
            <li className="nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <span>Settings</span>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <span>Toggle Theme</span>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1>Telemetry Overview</h1>
            <p className="subtitle">Real-time machine monitoring dashboard</p>
          </div>
          <div className="top-bar-right">
            <SearchBar />
          </div>
        </header>
        <section className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon online">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">14</span>
              <span className="stat-label">Online</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon offline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">3</span>
              <span className="stat-label">Offline</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon maintenance">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">3</span>
              <span className="stat-label">Maintenance</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">20</span>
              <span className="stat-label">Total Fleet</span>
            </div>
          </div>
        </section>
        <section className="data-section">
          <div className="section-header">
            <h2>Machine Fleet</h2>
            <span className="live-indicator">
              <span className="live-dot"></span>
              LIVE
            </span>
          </div>
          <MachineDataGrid />
        </section>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
