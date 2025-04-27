import { useAuth0 } from "@auth0/auth0-react";
import Home from "./components/Home.tsx";
import UserProfile from "./components/UserProfile.tsx";
import LandingPage from "./components/LandingPage.tsx";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/account-settings" element={<UserProfile />} />
            {/* Redirect any unknown route to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      ) : (
        <LandingPage />
      )}
    </div>
  );
}
