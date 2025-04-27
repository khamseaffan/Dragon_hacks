import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AuthButton from "./AuthButton";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

export default function UserProfile() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [email, setEmail] = useState(user?.email || "");
    const [editing, setEditing] = useState(false);
    const navigate = useNavigate();

    const handleEmailUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Email update functionality is not implemented in this demo.");
        setEditing(false);
    };

    const handleChangePassword = () => {
        window.location.href = "https://dev-8qredvgiqnxmrkt0.us.auth0.com/lo/reset?client_id=StxTO2kB6y6CZwOasr77u2mITfJYcnhL";
    };

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <div>Please log in to see your profile.</div>;

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F7FF" }}>
            <div className="profile-card" style={{ position: "relative", width: "100%", maxWidth: 400 }}>
                <button
                    className="profile-back-button"

                    onClick={() => navigate("/")}
                    aria-label="Back to Home"
                >
                    <span className="profile-back-button__text">&#x2039;Back</span>
                </button>
                {user?.picture && (
                    <img src={user.picture} alt={user.name} className="profile-picture" />
                )}
                <div className="profile-name">{user?.name}</div>
                {editing ? (
                    <form onSubmit={handleEmailUpdate} className="profile-form">
                        <label>
                            Email:
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </label>
                        <div className="profile-buttons">
                            <button type="submit" className="profile-button">Save</button>
                            <button type="button" className="profile-button" onClick={() => setEditing(false)}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="profile-email">{email}</div>
                        <div className="profile-buttons">
                            <button className="profile-button" onClick={() => setEditing(true)}>Edit Email</button>
                            <button className="profile-button" onClick={handleChangePassword}>Change Password</button>
                            <AuthButton />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}