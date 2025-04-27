// this is a graph for the land page 
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface IncomeDataPoint {
  month: string;
  income: number;
}

// Sample data to populate the chart initially
const sampleData: IncomeDataPoint[] = [
  { month: "Jan", income: 3200 },
  { month: "Feb", income: 3400 },
  { month: "Mar", income: 2900 },
  { month: "Apr", income: 3600 },
  { month: "May", income: 3800 },
  { month: "Jun", income: 3500 }
];

const MonthlyIncomeGraph = () => {
  const [incomeData, setIncomeData] = useState<IncomeDataPoint[]>(sampleData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real application, you would fetch data from your API
  useEffect(() => {
    // Example of how you would fetch real data:
    // const fetchIncomeData = async () => {
    //   setIsLoading(true);
    //   setError(null);
    //   try {
    //     const response = await fetch('http://localhost:8000/api/v1/income', {
    //       credentials: 'include' // Important for sending cookies
    //     });
    //     if (!response.ok) throw new Error('Failed to fetch income data');
    //     const data = await response.json();
    //     setIncomeData(data);
    //   } catch (err) {
    //     setError('Failed to load income data. Please try again later.');
    //     console.error(err);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    //
    // fetchIncomeData();
  }, []);

  // Format currency amounts
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) return <div className="loading">Loading income data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="income-graph-container">
      <h3 className="graph-title">Monthly Income Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart 
          data={incomeData} 
          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#666' }}
            axisLine={{ stroke: '#999' }}
            tickLine={{ stroke: '#999' }}
          />
          <YAxis 
            tick={{ fill: '#666' }}
            axisLine={{ stroke: '#999' }}
            tickLine={{ stroke: '#999' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value) => [formatCurrency(value as number), 'Income']}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px'
            }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line 
            type="monotone" 
            dataKey="income" 
            name="Monthly Income"
            stroke="#279AF1" 
            strokeWidth={3}
            dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 8, strokeWidth: 0, fill: '#279AF1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyIncomeGraph;