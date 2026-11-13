
import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import InsightsPage from "./Pages/InsightsPage.jsx";
import DashboardPage from "./Pages/DashboardPage.jsx";
import SettingsPage from "./Pages/SettingsPage.jsx";
import { useTheme } from "./context/ThemeContext.jsx";

function HomePage() {
  return (
    <div className="home-hero">
      <div className="hero-content">
        <p className="eyebrow">Live sustainability intelligence</p>
        <h1>EcoTrack empowers better climate decisions.</h1>
        <p className="hero-copy">
          Monitor emissions, weather patterns, and actionable insights in one adaptive workspace.
          Pick a region, set your preferences, and let EcoTrack surface the biggest opportunities to cut impact.
        </p>
        <div className="hero-actions">
          <Link to="/dashboard" className="cta-button primary">
            Launch Dashboard
          </Link>
          <Link to="/insights" className="cta-button secondary">
            Explore Insights
          </Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat-card">
            <span>5 regions</span>
            <p>Powered by live EIA + OpenWeather data</p>
          </div>
          <div className="hero-stat-card">
            <span>Up to 20 yrs</span>
            <p>Historical emissions per state</p>
          </div>
          <div className="hero-stat-card">
            <span>Action feed</span>
            <p>Personalized eco-playbook added today</p>
          </div>
        </div>
      </div>
    </div>
  );
}



function App() {
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  const handleBackdropClick = () => {
    setMobileMenuOpen(false);
  };
  
  return (
    <div className={`app ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="brand">
            EcoTrack
          </Link>
        </div>
        <button 
          className={`mobile-menu-toggle ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        {mobileMenuOpen && (
          <div 
            className="mobile-menu-backdrop active"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
        )}
        <div className={`navbar-right ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/insights" className="nav-link">
            Insights
          </Link>
          <Link to="/settings" className="nav-link">
            Settings
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
