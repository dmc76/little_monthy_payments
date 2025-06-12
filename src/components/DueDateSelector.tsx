import React, { useState, useEffect } from 'react';
import { Calendar, X, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { getTodayString } from '../utils/dateUtils';

interface DueDateSelectorProps {
  items: { name: string; amount: number; note: string }[];
  onConfirm: (items: { name: string; amount: number; note: string; dueDate: string }[]) => void;
  onCancel: () => void;
}

const DueDateSelector: React.FC<DueDateSelectorProps> = ({ items, onConfirm, onCancel }) => {
  const { theme } = useTheme();
  const [dueDate, setDueDate] = useState(getTodayString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleConfirm = () => {
    if (isSubmitting || !dueDate) return;
    
    setIsSubmitting(true);
    
    const itemsWithDueDate = items.map(item => ({
      ...item,
      dueDate
    }));
    
    // Call the confirm handler immediately
    onConfirm(itemsWithDueDate);
    
    // Reset state
    setIsSubmitting(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onCancel();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel, isSubmitting]);

  const inputStyle = {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderColor: theme.colors.border
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl p-6"
        style={{ backgroundColor: theme.colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" style={{ color: theme.colors.primary }} />
            <h2 
              className="text-xl font-bold"
              style={{ color: theme.colors.text }}
            >
              Set Due Date
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-opacity-20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: theme.colors.error + '20',
              color: theme.colors.error 
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items Summary */}
        <div 
          className="mb-6 p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.primary + '10',
            borderColor: theme.colors.primary + '30'
          }}
        >
          <h3 
            className="font-semibold mb-3"
            style={{ color: theme.colors.text }}
          >
            Adding {items.length} item{items.length !== 1 ? 's' : ''} to payments:
          </h3>
          
          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span 
                  className="text-sm truncate mr-2"
                  style={{ color: theme.colors.text }}
                  title={item.name}
                >
                  {item.name}
                </span>
                <span 
                  className="text-sm font-bold shrink-0"
                  style={{ color: theme.colors.primary }}
                >
                  £{item.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div 
            className="pt-3 border-t flex items-center justify-between"
            style={{ borderColor: theme.colors.primary + '30' }}
          >
            <span 
              className="font-bold"
              style={{ color: theme.colors.text }}
            >
              Total:
            </span>
            <span 
              className="text-lg font-bold"
              style={{ color: theme.colors.primary }}
            >
              £{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Due Date Input */}
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: theme.colors.textSecondary }}
          >
            When are these payments due? *
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              ...inputStyle,
              focusRingColor: theme.colors.primary
            }}
            required
          />
          <p 
            className="text-xs mt-2"
            style={{ color: theme.colors.textSecondary }}
          >
            All {items.length} item{items.length !== 1 ? 's' : ''} will be added with this due date
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.colors.textSecondary + '20',
              color: theme.colors.textSecondary
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !dueDate}
            className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isSubmitting ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: theme.colors.success,
              color: '#ffffff'
            }}
          >
            <Check className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Adding...' : `Add ${items.length} Payment${items.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DueDateSelector;