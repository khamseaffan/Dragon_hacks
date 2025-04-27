import { useAuth0 } from "@auth0/auth0-react";
import "./LandingPage.css"; // Keep this import
import logo from "../lib_dir/logo.png"; // Adjust the path as necessary
import plaidImg from "../lib_dir/plaid.png";
import bargraphImg from "../lib_dir/bargraph.png";
import expensegraphImg from "../lib_dir/expensegraph.png";

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
          <div className="feature-cards feature-cards-column">
            <div className="feature-card feature-card-wide">
              <img src={plaidImg} alt="Plaid Integration" className="feature-image feature-image-large feature-image-vertical" />
              <div className="feature-card-content">
                <h3 className="landing-section-subtitle">Bank Integration</h3>
                <p>Connect your accounts securely with Plaid. We don't store your data – we just display it.</p>
              </div>
            </div>
            <div className="feature-card feature-card-wide">
              <img src={bargraphImg} alt="Visual Analytics" className="feature-image feature-image-large" />
              <div className="feature-card-content">
                <h3 className="landing-section-subtitle">Visual Analytics</h3>
                <p>Group all your sources of income into one place. You won't have to worry about filtering through <b>that</b> many bank accounts ever again.</p>
              </div>
            </div>
            <div className="feature-card feature-card-wide">
              <img src={expensegraphImg} alt="Budget Categories" className="feature-image feature-image-large" />
              <div className="feature-card-content">
                <h3 className="landing-section-subtitle">Budget Categories</h3>
                <p>Manage your finances with our budgeting assistant. Set limits all in one place.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p><small>&copy; 2025 Hustlers. All rights reserved. Made by Ali Khachab, Muhammad Abdulrehman, and Affan Khamse for DragonHacks11 @ Drexel University.</small></p>
      </footer>
    </div>
  );
}