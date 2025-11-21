import { Debt, PayoffStrategy, CalculationResult, DebtPayoffPlan, Payment, PayoffSummary } from '../types';

export const calculatePayoff = (
  initialDebts: Debt[],
  extraPayment: number,
  strategy: PayoffStrategy
): CalculationResult => {
  if (initialDebts.length === 0) {
    return { schedule: [], summary: { totalMonths: 0, payoffDate: "N/A", totalInterestPaid: 0, totalPrincipalPaid: 0 } };
  }

  let debts: Debt[] = JSON.parse(JSON.stringify(initialDebts));
  let schedule: DebtPayoffPlan[] = debts.map(d => ({
    debtName: d.name,
    payments: [],
    totalInterestPaid: 0,
    payoffDate: ''
  }));

  let debtOrder = [...debts];
  if (strategy === PayoffStrategy.Snowball) {
    debtOrder.sort((a, b) => a.balance - b.balance);
  } else { // Avalanche
    debtOrder.sort((a, b) => b.apr - a.apr);
  }
  
  const debtMap = new Map<string, Debt>(debts.map(d => [d.id, { ...d }]));
  const scheduleMap = new Map<string, DebtPayoffPlan>(schedule.map(s => [s.debtName, s]));

  let totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);
  let snowball = 0;
  
  let month = 0;
  const startDate = new Date();

  while (Array.from(debtMap.values()).some(d => d.balance > 0)) {
    month++;
    
    let paymentPool = totalMinPayment + extraPayment + snowball;
    
    let paidOffThisMonthIds: string[] = [];

    // Create a payment plan for this month to avoid mutation issues
    const monthlyPayments = new Map<string, number>();

    // First, allocate minimum payments
    for (const debt of debtOrder) {
      if (debtMap.get(debt.id)!.balance > 0) {
        monthlyPayments.set(debt.id, debt.minPayment);
        paymentPool -= debt.minPayment;
      }
    }

    // Then, add extra payment + snowball to the target debt
    const targetDebt = debtOrder.find(d => debtMap.get(d.id)!.balance > 0);
    if(targetDebt) {
      const currentPayment = monthlyPayments.get(targetDebt.id) || 0;
      monthlyPayments.set(targetDebt.id, currentPayment + paymentPool);
    }
    
    // Process payments for the month
    for(const debt of debtOrder){
      const currentDebtState = debtMap.get(debt.id)!;
      if (currentDebtState.balance <= 0) continue;

      const monthlyInterest = (currentDebtState.balance * (currentDebtState.apr / 100)) / 12;
      let paymentAmount = monthlyPayments.get(debt.id) || 0;
      
      if (currentDebtState.balance + monthlyInterest < paymentAmount) {
          paymentAmount = currentDebtState.balance + monthlyInterest;
      }

      const principal = paymentAmount - monthlyInterest;
      currentDebtState.balance -= principal;

      const currentSchedule = scheduleMap.get(debt.name)!;
      const paymentDate = new Date(startDate.getFullYear(), startDate.getMonth() + month, 1);
      currentSchedule.payments.push({
          month: paymentDate.getMonth() + 1,
          year: paymentDate.getFullYear(),
          payment: paymentAmount,
          interest: monthlyInterest,
          principal: principal,
          remainingBalance: currentDebtState.balance < 0 ? 0 : currentDebtState.balance
      });
      currentSchedule.totalInterestPaid += monthlyInterest;

      if (currentDebtState.balance <= 0) {
          paidOffThisMonthIds.push(debt.id);
          currentDebtState.balance = 0;
      }
    }
    
    paidOffThisMonthIds.forEach(id => {
        const paidDebt = initialDebts.find(d => d.id === id);
        if (paidDebt) {
            snowball += paidDebt.minPayment;
        }
    });

    if (month > 1200) break; // Safety break after 100 years
  }

  const finalSchedule = Array.from(scheduleMap.values());
  finalSchedule.forEach(s => {
    if (s.payments.length > 0) {
      const lastPayment = s.payments[s.payments.length - 1];
      s.payoffDate = new Date(lastPayment.year, lastPayment.month -1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  });

  const payoffDate = new Date(startDate.getFullYear(), startDate.getMonth() + month -1, 1);
  const totalInterestPaid = finalSchedule.reduce((sum, s) => sum + s.totalInterestPaid, 0);
  const totalPrincipalPaid = initialDebts.reduce((sum, d) => sum + d.balance, 0);

  const summary: PayoffSummary = {
    totalMonths: month,
    payoffDate: payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    totalInterestPaid,
    totalPrincipalPaid,
  };

  return { schedule: finalSchedule, summary };
};
