import { useAuth0 } from "@auth0/auth0-react";
import Home from "./components/Home.tsx";
import UserProfile from "./components/UserProfile.tsx";
import LandingPage from "./components/LandingPage.tsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


export default function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  const HomeRouter = () => (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account-settings" element={<UserProfile />} />
      </Routes>
    </Router>
  );

  return (
    <div className="App">
      {isAuthenticated ? <HomeRouter /> : <LandingPage />}
    </div>
  );
}
