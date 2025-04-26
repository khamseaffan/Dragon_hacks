import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios'; // Import axios for the logout call

// Define backend URL (replace with your actual URL, possibly from env vars)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export default function AuthButton() {
  const {
    loginWithRedirect,
    logout: auth0Logout, // Rename to avoid conflict if needed
    isAuthenticated,
    isLoading,
    user
  } = useAuth0();

  // Handler for backend logout
  const handleBackendLogout = async () => {
    try {
      // Call your backend's logout endpoint
      await axios.post(`${BACKEND_URL}/api/v1/auth/logout`, {}, {
        withCredentials: true // Ensure cookies are sent
      });
      console.log("Backend logout successful");
    } catch (error) {
      console.error("Backend logout failed:", error);
      // Decide how to handle backend logout failure - maybe still log out from Auth0?
    }
  };

  // Combined logout handler
  const handleLogout = async () => {
    await handleBackendLogout(); // Call backend logout first
    // Then logout from Auth0
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  if (isLoading) {
    return <button disabled>Loading...</button>;
  }

  return isAuthenticated ? (
    <button onClick={handleLogout}>
      Log out ({user?.name || 'user'})
    </button>
  ) : (
    <button onClick={() => loginWithRedirect()}>
      Log in
    </button>
  );
}