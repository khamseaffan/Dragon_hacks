import Login from "./components/Login.tsx";
import Logout from "./components/Logout.tsx";
import UserProfile from "./components/UserProfile.tsx";

export default function App() {
  return (
    <div className="App">
      <Login />
      <Logout />
      <UserProfile />
    </div>
  )
}