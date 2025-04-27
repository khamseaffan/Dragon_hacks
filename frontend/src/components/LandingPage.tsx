import { useAuth0 } from "@auth0/auth0-react";
import "./LandingPage.css"; // Keep this import
import logo from "../lib_dir/logo.png"; // Adjust the path as necessary
export default function LandingPage() {
  const { loginWithRedirect } = useAuth0();

  // Define inline styles
  const styles = {
    page: {
      fontFamily: 'Arial, sans-serif',
      color: '#333',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 5%',
      backgroundColor: '#279AF1',
      color: 'white',
    },
    logo: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
    },
    loginButton: {
      backgroundColor: 'white',
      color: '#279AF1',
      border: 'none',
      padding: '0.5rem 1.5rem',
      borderRadius: '4px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    heroSection: {
      padding: '5rem 1rem',
      textAlign: 'center' as const,
      background: 'linear-gradient(to bottom, #F7F7FF, #E0E0FF)',
    },
    h1: {
      fontSize: '3rem',
      marginBottom: '1rem',
      color: '#070600',
    },
    subtitle: {
      fontSize: '1.4rem',
      marginBottom: '2rem',
      color: '#555',
    },
    ctaButton: {
      backgroundColor: '#279AF1',
      color: 'white',
      border: 'none',
      padding: '0.8rem 2rem',
      borderRadius: '4px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    featuresSection: {
      padding: '4rem 5%',
      backgroundColor: 'white',
    },
    teamSection: {
      padding: '4rem 5%',
      backgroundColor: '#F7F7FF',
    },
    h2: {
      fontSize: '2.5rem',
      textAlign: 'center' as const,
      marginBottom: '3rem',
    },
    h3: {
      fontSize: '1.5rem',
      marginBottom: '0.5rem',
      color: '#279AF1',
    },
    footer: {
      backgroundColor: '#070600',
      color: 'white',
      textAlign: 'center' as const,
      padding: '1.5rem',
      marginTop: 'auto',
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={logo}
            alt="Logo" 
            style={{ height: '50px', marginRight: '10px'}} 
          />
        </div>
        {useAuth0().isAuthenticated ? (
          <span>Welcome!</span>
        ) : (
          <button 
            style={styles.loginButton}   
            onClick={() => loginWithRedirect()}
          >
            Sign In/Up
          </button>
        )}
      </header>

      <main>
        <section style={styles.heroSection}>
          <h1 style={styles.h1}>Track Your Income Like a Pro</h1>
          <p style={styles.subtitle}>Monitor, visualize, and optimize your earnings effortlessly</p>
          <button 
            style={styles.ctaButton} 
            onClick={() => loginWithRedirect()}
          >
            Get Started
          </button>
        </section>

        <section style={styles.featuresSection}>
          <h2 style={styles.h2}>Key Features</h2>
          <div>
            <h3 style={styles.h3}>Bank Integration</h3>
            <p>Connect your accounts securely with Plaid</p>
            
            <h3 style={styles.h3}>Visual Analytics</h3>
            <p>See your income trends with beautiful charts</p>
            
            <h3 style={styles.h3}>Budget Categories</h3>
            <p>Organize and track your finances</p>
          </div>
        </section>

        <section style={styles.teamSection}>
          <h2 style={styles.h2}>Meet the Team</h2>
          <div>
            <h3 style={styles.h3}>ALI</h3>
            <p>Frontend Developer</p>
            
            <h3 style={styles.h3}>Affan</h3>
            <p>Backend Developer</p>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>&copy; 2025 Income Hustlers. All rights reserved.</p>
      </footer>
    </div>
  );
}