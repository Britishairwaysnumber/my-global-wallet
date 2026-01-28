import React, { useState } from 'react';
import axios from 'axios';
import { Wallet, ArrowUpRight, ArrowDownLeft, LogOut, PlusCircle, ShieldCheck } from 'lucide-react';

const API_URL = 'https://my-global-wallet.onrender.com/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return alert("Please fill in all fields");

    try {
      const res = await axios.post(`${API_URL}/login`, {
        email: emailInput,
        password: passwordInput
      });
      setUser(res.data.user);
      setBalance(parseFloat(res.data.wallet.balance));
      setCurrency(res.data.wallet.currency || 'USD'); // Handle GBP

      // Fetch initial data
      if (res.data.user.id === 999) {
        // Mock transactions for Dave
        setTransactions([
          { id: 1, type: 'DEPOSIT', amount: 12000.00, date: '2025-07-15', status: 'COMPLETED' }
        ]);
      } else {
        fetchData(res.data.user.id);
      }
    } catch (err) {
      alert("Login Failed: Incorrect Email or Password");
    }
  };

  const fetchData = async (userId) => {
    const res = await axios.get(`${API_URL}/data/${userId}`);
    setBalance(parseFloat(res.data.wallet.balance));
    setTransactions(res.data.transactions);
  };

  // 2. WITHDRAWAL LOGIC (The Restriction)
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);

    // The Rule: Must have 15,000 to withdraw
    const WITHDRAWAL_LIMIT = 15000;

    setLoading(true);

    setTimeout(() => {
      if (balance < WITHDRAWAL_LIMIT) {
        alert(`⚠️ WITHDRAWAL FAILED \n\nYour account balance is £${balance.toLocaleString()}.\nMinimum balance required for withdrawal is £${WITHDRAWAL_LIMIT.toLocaleString()}.\n\nPlease contact support or add funds.`);
      } else {
        alert("Withdrawal Processed via PayPal.");
      }
      setLoading(false);
    }, 1500);
  };

  // 3. ADD MONEY LOGIC (Restricted)
  const handleAddMoney = () => {
    alert("⚠️ PERMISSION DENIED\n\nCustomers cannot add funds manually.\nOnly Administrators can add money to this account.\n\nPlease log in to the Administrator Panel.");
  };

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-xl shadow-lg">
              <Wallet className="text-white w-10 h-10" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-2">Wallet App</h2>
          <p className="text-center text-slate-500 mb-8">Secure Global Payments</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg shadow-md transition-all transform active:scale-95">
              Secure Login
            </button>
          </form>
          <div className="mt-6 flex justify-center items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} /> 256-bit SSL Encrypted
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD SCREEN ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Navbar */}
      <nav className="bg-white px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Wallet size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">Wallet App</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">BUSINESS ACCOUNT</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <button onClick={() => setUser(null)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-200 font-medium mb-2 text-sm uppercase tracking-wider">Available Balance</p>
              <h1 className="text-6xl font-bold tracking-tight">
                {currency === 'GBP' ? '£' : '$'}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h1>
              <div className="mt-6 flex gap-3">
                <button onClick={handleAddMoney} className="flex items-center gap-2 bg-blue-500/30 hover:bg-blue-500/50 px-4 py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm border border-blue-400/30">
                  <PlusCircle size={16} /> Add Money
                </button>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Wallet size={250} />
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h3 className="font-bold text-lg text-slate-800 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {transactions.length === 0 ? <p className="text-slate-400 italic">No transactions found.</p> : transactions.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-xl transition cursor-default group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${t.type === 'WITHDRAWAL' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'} group-hover:scale-110 transition`}>
                      {t.type === 'WITHDRAWAL' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">{t.type === 'WITHDRAWAL' ? 'PayPal Withdrawal' : 'Deposit Received'}</p>
                      <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-lg ${t.type === 'WITHDRAWAL' ? 'text-slate-900' : 'text-green-600'}`}>
                    {t.type === 'WITHDRAWAL' ? '-' : '+'}{currency === 'GBP' ? '£' : '$'}{parseFloat(t.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          {/* Withdraw Form */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Withdraw Funds</h2>
            <form onSubmit={handleWithdraw} className="space-y-5">

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Withdrawal Method</p>
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                  <span className="italic">PayPal</span> <span className="text-xs bg-blue-200 px-2 py-0.5 rounded text-blue-700">Instant</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Amount ({currency})</label>
                <input name="amount" type="number" className="w-full p-4 border border-slate-200 rounded-xl mt-2 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg" placeholder="0.00" />
              </div>

              <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
                {loading ? "Verifying..." : "Withdraw to PayPal"}
              </button>

              <p className="text-xs text-center text-slate-400">
                For Withdrawal payment require minimum balance £15,000.
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
