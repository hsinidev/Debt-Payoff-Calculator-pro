export enum PayoffStrategy {
  Snowball = 'snowball',
  Avalanche = 'avalanche',
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
}

export interface Payment {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface DebtPayoffPlan {
  debtName: string;
  payments: Payment[];
  totalInterestPaid: number;
  payoffDate: string;
}

export interface PayoffSummary {
  totalMonths: number;
  payoffDate: string;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
}

export interface CalculationResult {
  schedule: DebtPayoffPlan[];
  summary: PayoffSummary;
}
