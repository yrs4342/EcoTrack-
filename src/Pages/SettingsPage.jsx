import { useTheme } from "../context/ThemeContext.jsx";

function SettingsPage() {
  const { theme, changeTheme } = useTheme();

  return (
    <div className="page-container">
      <h1>Settings</h1>
      <p className="settings-description">
        Customize your EcoTrack experience with theme preferences and user settings.
      </p>

      <div className="settings-grid">
        <section className="settings-section">
          <h2>Theme Preferences</h2>
          <div className="settings-group">
            <span className="settings-label-text">Color Theme</span>
            <div className="theme-toggle-container">
              <div
                role="radiogroup"
                aria-label="Color Theme"
                className="theme-toggle-group"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={theme === "light"}
                  onClick={() => changeTheme("light")}
                  className={`theme-toggle-button ${theme === "light" ? "active" : ""}`}
                >
                  Light
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={theme === "dark"}
                  onClick={() => changeTheme("dark")}
                  className={`theme-toggle-button ${theme === "dark" ? "active" : ""}`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default SettingsPage;

