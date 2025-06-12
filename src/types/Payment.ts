export interface Payment {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: 'recurring' | 'one-off';
  recurringDuration?: string;
  customEndDate?: string;
  note: string;
  isCompleted: boolean;
  createdAt: string;
  group: string;
}

export interface PaymentGroup {
  name: string;
  payments: Payment[];
  total: number;
  isExpanded: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  items: ProjectItem[];
  totalAmount: number;
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  amount: number;
  note: string;
  isSelected: boolean;
  isCompleted: boolean;
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    border: string;
  };
}

export type PaymentFilter = 'all' | 'recurring' | 'one-off';
export type AppPage = 'payments' | 'projects';