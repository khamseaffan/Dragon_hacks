// filepath: /Users/khamseaffan/Desktop/Dragon_hacks/frontend/src/components/BudgetTrackerCard.tsx
import React, { useState } from 'react';
import './BudgetTrackerCard.css'; // We'll create this CSS file next

interface BudgetTrackerCardProps {
  budgetLimits: { [category: string]: number };
  calculatedSpending: { [category: string]: number };
  onSetBudgetLimit: (category: string, limit: number) => void;
}

const BudgetTrackerCard: React.FC<BudgetTrackerCardProps> = ({ 
  budgetLimits, 
  calculatedSpending, 
  onSetBudgetLimit 
}) => {
  // *** UPDATE THIS ARRAY to match the categories used in Home.tsx ***
  const trackedCategories = ['Food and Drink', 'Transportation', 'Shops', 'Service', 'Payment']; // Example update

  // State for managing input values locally within the card
  const [inputLimits, setInputLimits] = useState<{ [category: string]: string }>({});

  const handleInputChange = (category: string, value: string) => {
    setInputLimits(prev => ({ ...prev, [category]: value }));
  };

  const handleSetLimitClick = (category: string) => {
    const numericValue = parseFloat(inputLimits[category]);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onSetBudgetLimit(category, numericValue);
      // Optionally clear input after setting
      // setInputLimits(prev => ({ ...prev, [category]: '' })); 
    } else {
      alert('Please enter a valid positive number for the budget limit.');
    }
  };

  return (
    <div className="budget-card card"> {/* Reuse card style from Home.css */} 
      <h2 className="card-title">Budget Tracker</h2>
      <div className="budget-list">
        {trackedCategories.map(category => {
          const limit = budgetLimits[category] || 0;
          const spent = calculatedSpending[category] || 0;
          const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOverBudget = spent > limit && limit > 0;

          return (
            <div key={category} className="budget-item">
              <div className="budget-info">
                <span className="category-name">{category}</span>
                <span className={`amount-spent ${isOverBudget ? 'over-budget' : ''}`}>
                  ${spent.toFixed(2)} / ${limit > 0 ? limit.toFixed(2) : 'Not Set'}
                </span>
              </div>
              {limit > 0 && (
                <div className="progress-bar-container">
                  <div 
                    className={`progress-bar ${isOverBudget ? 'over-budget' : ''}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              )}
              <div className="budget-input-group">
                <input 
                  type="number"
                  placeholder="Set Limit" 
                  value={inputLimits[category] || ''}
                  onChange={(e) => handleInputChange(category, e.target.value)}
                  min="0"
                  step="10"
                />
                <button onClick={() => handleSetLimitClick(category)}>Set</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetTrackerCard;
