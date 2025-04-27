import { useAuth0 } from "@auth0/auth0-react";
import "./LandingPage.css"; // Keep this import
import logo from "../lib_dir/logo.png"; // Adjust the path as necessary
export default function LandingPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={logo}
            alt="Logo" 
            className="landing-logo"
          />
        </div>
        {useAuth0().isAuthenticated ? (
          <span>Welcome!</span>
        ) : (
          <button 
            className="landing-login-button"   
            onClick={() => loginWithRedirect()}
          >
            Sign In/Up
          </button>
        )}
      </header>

      <main>
        <section className="landing-hero-section">
          <h1 className="landing-hero-title">Track your gig income like a pro</h1>
          <p className="landing-hero-subtitle">Monitor, visualize, and optimize your earnings effortlessly</p>
          <button 
            className="landing-cta-button" 
            onClick={() => loginWithRedirect()}
          >
            Get Started
          </button>
        </section>

        <section className="landing-features-section">
          <h2 className="landing-section-title">Key Features</h2>
          <div>
            <h3 className="landing-section-subtitle">Bank Integration</h3>
            <p>Connect your accounts securely with Plaid. We don't store your data – we just display it.</p>
            
            <h3 className="landing-section-subtitle">Visual Analytics</h3>
            <p>Group all your sources of income into one place. You won't have to worry about filtering through <b>that</b> many bank accounts ever again.</p>
            
            <h3 className="landing-section-subtitle">Budget Categories</h3>
            <p>Manage your finances with our budgeting assistant. Set limits all in one place.</p>
          </div>
        </section>

        <section className="landing-team-section">
          <h2 className="landing-section-title">Meet the Team</h2>
          <div>
            <h3 className="landing-section-subtitle">ALI</h3>
            <p>Frontend Developer</p>
            
            <h3 className="landing-section-subtitle">Affan</h3>
            <p>Backend Developer</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2025 Income Hustlers. All rights reserved.</p>
      </footer>
    </div>
  );
}