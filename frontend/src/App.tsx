// import Login from "./components/Login.tsx";
// import Logout from "./components/Logout.tsx";
// import UserProfile from "./components/UserProfile.tsx";
// import Home from "./components/Home.tsx";

// export default function App() {
//   return (
//     <div className="App">
//       <Home />
//     </div>
//   )
// }

// --------new code 
import { useAuth0 } from "@auth0/auth0-react";
import Home from "./components/Home.tsx";
import Login from "./components/Login.tsx";
import Logout from "./components/Logout.tsx";
import UserProfile from "./components/UserProfile.tsx";
import LandingPage from "./components/LandingPage.tsx";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      {/* <Home /> */}
      {/* <Login />
      <Logout />
      <UserProfile /> */}
      {isAuthenticated ? <Home /> : <LandingPage />}
    </div>
  );
}