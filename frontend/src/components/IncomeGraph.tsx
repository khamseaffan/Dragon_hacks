import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import incomeData from './IncomeData.json'; // Ensure the JSON file exists and is correctly located

const IncomeGraph: React.FC = () => {
  return (
    <div className="income-graph-container">
      <h2>Monthly Income (2025)</h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={incomeData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Income']} />
            <Legend />
            <Bar dataKey="income" fill="#279AF1" name="Income" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeGraph;