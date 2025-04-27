// to do -- verify if this is fully done, especially the return statement of the component. I just closed the tags for everything that was left open when I git pulled, and Copilot autocompleted some stuff before that.
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// Define interfaces for our data
interface Transaction {
  transaction_id: string;
  account_id: string;
  date: string;
  name: string;
  amount: number;
  category: string[];
  pending: boolean;
}

interface IncomeGraphProps {
  transactions: Transaction[];
  monthlyIncomeGoal?: number; // Optional goal line
}

// Helper function to format dates for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

// Helper to check if a transaction is income
const isIncome = (transaction: Transaction) => {
  // Negative amounts appear to be expenses in your data
  // Credit card payments and transfers might need special handling
  return transaction.amount > 0 && 
         !(transaction.category.includes('Payment') && 
           transaction.category.includes('Credit Card'));
};

const IncomeGraph: React.FC<IncomeGraphProps> = ({ transactions, monthlyIncomeGoal = 6000 }) => {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<'week' | 'month'>('month');
  const [viewType, setViewType] = useState<'bar' | 'line'>('bar');
  const [graphData, setGraphData] = useState<any[]>([]);

  // Process transactions when they change or filter changes
  useEffect(() => {
    // Filter transactions based on selected filter
    const now = new Date();
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      if (filterType === 'week') {
        // Get transactions from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return transactionDate >= weekAgo && transactionDate <= now;
      } else {
        // Get transactions from current month
        return transactionDate.getMonth() === now.getMonth() &&
               transactionDate.getFullYear() === now.getFullYear();
      }
    });
    
    setFilteredTransactions(filtered);
  }, [transactions, filterType]);

  // Process filtered transactions into graph data
  useEffect(() => {
    // Group by date and calculate income
    const incomeByDate = filteredTransactions.reduce((acc, transaction) => {
      if (isIncome(transaction)) {
        const dateKey = transaction.date;
        if (!acc[dateKey]) {
          acc[dateKey] = 0;
        }
        acc[dateKey] += transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format for Recharts
    const data = Object.entries(incomeByDate)
      .map(([date, amount]) => ({
        date: formatDate(date),
        income: amount,
        originalDate: date
      }))
      .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime());

    setGraphData(data);
  }, [filteredTransactions]);

  // Calculate total income
  const totalIncome = graphData.reduce((sum, item) => sum + item.income, 0);
  
  // Calculate daily goal based on monthly goal
  const dailyGoal = monthlyIncomeGoal / 30;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="income-graph-container">
      <div className="graph-header">
        <h2>Income Overview - {filterType === 'week' ? 'Last 7 Days' : 'This Month'}</h2>
        <div className="graph-controls">
          <div className="filter-controls">
            <button 
              className={`filter-button ${filterType === 'week' ? 'active' : ''}`}
              onClick={() => setFilterType('week')}
            >
              Weekly
            </button>
            <button 
              className={`filter-button ${filterType === 'month' ? 'active' : ''}`}
              onClick={() => setFilterType('month')}
            >
              Monthly
            </button>
          </div>
          <div className="view-controls">
            <button 
              className={`view-button ${viewType === 'bar' ? 'active' : ''}`}
              onClick={() => setViewType('bar')}
            >
              Bar
            </button>
            <button 
              className={`view-button ${viewType === 'line' ? 'active' : ''}`}
              onClick={() => setViewType('line')}
            >
              Line
            </button>
          </div>
        </div>
      </div>
      
      <div className="summary-stats">
        <div className="stat-card">
          <span className="stat-label">Total Income</span>
          <span className="stat-value">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{filterType === 'week' ? 'Weekly' : 'Monthly'} Goal</span>
          <span className="stat-value">{formatCurrency(filterType === 'week' ? monthlyIncomeGoal / 4 : monthlyIncomeGoal)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Progress</span>
          <span className={`stat-value ${totalIncome >= (filterType === 'week' ? monthlyIncomeGoal / 4 : monthlyIncomeGoal) ? 'goal-met' : 'goal-pending'}`}>
            {Math.round((totalIncome / (filterType === 'week' ? monthlyIncomeGoal / 4 : monthlyIncomeGoal)) * 100)}%
          </span>
        </div>
      </div>
      
      <div className="graph-container" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'bar' ? (
            <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), 'Income']} 
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Bar dataKey="income" fill="#279AF1" name="Income" />
              {filterType === 'month' ? (
                <ReferenceLine y={monthlyIncomeGoal} stroke="#8CD867" strokeDasharray="3 3" label="Monthly Goal" />
              ) : (
                <ReferenceLine y={monthlyIncomeGoal / 4} stroke="#8CD867" strokeDasharray="3 3" label="Weekly Goal" />
              )}
            </BarChart>
          ) : (
            <LineChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), 'Income']} 
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#279AF1" name="Income" />
              {filterType === 'month' ? (
                <ReferenceLine y={monthlyIncomeGoal} stroke="#8CD867" strokeDasharray="3 3" label="Monthly Goal" />
              ) : (
                <ReferenceLine y={monthlyIncomeGoal / 4} stroke="#8CD867" strokeDasharray="3 3" label="Weekly Goal" />
              )}
            </LineChart>
          )}
          </ResponsiveContainer>
        </div>
      </div>

  
  );
}
export default IncomeGraph;

        

            