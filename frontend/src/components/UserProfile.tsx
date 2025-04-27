// ...existing code...
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function UserProfile() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [email, setEmail] = useState(user?.email || "");
    const [editing, setEditing] = useState(false);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (!isAuthenticated) {
        return <div>Please log in to see your profile.</div>;
    }

    // Placeholder for email update
    const handleEmailUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would call your backend or Auth0 Management API
        alert("Email update functionality is not implemented in this demo.");
        setEditing(false);
    };

    // Redirect to Auth0's change password page
    const handleChangePassword = () => {
        window.location.href = "https://YOUR_DOMAIN.auth0.com/lo/reset?client_id=YOUR_CLIENT_ID";
    };

    return (
        <div>
            <h2>User Profile</h2>
            {user && (
                <>
                    {/* <img src={user.picture} alt={user.name} /> */}
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
// ...existing code...