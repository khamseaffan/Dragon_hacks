import { useAuth0 } from "@auth0/auth0-react";

export default function Login() {
  const { loginWithRedirect, user } = useAuth0();

  return (
    <button
      onClick={() => {
        loginWithRedirect();
        console.log("Logged in with username " + (user?.name || "unknown user"));
      }}
    >
      Log in
    </button>
  );
}
