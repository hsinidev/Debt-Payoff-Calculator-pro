import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Debt, PayoffStrategy, CalculationResult } from '../types';
import { calculatePayoff } from '../services/DebtMath';

const DebtCalculatorTool: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', name: 'Credit Card', balance: 10000, apr: 22.9, minPayment: 250 },
    { id: '2', name: 'Student Loan', balance: 25000, apr: 5.8, minPayment: 300 },
    { id: '3', name: 'Car Loan', balance: 15000, apr: 4.5, minPayment: 400 },
  ]);
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', apr: '', minPayment: '' });
  const [extraPayment, setExtraPayment] = useState(200);
  const [strategy, setStrategy] = useState<PayoffStrategy>(PayoffStrategy.Avalanche);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
    if (error) {
      setError(null);
    }
  };
  
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    
    const balance = parseFloat(newDebt.balance);
    const apr = parseFloat(newDebt.apr);
    const minPayment = parseFloat(newDebt.minPayment);

    if (!newDebt.name.trim()) {
      setError("Debt name is required.");
      return;
    }
    if (isNaN(balance) || balance <= 0) {
      setError("Balance must be a positive number.");
      return;
    }
    if (isNaN(apr) || apr < 0) {
      setError("APR must be zero or a positive number.");
      return;
    }
    if (isNaN(minPayment) || minPayment <= 0) {
      setError("Minimum payment must be a positive number.");
      return;
    }
    if (minPayment > balance) {
        setError("Minimum payment cannot be greater than the balance.");
        return;
    }

    const debtToAdd: Debt = {
      id: new Date().getTime().toString(),
      name: newDebt.name.trim(),
      balance: balance,
      apr: apr,
      minPayment: minPayment,
    };
    setDebts([...debts, debtToAdd]);
    setNewDebt({ name: '', balance: '', apr: '', minPayment: '' });
    setError(null);
  };

  const handleRemoveDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };
  
  const handleCalculate = () => {
    if (debts.length === 0) {
        setError("Please add at least one debt to calculate a payoff plan.");
        return;
    }
    const result = calculatePayoff(debts, extraPayment, strategy);
    setResults(result);
    setError(null);
  };

  const chartData = useMemo(() => {
    if (!results) return [];
    const data: any[] = [];
    const numMonths = results.summary.totalMonths;
    const debtNames = debts.map(d => d.name);

    for (let i = 0; i <= numMonths; i++) {
        const entry: { [key: string]: any } = { month: i };
        let totalBalance = 0;
        debtNames.forEach(name => {
            const debtSchedule = results.schedule.find(s => s.debtName === name);
            let balance = 0;
            if (i === 0) {
                balance = debts.find(d => d.name === name)?.balance || 0;
            } else if (debtSchedule && debtSchedule.payments[i-1]) {
                balance = debtSchedule.payments[i-1].remainingBalance;
            }
            entry[name] = balance;
            totalBalance += balance;
        });
        entry['Total Balance'] = totalBalance;
        data.push(entry);
    }
    return data;
  }, [results, debts]);

  const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  return (
    <section className="bg-gray-800/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700">
      {/* Debt Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">1. Enter Your Debts</h2>
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-lg relative mb-4 flex items-center justify-between" role="alert">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-2xl font-bold leading-none ml-4">&times;</button>
            </div>
          )}
          <form onSubmit={handleAddDebt} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input type="text" name="name" placeholder="Debt Name (e.g., Credit Card)" value={newDebt.name} onChange={handleInputChange(setNewDebt)} className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400" />
            <input type="number" name="balance" placeholder="Balance ($)" value={newDebt.balance} onChange={handleInputChange(setNewDebt)} className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400" />
            <input type="number" name="apr" placeholder="APR (%)" value={newDebt.apr} onChange={handleInputChange(setNewDebt)} className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400" />
            <input type="number" name="minPayment" placeholder="Min. Payment ($)" value={newDebt.minPayment} onChange={handleInputChange(setNewDebt)} className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400" />
            <button type="submit" className="sm:col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Add Debt</button>
          </form>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {debts.map(debt => (
              <div key={debt.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{debt.name}</p>
                  <p className="text-sm text-gray-300">{currencyFormatter.format(debt.balance)} @ {debt.apr}% APR</p>
                </div>
                <button onClick={() => handleRemoveDebt(debt.id)} className="text-red-400 hover:text-red-300 font-bold text-xl px-2">&times;</button>
              </div>
            ))}
          </div>
        </div>
        {/* Strategy Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">2. Set Your Strategy</h2>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-300">Extra Monthly Payment</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">$</span>
              <input type="number" value={extraPayment} onChange={e => setExtraPayment(parseFloat(e.target.value) || 0)} className="bg-gray-700 border border-gray-600 rounded-md p-2 pl-7 w-full text-white"/>
            </div>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-300">Payoff Method</label>
            <div className="flex space-x-4">
              <button onClick={() => setStrategy(PayoffStrategy.Avalanche)} className={`flex-1 p-3 rounded-md text-left transition-all ${strategy === PayoffStrategy.Avalanche ? 'bg-purple-600 ring-2 ring-purple-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <p className="font-bold">Avalanche</p>
                <p className="text-sm text-gray-300">Highest interest first.</p>
              </button>
              <button onClick={() => setStrategy(PayoffStrategy.Snowball)} className={`flex-1 p-3 rounded-md text-left transition-all ${strategy === PayoffStrategy.Snowball ? 'bg-pink-600 ring-2 ring-pink-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <p className="font-bold">Snowball</p>
                <p className="text-sm text-gray-300">Lowest balance first.</p>
              </button>
            </div>
          </div>
          <button onClick={handleCalculate} className="w-full mt-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg text-lg transition-opacity">Calculate Payoff Plan</button>
        </div>
      </div>
      
      {/* Results Section */}
      {results && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center mb-6">Your Payoff Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-8">
            <div className="bg-gray-700 p-4 rounded-lg"><p className="text-2xl font-bold text-purple-400">{results.summary.payoffDate}</p><p className="text-gray-400">Payoff Date</p></div>
            <div className="bg-gray-700 p-4 rounded-lg"><p className="text-2xl font-bold text-pink-400">{currencyFormatter.format(results.summary.totalInterestPaid)}</p><p className="text-gray-400">Total Interest Paid</p></div>
            <div className="bg-gray-700 p-4 rounded-lg"><p className="text-2xl font-bold text-green-400">{results.summary.totalMonths} months</p><p className="text-gray-400">Time to Freedom</p></div>
          </div>
          
          <div className="bg-gray-900/70 p-4 rounded-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Debt Payoff Timeline</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -10 }} stroke="#A0AEC0"/>
                <YAxis tickFormatter={(tick) => currencyFormatter.format(tick)} stroke="#A0AEC0"/>
                <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} labelStyle={{ color: '#E2E8F0' }}/>
                <Legend />
                <Line type="monotone" dataKey="Total Balance" stroke="#8884d8" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Amortization Schedule</h3>
            <div className="space-y-4">
              {results.schedule.map(debtPlan => (
                <details key={debtPlan.debtName} className="bg-gray-800 rounded-lg p-4">
                  <summary className="font-semibold cursor-pointer">{debtPlan.debtName} - Payoff: {debtPlan.payoffDate}</summary>
                  <div className="overflow-x-auto mt-2 max-h-80">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-700 sticky top-0">
                        <tr>
                          <th className="p-2">Date</th><th className="p-2">Payment</th><th className="p-2">Principal</th><th className="p-2">Interest</th><th className="p-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debtPlan.payments.map(p => (
                          <tr key={`${debtPlan.debtName}-${p.year}-${p.month}`} className="border-b border-gray-700">
                            <td className="p-2">{p.month}/{p.year}</td>
                            <td className="p-2">{currencyFormatter.format(p.payment)}</td>
                            <td className="p-2">{currencyFormatter.format(p.principal)}</td>
                            <td className="p-2 text-red-400">{currencyFormatter.format(p.interest)}</td>
                            <td className="p-2 text-green-400">{currencyFormatter.format(p.remainingBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DebtCalculatorTool;