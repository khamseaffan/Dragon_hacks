// import "./Home.css";
// import { useNavigate } from "react-router-dom"; // Import useNavigate
// import PlaidLinkButton from "./PlaidLinkButton";
// import AuthButton from "./AuthButton";
// import D3Graph from "./D3Graph";
// import { useState, useEffect, useCallback } from "react"; // Import useEffect, useCallback
// import BudgetTrackerCard from "./BudgetTrackerCard"; // Import the new card

// export default function Home() {
//   const [transactions, setTransactions] = useState<any[]>([]);
//   const navigate = useNavigate();
//   const [budgetLimits, setBudgetLimits] = useState<{ [category: string]: number }>({});
//   const [calculatedSpending, setCalculatedSpending] = useState<{ [category: string]: number }>({});

//   // Load budget limits from localStorage on initial mount
//   useEffect(() => {
//     const storedLimits = localStorage.getItem('budgetLimits');
//     if (storedLimits) {
//       try {
//         setBudgetLimits(JSON.parse(storedLimits));
//       } catch (e) {
//         console.error("Failed to parse budget limits from localStorage", e);
//       }
//     }
//   }, []);

//   // Function to update budget limit and save to localStorage
//   const handleSetBudgetLimit = (category: string, limit: number) => {
//     const newLimits = { ...budgetLimits, [category]: limit };
//     setBudgetLimits(newLimits);
//     localStorage.setItem('budgetLimits', JSON.stringify(newLimits));
//     console.log(`Budget limit set for ${category}: ${limit}`);
//   };

//   // Callback function for PlaidLinkButton to update transactions
//   // Use useCallback to memoize this function
//   const handleTransactionsLoaded = useCallback((loadedTransactions: any[]) => {
//     console.log("Home component received transactions:", loadedTransactions.length);
//     setTransactions(loadedTransactions);

//     // --- Process Transactions for Budget Calculation ---
//     const spending: { [category: string]: number } = {};
//     // *** UPDATE THIS ARRAY to match categories in your JSON you want to budget ***
//     const trackedCategories = ['Food and Drink', 'Transportation', 'Shops', 'Service', 'Payment']; // Example update

//     loadedTransactions.forEach(tx => {
//       // Only consider expenses (positive amounts in Plaid often mean money leaving account)
//       if (tx.amount > 0 && tx.category) {
//         // Find the primary category that matches our tracked list
//         // Plaid categories are hierarchical, e.g., ["Food and Drink", "Restaurants"]
//         const primaryCategory = tx.category[0]; 
//         if (trackedCategories.includes(primaryCategory)) {
//           spending[primaryCategory] = (spending[primaryCategory] || 0) + tx.amount;
//         }
//         // You might need more sophisticated category mapping here based on your JSON data
//       }
//     });
//     console.log("Calculated spending:", spending);
//     setCalculatedSpending(spending);
//     // --- End Processing ---
//   }, []); // Empty dependency array as it doesn't depend on external state changing over time

//   return (
//     <div className="home">
//       <div className="navbar">
//         <AuthButton />
//         <PlaidLinkButton onTransactionsLoaded={handleTransactionsLoaded} />
//         <button className="navbar--button" onClick={() => navigate("/account-settings")}>Account Settings</button>
//         <button className="navbar--button">View Income Graph</button>
//       </div>
      
//       <div className="content">
//         <h1 className="header">Welcome to Your Income Tracker</h1>
//         <p>Visualize and manage your monthly income with ease.</p>
//         <div id="income-graph">
//           {/* Pass the transactions state to D3Graph */}
//           <D3Graph transactions={transactions} />
//         </div>
//       </div>
//       {/* Render the BudgetTrackerCard, passing state and handlers */}
//       <BudgetTrackerCard 
//         budgetLimits={budgetLimits}
//         calculatedSpending={calculatedSpending}
//         onSetBudgetLimit={handleSetBudgetLimit}
//       />
//     </div>
//   );
// }
import "./Home.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import PlaidLinkButton from "./PlaidLinkButton";
import D3Graph from "./D3Graph";
import { useState, useEffect, useCallback } from "react"; // Import useEffect, useCallback
import BudgetTrackerCard from "./BudgetTrackerCard"; // Import the new card

export default function Home() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <div className="home">
      <div className="navbar">
        <PlaidLinkButton onTransactionsLoaded={handleTransactionsLoaded} />
        <button className="navbar--button" onClick={() => navigate("/account-settings")}>Account Settings</button>
      </div>
      
      <div className="content">
        <h1 className="header">Welcome to Your Income Tracker</h1>
        <p className="subheader">Track, Visualize, and Optimize Your Financial Journey</p>
        
        <div className="features-and-graph">
          <div className="key-features">
            <h2 className="section-title">Key Features</h2>
            
            <div className="feature-item">
              <h3 className="feature-name">Bank Integration</h3>
              <p className="feature-description">Connect your accounts securely with Plaid</p>
            </div>
            
            <div className="feature-item">
              <h3 className="feature-name">Visual Analytics</h3>
              <p className="feature-description">See your income trends with beautiful charts</p>
            </div>
            
            <div className="feature-item">
              <h3 className="feature-name">Budget Categories</h3>
              <p className="feature-description">Organize and track your finances</p>
            </div>
          </div>
          
          <div className="graph-section">
            {isAuthenticated ? (
              <MonthlyIncomeGraph />
            ) : (
              <div className="login-prompt">
                <p>Sign in to view your personalized income graph</p>
                <button 
                  className="action-button" 
                  onClick={() => loginWithRedirect()}
                >
                  Log In to Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}