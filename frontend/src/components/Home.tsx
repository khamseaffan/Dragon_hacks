import "./Home.css";
import D3Graph from "./D3Graph"; // Import the D3Graph component
import PlaidLinkButton from "./PlaidLinkButton"; // Import the PlaidLinkButton
import AuthButton from "./AuthButton"; // Assuming AuthButton handles login/logout
import { useState } from "react"; // Import useState

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
        <p>Visualize and manage your monthly income with ease.</p>
        <div id="income-graph">
          {/* Pass the transactions state to D3Graph */}
          <D3Graph transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
