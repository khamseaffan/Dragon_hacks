import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function UserProfile() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [email, setEmail] = useState(user?.email || "");
    const [editing, setEditing] = useState(false);

    // Placeholder for email update
    const handleEmailUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Email update functionality is not implemented in this demo.");
        setEditing(false);
    };

    // Use your actual Auth0 domain and clientId
    const handleChangePassword = () => {
        window.location.href = "https://dev-8qredvgiqnxmrkt0.us.auth0.com/lo/reset?client_id=StxTO2kB6y6CZwOasr77u2mITfJYcnhL";
    };

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <div>Please log in to see your profile.</div>;

    return (
        <div>
            <h2>User Profile</h2>
            {user && (
                <>
                    {user.picture && <img src={user.picture} alt={user.name} style={{ borderRadius: "50px", width: "80px" }} />}
                    <p>Name: {user.name}</p>
                    {editing ? (
                        <form onSubmit={handleEmailUpdate}>
                            <label>
                                Email:
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </label>
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setEditing(false)}>Cancel</button>
                        </form>
                    ) : (
                        <>
                            <p>Email: {email}</p>
                            <button onClick={() => setEditing(true)}>Edit Email</button>
                        </>
                    )}
                    <button onClick={handleChangePassword}>Change Password</button>
                </>
            )}
        </div>
    );
}