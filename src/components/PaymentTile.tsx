import React, { useState } from 'react';
import { Calendar, Edit, Trash2, Check, Clock, Repeat, FileText } from 'lucide-react';
import { Payment } from '../types/Payment';
import { useTheme } from '../hooks/useTheme';
import { formatDate, getDaysUntilDue, getUrgencyLevel } from '../utils/dateUtils';

interface PaymentTileProps {
  payment: Payment;
  onToggleComplete: (id: string) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
}

const PaymentTile: React.FC<PaymentTileProps> = ({ 
  payment, 
  onToggleComplete, 
  onEdit, 
  onDelete 
}) => {
  const { theme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const urgencyLevel = getUrgencyLevel(payment.dueDate);
  const daysUntil = getDaysUntilDue(payment.dueDate);
  
  const getUrgencyColor = () => {
    if (payment.isCompleted) return theme.colors.success;
    switch (urgencyLevel) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      default: return theme.colors.success;
    }
  };

  const getUrgencyText = () => {
    if (payment.isCompleted) return 'Completed';
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `Due in ${daysUntil} days`;
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(payment.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div 
      className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderLeftWidth: '4px',
        borderLeftColor: getUrgencyColor()
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 
              className="font-semibold text-base truncate"
              style={{ color: theme.colors.text }}
            >
              {payment.name}
            </h3>
            {payment.type === 'recurring' && (
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0"
                style={{
                  backgroundColor: theme.colors.secondary + '20',
                  color: theme.colors.secondary
                }}
              >
                <Repeat className="w-3 h-3" />
                Recurring
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 mb-2">
            <span 
              className="text-xl font-bold"
              style={{ color: theme.colors.primary }}
            >
              £{payment.amount.toFixed(2)}
            </span>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
              <span 
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                {formatDate(payment.dueDate)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" style={{ color: getUrgencyColor() }} />
            <span 
              className="text-sm font-medium"
              style={{ color: getUrgencyColor() }}
            >
              {getUrgencyText()}
            </span>
          </div>

          {payment.note && (
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 shrink-0" style={{ color: theme.colors.textSecondary }} />
              <p 
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
                title={payment.note}
              >
                {payment.note}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onToggleComplete(payment.id)}
            className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: theme.colors.success,
              color: '#ffffff'
            }}
            title="Mark Complete"
          >
            <Check className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEdit(payment)}
            className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: theme.colors.primary,
              color: '#ffffff'
            }}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-all duration-200 hover:opacity-80 ${
              showDeleteConfirm ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: theme.colors.error,
              color: '#ffffff'
            }}
            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div 
          className="mt-3 p-2 rounded-lg text-sm text-center font-medium"
          style={{
            backgroundColor: theme.colors.error + '20',
            color: theme.colors.error
          }}
        >
          Click delete again to confirm removal
        </div>
      )}
    </div>
  );
};

export default PaymentTile;