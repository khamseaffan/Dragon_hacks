// import Login from "./components/Login.tsx";
// import Logout from "./components/Logout.tsx";
// import UserProfile from "./components/UserProfile.tsx";
import Home from "./components/Home.tsx";
import { useAuth0 } from "@auth0/auth0-react";

export default function App() {
  const { isAuthenticated, user } = useAuth0();

  return (
    <div className="App">
      {
        isAuthenticated ? (
          <Home />
        ) :
        (
          <p>Help me</p>
          //<Landing />
        )
      }
    </div>
  )
}
