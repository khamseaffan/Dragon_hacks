import "./Home.css";
// import { buttonStyle } from "../lib/common.ts";
import IncomeGraph from "./IncomeGraph";
import { useState, useEffect } from "react";

// Import your sample data
import transactionsData from "../lib/sample_transactions.json";

export default function Home() {
  const [transactions, setTransactions] = useState([]);

  // Simulate fetching transactions from API
  useEffect(() => {
    // In production, you'd fetch data from your API
    setTransactions(transactionsData);
  }, []);

  return (
    <div className="home">
      <div className="navbar">
        <button className="navbar--button">Link Bank Account</button>
        <button className="navbar--button">Account Settings</button>
        <button className="navbar--button">View Income Graph</button>
      </div>
      <div className="content">
        <h1 className="header">Welcome to Your Income Tracker</h1>
        <p>Visualize and manage your monthly income with ease.</p>
        <div id="income-graph">
          <IncomeGraph 
            transactions={transactions} 
            monthlyIncomeGoal={7000} // Set your desired monthly goal
          />
        </div>
      </div>
    </div>
  );
}