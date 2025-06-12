export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getUrgencyLevel = (dueDate: string): 'high' | 'medium' | 'low' => {
  const daysUntil = getDaysUntilDue(dueDate);
  
  if (daysUntil <= 0) return 'high';
  if (daysUntil <= 3) return 'medium';
  return 'low';
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const addMonthsToDate = (dateStr: string, months: number): string => {
  const date = new Date(dateStr);
  const currentDay = date.getDate();
  
  // Add the months
  date.setMonth(date.getMonth() + months);
  
  // Handle end-of-month scenarios
  // If the original day was the last day of the month, make sure the new date is also the last day
  const originalDate = new Date(dateStr);
  const lastDayOfOriginalMonth = new Date(originalDate.getFullYear(), originalDate.getMonth() + 1, 0).getDate();
  
  if (currentDay === lastDayOfOriginalMonth) {
    // Set to last day of the new month
    const lastDayOfNewMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(lastDayOfNewMonth);
  } else if (date.getDate() !== currentDay) {
    // This happens when the target month has fewer days (e.g., Jan 31 -> Feb 28)
    // Set to the last day of the target month
    date.setDate(0);
  }
  
  return date.toISOString().split('T')[0];
};