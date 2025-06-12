import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Payment } from '../types/Payment';
import { useTheme } from '../hooks/useTheme';
import { usePayments } from '../hooks/usePayments';
import { getTodayString } from '../utils/dateUtils';

interface PaymentFormProps {
  onAddPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'isCompleted'>) => void;
  onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onAddPayment, onClose }) => {
  const { theme } = useTheme();
  const { getAvailableGroups } = usePayments();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: getTodayString(),
    type: 'recurring' as 'recurring' | 'one-off',
    recurringDuration: '12',
    customEndDate: '',
    note: '',
    group: 'Household',
    newGroup: ''
  });

  const recurringOptions = [
    '1', '3', '6', '12', '18', '24', '36', '48', '60', 'No end date', 'Custom'
  ];

  const availableGroups = getAvailableGroups();
  const defaultGroups = ['Household', 'Subscriptions', 'Shopping', 'Transport', 'Entertainment', 'Health'];
  const allGroups = Array.from(new Set([...defaultGroups, ...availableGroups])).sort();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.amount || !formData.dueDate || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const finalGroup = formData.group === 'new' ? formData.newGroup.trim() : formData.group;
    if (!finalGroup) {
      setIsSubmitting(false);
      return;
    }

    const payment: Omit<Payment, 'id' | 'createdAt' | 'isCompleted'> = {
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      type: formData.type,
      note: formData.note.trim(),
      group: finalGroup
    };

    if (formData.type === 'recurring') {
      payment.recurringDuration = formData.recurringDuration;
      if (formData.recurringDuration === 'Custom' && formData.customEndDate) {
        payment.customEndDate = formData.customEndDate;
      }
    }

    try {
      // Add the payment
      onAddPayment(payment);
      
      // Reset form state immediately
      setFormData({
        name: '',
        amount: '',
        dueDate: getTodayString(),
        type: 'recurring',
        recurringDuration: '12',
        customEndDate: '',
        note: '',
        group: 'Household',
        newGroup: ''
      });
      
      // Reset submitting state and close modal
      setIsSubmitting(false);
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        onClose();
      }, 0);
      
    } catch (error) {
      console.error('Error adding payment:', error);
      setIsSubmitting(false);
    }
  };

  // Handle clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isSubmitting]);

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
        className="w-full max-w-md rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: theme.colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="text-xl font-bold"
            style={{ color: theme.colors.text }}
          >
            Add Payment
          </h2>
          <button
            onClick={onClose}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.textSecondary }}
            >
              Payment Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                ...inputStyle,
                focusRingColor: theme.colors.primary
              }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                Amount (£) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  ...inputStyle,
                  focusRingColor: theme.colors.primary
                }}
                required
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  ...inputStyle,
                  focusRingColor: theme.colors.primary
                }}
                required
              />
            </div>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.textSecondary }}
            >
              Group *
            </label>
            <select
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                ...inputStyle,
                focusRingColor: theme.colors.primary
              }}
              required
            >
              {allGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
              <option value="new">+ Create New Group</option>
            </select>
          </div>

          {formData.group === 'new' && (
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                New Group Name *
              </label>
              <input
                type="text"
                value={formData.newGroup}
                onChange={(e) => setFormData({ ...formData, newGroup: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  ...inputStyle,
                  focusRingColor: theme.colors.primary
                }}
                required
              />
            </div>
          )}

          <div>
            <label 
              className="block text-sm font-medium mb-3"
              style={{ color: theme.colors.textSecondary }}
            >
              Payment Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentType"
                  value="recurring"
                  checked={formData.type === 'recurring'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    type: e.target.value as 'recurring' | 'one-off' 
                  })}
                  disabled={isSubmitting}
                  className="sr-only"
                />
                <div 
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition-all"
                  style={{
                    borderColor: formData.type === 'recurring' ? theme.colors.primary : theme.colors.border,
                    backgroundColor: formData.type === 'recurring' ? theme.colors.primary : 'transparent',
                    opacity: isSubmitting ? 0.5 : 1
                  }}
                >
                  {formData.type === 'recurring' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span style={{ color: theme.colors.text, opacity: isSubmitting ? 0.5 : 1 }}>Recurring</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentType"
                  value="one-off"
                  checked={formData.type === 'one-off'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    type: e.target.value as 'recurring' | 'one-off' 
                  })}
                  disabled={isSubmitting}
                  className="sr-only"
                />
                <div 
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition-all"
                  style={{
                    borderColor: formData.type === 'one-off' ? theme.colors.primary : theme.colors.border,
                    backgroundColor: formData.type === 'one-off' ? theme.colors.primary : 'transparent',
                    opacity: isSubmitting ? 0.5 : 1
                  }}
                >
                  {formData.type === 'one-off' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span style={{ color: theme.colors.text, opacity: isSubmitting ? 0.5 : 1 }}>One-off</span>
              </label>
            </div>
          </div>

          {formData.type === 'recurring' && (
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Recurring Duration
                </label>
                <select
                  value={formData.recurringDuration}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    recurringDuration: e.target.value 
                  })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    ...inputStyle,
                    focusRingColor: theme.colors.primary
                  }}
                >
                  {recurringOptions.map(option => (
                    <option key={option} value={option}>
                      {option === 'No end date' ? option : 
                       option === 'Custom' ? option : 
                       `${option} month${option === '1' ? '' : 's'}`}
                    </option>
                  ))}
                </select>
              </div>

              {formData.recurringDuration === 'Custom' && (
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Custom End Date
                  </label>
                  <input
                    type="date"
                    value={formData.customEndDate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      customEndDate: e.target.value 
                    })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      ...inputStyle,
                      focusRingColor: theme.colors.primary
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.textSecondary }}
            >
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                ...inputStyle,
                focusRingColor: theme.colors.primary
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim() || !formData.amount || !formData.dueDate}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isSubmitting ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: theme.colors.primary,
              color: '#FFFFFF'
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Adding Payment...' : 'Add Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;