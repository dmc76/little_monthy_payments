import { useState, useEffect } from 'react';
import { Payment, PaymentGroup } from '../types/Payment';
import { savePayments, loadPayments } from '../utils/storageUtils';
import { addMonthsToDate } from '../utils/dateUtils';

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Household', 'Subscriptions', 'Shopping']));
  const [groupingEnabled, setGroupingEnabled] = useState<boolean>(true);

  useEffect(() => {
    const storedPayments = loadPayments();
    // Migrate old payments without group property
    const migratedPayments = storedPayments.map(payment => ({
      ...payment,
      group: payment.group || 'Household'
    }));
    setPayments(migratedPayments);
    if (migratedPayments.length !== storedPayments.length || migratedPayments.some((p, i) => p.group !== storedPayments[i]?.group)) {
      savePayments(migratedPayments);
    }

    // Load grouping preference
    const savedGrouping = localStorage.getItem('payments-grouping-enabled');
    if (savedGrouping !== null) {
      setGroupingEnabled(JSON.parse(savedGrouping));
    }
  }, []);

  const addPayment = (payment: Omit<Payment, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isCompleted: false,
      group: payment.group || 'Household'
    };
    
    setPayments(prevPayments => {
      const updatedPayments = [...prevPayments, newPayment];
      savePayments(updatedPayments);
      return updatedPayments;
    });
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setPayments(prevPayments => {
      const updatedPayments = prevPayments.map(payment =>
        payment.id === id ? { ...payment, ...updates } : payment
      );
      savePayments(updatedPayments);
      return updatedPayments;
    });
  };

  const deletePayment = (id: string) => {
    setPayments(prevPayments => {
      const updatedPayments = prevPayments.filter(payment => payment.id !== id);
      savePayments(updatedPayments);
      return updatedPayments;
    });
  };

  const togglePaymentComplete = (id: string) => {
    setPayments(prevPayments => {
      const updatedPayments = prevPayments.map(payment =>
        payment.id === id ? { ...payment, isCompleted: !payment.isCompleted } : payment
      );
      savePayments(updatedPayments);
      return updatedPayments;
    });
  };

  const resetForNextMonth = () => {
    setPayments(prevPayments => {
      const updatedPayments = prevPayments.map(payment => {
        // Only reset recurring payments
        if (payment.type === 'recurring') {
          return {
            ...payment,
            isCompleted: false,
            dueDate: addMonthsToDate(payment.dueDate, 1)
          };
        }
        return payment;
      });
      savePayments(updatedPayments);
      return updatedPayments;
    });
  };

  const reorderPayments = (groupName: string, startIndex: number, endIndex: number) => {
    setPayments(prevPayments => {
      const activePayments = prevPayments.filter(payment => !payment.isCompleted);
      
      if (!groupingEnabled) {
        // Reorder all payments
        const result = Array.from(activePayments);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        
        // Update the full payments array
        const completedPayments = prevPayments.filter(payment => payment.isCompleted);
        const updatedPayments = [...result, ...completedPayments];
        savePayments(updatedPayments);
        return updatedPayments;
      } else {
        // Reorder within group
        const groupPayments = activePayments.filter(p => (p.group || 'Household') === groupName);
        const otherPayments = activePayments.filter(p => (p.group || 'Household') !== groupName);
        
        const result = Array.from(groupPayments);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        
        // Update the full payments array
        const completedPayments = prevPayments.filter(payment => payment.isCompleted);
        const updatedPayments = [...result, ...otherPayments, ...completedPayments];
        savePayments(updatedPayments);
        return updatedPayments;
      }
    });
  };

  const getTotalRemaining = () => {
    return payments
      .filter(payment => !payment.isCompleted)
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getPaymentGroups = (): PaymentGroup[] => {
    const activePayments = payments.filter(payment => !payment.isCompleted);
    
    if (!groupingEnabled) {
      // Return all payments in a single "All Payments" group
      return [{
        name: 'All Payments',
        payments: activePayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
        total: activePayments.reduce((sum, payment) => sum + payment.amount, 0),
        isExpanded: true
      }];
    }

    const groupMap = new Map<string, Payment[]>();

    // Group payments
    activePayments.forEach(payment => {
      const group = payment.group || 'Household';
      if (!groupMap.has(group)) {
        groupMap.set(group, []);
      }
      groupMap.get(group)!.push(payment);
    });

    // Convert to PaymentGroup array
    return Array.from(groupMap.entries()).map(([name, groupPayments]) => ({
      name,
      payments: groupPayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
      total: groupPayments.reduce((sum, payment) => sum + payment.amount, 0),
      isExpanded: expandedGroups.has(name)
    }));
  };

  const toggleGroupExpansion = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleGrouping = () => {
    const newGrouping = !groupingEnabled;
    setGroupingEnabled(newGrouping);
    localStorage.setItem('payments-grouping-enabled', JSON.stringify(newGrouping));
  };

  const getAvailableGroups = (): string[] => {
    const groups = new Set(payments.map(p => p.group || 'Household'));
    return Array.from(groups).sort();
  };

  return {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    togglePaymentComplete,
    resetForNextMonth,
    reorderPayments,
    getTotalRemaining,
    getPaymentGroups,
    toggleGroupExpansion,
    getAvailableGroups,
    groupingEnabled,
    toggleGrouping
  };
};