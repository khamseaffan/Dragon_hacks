import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AuthButton from "./AuthButton";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

export default function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasswordMessage("");
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      if (res.ok) {
        setPasswordMessage(
          "Password changed successfully! Check your email for confirmation."
        );
        setPasswordSuccess(true);
        setShowPasswordForm(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setPasswordMessage(data.message || "Failed to change password.");
      }
    } catch (err) {
      setPasswordMessage("Error changing password.");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in to see your profile.</div>;

  return (
    <div className="profile-container">
      <div
        className="profile-card"
        style={{ position: "relative", width: "100%", maxWidth: 400 }}
      >
        <button
          className="profile-back-button"
          onClick={() => navigate("/")}
          aria-label="Back to Home"
        >
          <span className="profile-back-button__text">&#x2039; Back</span>
        </button>
        {user?.picture && (
          <img src={user.picture} alt={user.name} className="profile-picture" />
        )}
        <div className="profile-name">{user?.name}</div>
        <div className="profile-buttons">
          {/* <button
            className="profile-button"
            onClick={() => setShowPasswordForm((v) => !v)}
          >
            Change Password
          </button> */}
          <AuthButton />
        </div>
        {/* {showPasswordForm && (
          <form
            className="profile-form"
            onSubmit={handleChangePassword}
            style={{ marginTop: 16 }}
          >
            <label>
              Current Password:
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </label>
            <label>
              New Password:
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            <label>
              Confirm New Password:
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button type="submit" className="profile-button">
                Save Password
              </button>
              <button
                type="button"
                className="profile-button"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {passwordMessage && (
          <div
            style={{
              marginTop: 18,
              color: passwordSuccess ? "#1ca64c" : "#d32f2f",
              background: passwordSuccess ? "#eafaf1" : "#fff0f0",
              border: passwordSuccess
                ? "1px solid #1ca64c"
                : "1px solid #d32f2f",
              borderRadius: 6,
              padding: "10px 16px",
              textAlign: "center",
              fontWeight: 500,
              maxWidth: 340,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {passwordMessage}
          </div>
        )} */}
      </div>
    </div>
  );
}
