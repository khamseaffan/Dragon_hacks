// filepath: src/components/PlaidLinkButton.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
// Import the custom transaction data
const randomIndex = Math.floor(Math.random() * 4) + 1;
// We'll load the JSON dynamically later
let customTransactions: any[] = [];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Define props interface to accept the callback
interface PlaidLinkButtonProps {
  onTransactionsLoaded: (transactions: any[]) => void;
}

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ onTransactionsLoaded }) => {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth0();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);

  const createLinkToken = useCallback(async () => {
    if (!isAuthenticated || !user || isAuthLoading) {
      setError("Please log in first to link an account.");
      console.log("createLinkToken: User not authenticated or loading.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      interface CreateLinkTokenResponse {
        link_token: string;
      }

      const response = await axios.post<CreateLinkTokenResponse>(`${BACKEND_URL}/api/v1/plaid/create_link_token`, {
        user_id: user.sub,
      });
      setLinkToken(response.data.link_token);
    } catch (err: any) {
      console.error('Error creating link token:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to create link token');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, isAuthLoading]);

  // Handle Plaid Link success
  const onSuccess = useCallback(
    async (publicToken: string) => {
      if (!isAuthenticated || !user || isAuthLoading) {
        setError("Please log in first to link an account.");
        console.log("onSuccess: User not authenticated or loading.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        interface ExchangePublicTokenResponse {
          item_id: string;
        }

        const response = await axios.post<ExchangePublicTokenResponse>(`${BACKEND_URL}/api/v1/plaid/exchange_public_token`, {
          public_token: publicToken,
          user_id: user.sub,
        });
        setItemId(response.data.item_id);
        setLinkToken(null);
        // --- Load custom transactions and call parent callback --- 
        console.log("Loading transactions from  response");
        const module = await import(`../lib/custom_hustler_${randomIndex}.json`);
        customTransactions = module.default || module;
        onTransactionsLoaded(customTransactions); // Call parent callback
        console.log('Loaded Custom Transactions:', customTransactions);
        console.log(`Total custom transactions: ${customTransactions.length}`);
        // --- End custom transaction loading ---
        

      } catch (err: any) {
        console.error('Error exchanging public token:', err);
        const detail = err.response?.data?.detail;
        let msg = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail.map((d: any) => d.msg).join('; ') : (err.message || 'Failed to exchange public token'));
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user, onTransactionsLoaded]
  );

  // Handler for the button click
  const handleLinkClick = () => {
    if (!isAuthenticated || !user || isAuthLoading) {
      setError("Please log in first to link an account.");
      console.log("handleLinkClick: User not authenticated or loading.");
      return;
    }

    createLinkToken();
  };

  // Configure Plaid Link - moved inside handleLinkClick scope if needed
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!, // Token must be non-null to configure
    onSuccess,
  };
  const { open, ready } = usePlaidLink(config);

  // Effect to open Plaid Link automatically once token is ready
  // This effect should only run when linkToken changes and is valid
  useEffect(() => {
    if (linkToken && ready) {
      console.log("Link token ready, opening Plaid Link...");
      open(); // Open the Plaid Link modal
    }
  }, [linkToken, ready, open]);

  // Only render the button if the user is authenticated
  if (!isAuthenticated || isAuthLoading) {
    return null; // Don't show button if not logged in or auth is loading
  }

  return (
    <div>
      <button
        className="navbar--button"
        onClick={handleLinkClick}
        disabled={loading} // Disable while loading
      >
        {loading ? 'Linking...' : 'Link Custom Gig Data'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {/* Remove the transaction loaded indicator, parent will handle display */}
    </div>
  );
};

export default PlaidLinkButton;


// trying to fix the plaid lin3