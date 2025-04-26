import { useAuth0 } from "@auth0/auth0-react";

export default function UserProfile() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (!isAuthenticated) {
        return <div>Please log in to see your profile.</div>;
    }

    return (
    <div>
        <h2>User Profile</h2>
        {user && (
            <>
                <img src={user.picture} alt={user.name} />
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
            </>
        )}
    </div>
  )
}
