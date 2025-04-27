import { useAuth0 } from "@auth0/auth0-react";
import "./Loginout.css";

export default function Logout() {
  const { logout } = useAuth0();

  return (
    <button className="navbar--button"
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Log out
    </button>
  );
}
