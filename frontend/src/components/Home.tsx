// filepath: frontend/src/pages/Home.tsx (or wherever your Home component resides)
import "./Home.css";
import { useNavigate } from "react-router-dom";
import PlaidLinkButton from "../components/PlaidLinkButton"; // Adjust path if needed
import BudgetTrackerCard from "../components/BudgetTrackerCard"; // Adjust path if needed
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import CategoryDonutChart from "../components/charts/CategoryDonutChart";
import ExpenseBarChart from "../components/charts/ExpenseBarChart";
import CalendarHeatmapChart from "../components/charts/CalendarHeatmapChart";
import { useState, useEffect, useCallback } from "react";
import {
  processMonthlyIncomeExpense,
  processCategoryTotals,
  processDailyActivity,
  MonthlyIncomeExpense,
  CategoryTotal,
  DailyActivity,
  Transaction, // <<< IMPORT the Transaction type
} from "../lib_dir/transactionUtils"; // Adjust path if needed

// Remove the local RawTransaction type definition

export default function Home() {
  const navigate = useNavigate();

  // --- State Variables ---
  // Use the imported Transaction type here
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimits, setBudgetLimits] = useState<{ [category: string]: number }>({});
  const [calculatedSpending, setCalculatedSpending] = useState<{ [category: string]: number }>({});

  // State for processed data for charts
  const [monthlyData, setMonthlyData] = useState<MonthlyIncomeExpense[]>([]);
  const [incomeCategoryData, setIncomeCategoryData] = useState<CategoryTotal[]>([]);
  const [expenseCategoryData, setExpenseCategoryData] = useState<CategoryTotal[]>([]);
  const [dailyActivityData, setDailyActivityData] = useState<Map<string, DailyActivity>>(new Map());

  // --- Effects and Handlers ---

  useEffect(() => {
    const storedLimits = localStorage.getItem('budgetLimits');
    if (storedLimits) {
      try {
        setBudgetLimits(JSON.parse(storedLimits));
      } catch (e) {
        console.error("Failed to parse budget limits from localStorage", e);
      }
    }
  }, []);

  const handleSetBudgetLimit = (category: string, limit: number) => {
    const newLimits = { ...budgetLimits, [category]: limit };
    setBudgetLimits(newLimits);
    localStorage.setItem('budgetLimits', JSON.stringify(newLimits));
    console.log(`Budget limit set for ${category}: ${limit}`);
  };

  // Use the imported Transaction type in the callback signature
  const handleTransactionsLoaded = useCallback((loadedTransactions: Transaction[]) => {
    console.log("Home component received transactions:", loadedTransactions.length);
    setTransactions(loadedTransactions); // Store raw transactions

    // --- Process Transactions for Charts ---
    setMonthlyData(processMonthlyIncomeExpense(loadedTransactions));
    setIncomeCategoryData(processCategoryTotals(loadedTransactions, 'income'));
    setExpenseCategoryData(processCategoryTotals(loadedTransactions, 'expense'));
    setDailyActivityData(processDailyActivity(loadedTransactions));
    // --- End Chart Processing ---


    // --- Process Transactions for Budget Card Calculation ---
    const spending: { [category: string]: number } = {};
    const trackedBudgetCategories = ['Food and Drink', 'Transportation', 'Shops', 'Service']; // Example

    loadedTransactions.forEach(tx => {
      if (tx.amount > 0 && tx.category) {
        const primaryCategory = tx.category[0];
        if (trackedBudgetCategories.includes(primaryCategory)) {
          spending[primaryCategory] = (spending[primaryCategory] || 0) + tx.amount;
        }
      }
    });
    console.log("Calculated spending for budget:", spending);
    setCalculatedSpending(spending);
    // --- End Budget Processing ---

  }, []);

  // --- Render Logic ---
  return (
    <div className="home">
      {/* Navbar Section */}
      <div className="navbar">
        <PlaidLinkButton onTransactionsLoaded={handleTransactionsLoaded} />
        <button className="navbar--button" onClick={() => navigate("/account-settings")}>Account Settings</button>
      </div>

      {/* Main Content Area */}
      <div className="content">
        <h1 className="header">Welcome to Your Income Tracker</h1>
        <div id="income-graph">
          {/* Pass the transactions state to D3Graph */}
          <D3Graph transactions={transactions} />
        </div>
      </div>
      {/* Render the BudgetTrackerCard, passing state and handlers */}
      <BudgetTrackerCard 
        budgetLimits={budgetLimits}
        calculatedSpending={calculatedSpending}
        onSetBudgetLimit={handleSetBudgetLimit}
      />
    </div>
  );
}