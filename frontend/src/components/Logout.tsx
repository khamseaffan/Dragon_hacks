import { useAuth0 } from "@auth0/auth0-react";
import { buttonStyle } from "../lib_dir/common.ts";

export default function Logout() {
  const { logout } = useAuth0();

  return (
    <button style={buttonStyle}
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Log out
    </button>
  );
}
