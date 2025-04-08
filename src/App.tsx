import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  MinusCircle,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  Coffee,
  Shirt,
  GraduationCap,
  Heart,
  ShoppingBag,
  Dog,
  Sofa,
  Gift,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  date: string;
};

type MonthlyTotal = {
  month: string;
  income: number;
  expense: number;
  balance: number;
  date: string;
};

const EXPENSE_CATEGORIES = [
  { name: 'Food', icon: Coffee },
  { name: 'Clothing', icon: Shirt },
  { name: 'Education', icon: GraduationCap },
  { name: 'Health', icon: Heart },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Pet', icon: Dog },
  { name: 'Furniture', icon: Sofa },
  { name: 'Gift', icon: Gift }
];

const CHART_COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#FF6384',
  '#36A2EB',
];

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>(() => {
    const saved = localStorage.getItem('monthlyTotals');
    return saved ? JSON.parse(saved) : [];
  });

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [showDashboard, setShowDashboard] = useState(false);
  
  

  const getCurrentMonthKey = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getMonthlyData = () => {
    const currentMonthKey = getCurrentMonthKey();
    const currentTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}` === currentMonthKey;
    });

    const monthlyIncome = currentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = currentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const expensesByCategory = EXPENSE_CATEGORIES.map(cat => ({
      category: cat.name,
      amount: currentTransactions
        .filter(t => t.type === 'expense' && t.category === cat.name)
        .reduce((sum, t) => sum + t.amount, 0)
    }));

    return {
      income: monthlyIncome,
      expenses: monthlyExpenses,
      balance: monthlyIncome - monthlyExpenses,
      byCategory: expensesByCategory
    };
  };

  const monthlyData = getMonthlyData();

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('monthlyTotals', JSON.stringify(monthlyTotals));
  }, [transactions, monthlyTotals]);

  const handleMonthlyReset = () => {
    const currentMonthKey = getCurrentMonthKey();
    const currentData = getMonthlyData();
    
    setMonthlyTotals(prev => [...prev, {
      month: currentMonthKey,
      income: currentData.income,
      expense: currentData.expenses,
      balance: currentData.balance,
      date: new Date().toISOString()
    }]);

      // Archive this month's transactions
    setTransactions(prev => prev.map(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return key === currentMonthKey ? { ...t, archived: true } : t;
    }));

    // Keep transactions but start fresh monthly totals
    const newTransactions = transactions.map(t => ({
      ...t,
      archived: true
    }));
    setTransactions(newTransactions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: activeTab,
      amount: parseFloat(amount),
      category: activeTab === 'expense' ? category : undefined,
      date: new Date().toISOString()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setAmount('');
  };

  const barChartData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [monthlyData.income, monthlyData.expenses],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      },
    ],
  };

  const doughnutChartData = {
    labels: EXPENSE_CATEGORIES.map(cat => cat.name),
    datasets: [
      {
        data: monthlyData.byCategory.map(item => item.amount),
        backgroundColor: CHART_COLORS,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Monthly Stats */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Monthly Overview
            </h1>
            <button
              onClick={handleMonthlyReset}
              className="text-sm text-blue-600 flex items-center gap-1 hover:underline"
              title="Reset current month's data and archive transactions"
            >
              <RefreshCw size={16} /> Reset Month
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-sm font-medium text-green-600 mb-1">Income</p>
              <p className="text-xl font-bold text-green-700">
                ${monthlyData.income.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl">
              <p className="text-sm font-medium text-red-600 mb-1">Expenses</p>
              <p className="text-xl font-bold text-red-700">
                ${monthlyData.expenses.toFixed(2)}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${monthlyData.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <p className={`text-sm font-medium ${monthlyData.balance >= 0 ? 'text-blue-600' : 'text-orange-600'} mb-1`}>Balance</p>
              <p className={`text-xl font-bold ${monthlyData.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                ${monthlyData.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Dashboard */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Analytics</h2>
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="text-blue-500 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
            >
              <BarChart3 size={24} />
            </button>
          </div>
          
          {showDashboard && (
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Income vs Expenses</h3>
                <Bar data={barChartData} options={{ responsive: true }} />
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Expenses by Category</h3>
                <Doughnut data={doughnutChartData} options={{ responsive: true }} />
              </div>
            </div>
          )}
        </div>

        {/* Transaction Form */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-6">
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setActiveTab('income')}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'income' 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ArrowUpCircle size={20} />
              Income
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'expense' 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ArrowDownCircle size={20} />
              Expense
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter amount"
                step="0.01"
                min="0"
                required
              />
            </div>

            {activeTab === 'expense' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {EXPENSE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setCategory(cat.name)}
                        className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                          category === cat.name
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Icon size={24} />
                        <span className="text-xs font-medium">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all ${
                activeTab === 'income' 
                  ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200'
                  : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
              }`}
            >
              {activeTab === 'income' ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
              Add {activeTab === 'income' ? 'Income' : 'Expense'}
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.filter(t => !t.archived).map((transaction) => {
              const categoryIcon = transaction.type === 'expense'
                ? EXPENSE_CATEGORIES.find(cat => cat.name === transaction.category)?.icon
                : null;
              const Icon = categoryIcon;

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {Icon ? <Icon size={20} /> : <Wallet size={20} />}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? 'Income' : transaction.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                </div>
              );
            })}
            {transactions.filter(t => !t.archived).length === 0 && (
              <p className="text-center text-gray-500 py-4">No transactions yet</p>
            )}
          </div>
        </div>

        {/* Monthly History */}
        {monthlyTotals.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Monthly History</h2>
            <div className="space-y-3">
            {monthlyTotals.map((total, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-700">{total.month}</p>
                  <p className="text-xs text-gray-500">{new Date(total.date).toLocaleDateString()}</p>
                </div>
                <p className={`font-bold ${total.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${total.balance.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-green-600">Income: ${total.income.toFixed(2)}</p>
                <p className="text-red-600">Expenses: ${total.expense.toFixed(2)}</p>
              </div>
            </div>
          ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;