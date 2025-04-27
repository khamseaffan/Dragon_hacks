import "./Home.css";
import D3Graph from "./components/D3Graph"; 
import PlaidLinkButton from "./components/PlaidLinkButton"; 
import AuthButton from "./components/AuthButton";
import { useState } from "react";
import MonthlyIncomeGraph from "./components/monthlyincomegraph"; 

export default function Home() {
  // State to hold transactions, initialized as empty array
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Callback function for PlaidLinkButton to update transactions
  const handleTransactionsLoaded = (loadedTransactions: any[]) => {
    console.log("Home component received transactions:", loadedTransactions.length);
    setTransactions(loadedTransactions);
  };
  
  return (
    <div className="home">
      <div className="navbar">
        {/* Use AuthButton for login/logout */}
        <AuthButton />
        {/* Pass the callback function to PlaidLinkButton */}
        <PlaidLinkButton onTransactionsLoaded={handleTransactionsLoaded} />
        <button className="navbar--button">Account Settings</button>
        <button className="navbar--button">View Income Graph</button>
      </div>
      
      <div className="content">
        <h1 className="header">Welcome to Your Income Tracker</h1>
        <p className="subheader">Visualize and manage your monthly income with ease.</p>
        
        <div className="features-and-graph">
          {/* Key Features Section */}
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
          
          {/* Graph Section */}
          <div className="graph-section">
            {transactions.length > 0 ? (
              <D3Graph transactions={transactions} />
            ) : (
              <div className="login-prompt">
                <p>Connect your bank to view your income data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}