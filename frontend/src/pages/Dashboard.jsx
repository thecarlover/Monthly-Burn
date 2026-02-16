import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CreditCard, AlertTriangle, Wallet, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getExpenses, getProfile, updateProfile } from '../services/api';
import WittyOracle from '../components/WittyOracle';
import { ToggleLeft, ToggleRight, Briefcase, User as UserIcon } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="card flex flex-col justify-between"
    >
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-current/10`}>
                <Icon size={24} className="text-white" />
            </div>
            <span className="text-slate-400 text-sm font-medium">{subtext}</span>
        </div>
        <div className="mt-6">
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <p className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [period, setPeriod] = useState('monthly');
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const toggleSalaryMode = async () => {
        try {
            const newMode = !user.salaryMode;
            const updatedUser = await updateProfile({ salaryMode: newMode });
            setUser(updatedUser);
            // Also update local storage to keep it sync
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Error toggling salary mode:', error);
        }
    };

    useEffect(() => {
        const initDashboard = async () => {
            try {
                const [expensesData, profileData] = await Promise.all([
                    getExpenses(),
                    getProfile()
                ]);
                setExpenses(expensesData);
                setUser(profileData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        initDashboard();
    }, []);

    // Calculate Stats
    const totalSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const essentialSpend = expenses.filter(e => e.category === 'Essential').reduce((acc, curr) => acc + curr.amount, 0);
    const subscriptionCost = expenses.filter(e => e.subcategory === 'Subscriptions' || e.subcategory.toLowerCase().includes('plan')).reduce((acc, curr) => acc + curr.amount, 0);
    const monthlyIncome = user.monthlyIncome || 0;
    const remainingBalance = monthlyIncome - totalSpend;

    // Burn Score Logic (simplified: essential/total ratio, capped)
    const burnScore = totalSpend > 0 ? Math.min(Math.round(((totalSpend - essentialSpend) / totalSpend) * 100) + 40, 100) : 0;

    // Chart Data (last 7 days)
    const chartData = [
        { name: 'Mon', amount: 0 },
        { name: 'Tue', amount: 0 },
        { name: 'Wed', amount: 0 },
        { name: 'Thu', amount: 0 },
        { name: 'Fri', amount: 0 },
        { name: 'Sat', amount: 0 },
        { name: 'Sun', amount: 0 },
    ];

    // Simple mock logic for chart buckets based on any data found
    expenses.forEach(e => {
        const day = new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' });
        const bucket = chartData.find(d => d.name === day);
        if (bucket) bucket.amount += e.amount;
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    // Pulse Theme colors based on burnScore
    const pulseTheme = burnScore > 75 ? 'bg-red-500/5' : burnScore > 50 ? 'bg-orange-500/5' : 'bg-green-500/5';
    const pulseGlow = burnScore > 75 ? 'shadow-[0_0_50px_rgba(239,68,68,0.1)]' : burnScore > 50 ? 'shadow-[0_0_50px_rgba(249,115,22,0.1)]' : 'shadow-[0_0_50px_rgba(34,197,94,0.1)]';

    return (
        <div className={`space-y-8 pb-12 min-h-screen transition-all duration-1000 ${pulseTheme} border-x-8 border-transparent`}>
            {/* Victory Particles / Zen Background */}
            {burnScore < 40 && (
                <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: -20, x: Math.random() * window.innerWidth }}
                            animate={{
                                y: window.innerHeight + 20,
                                rotate: 360,
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: Math.random() * 5 + 5,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 5
                            }}
                            className="absolute w-2 h-2 bg-green-400 rounded-full"
                        />
                    ))}
                </div>
            )}

            <div className={`relative z-10 space-y-6 md:space-y-8 ${pulseGlow} rounded-[2rem] md:rounded-[3rem] p-3 md:p-4`}>
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                    <div>
                        <h2 className="text-slate-400 font-medium text-sm md:text-base selection:bg-primary/10">Welcome back, {user.displayName || 'User'}</h2>
                        <h1 className="text-3xl md:text-4xl font-bold mt-1">Dashboard Overview</h1>
                    </div>

                    <button
                        onClick={toggleSalaryMode}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-bold text-sm shadow-xl ${user.salaryMode
                            ? 'bg-primary text-white shadow-primary/20'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700'}`}
                    >
                        <div className={`p-1.5 rounded-lg ${user.salaryMode ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                            {user.salaryMode ? <Briefcase size={16} /> : <UserIcon size={16} />}
                        </div>
                        <span className="hidden sm:inline">{user.salaryMode ? 'Salary Mode Active' : 'Normal Mode Active'}</span>
                        <span className="sm:hidden">{user.salaryMode ? 'Salary' : 'Normal'}</span>
                        {user.salaryMode ? <ToggleRight size={24} className="text-white" /> : <ToggleLeft size={24} className="text-slate-400" />}
                    </button>
                </header>

                {/* Primary Stats */}
                <div className={`grid grid-cols-1 ${user.salaryMode ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'} gap-6`}>
                    {user.salaryMode && (
                        <StatCard
                            title="Monthly Income"
                            value={`₹${monthlyIncome.toLocaleString()}`}
                            subtext="Base budget"
                            icon={Wallet}
                            color="bg-green-500"
                        />
                    )}
                    <StatCard
                        title="Total Spend"
                        value={`₹${totalSpend.toLocaleString()}`}
                        subtext="Live expenses"
                        icon={ArrowDown}
                        color="bg-primary"
                    />
                    {user.salaryMode && (
                        <motion.div
                            whileHover={{ y: -5 }}
                            className={`card flex flex-col justify-between border-none ${remainingBalance < 0 ? 'bg-red-500 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-white/20 shadow-lg">
                                    <TrendingUp size={24} className="text-white" />
                                </div>
                                <span className="text-white/70 text-sm font-medium">Balance</span>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-white/80 text-sm font-medium">Remaining Balance</h3>
                                <p className="text-3xl font-bold mt-1">₹{remainingBalance.toLocaleString()}</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {user.salaryMode && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card flex flex-col border-none bg-gradient-to-br from-primary to-primary-light text-white overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="text-blue-100 text-sm font-medium">Your Burn Score</h3>
                                <p className="text-5xl font-bold mt-2">{burnScore}</p>
                                <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${burnScore > 60 ? 'bg-orange-500' : 'bg-green-500'}`}>
                                    {burnScore > 60 ? 'High Burn 🚨' : 'Safe'}
                                </div>
                            </div>
                            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                                <AlertTriangle size={150} />
                            </div>
                        </div>
                        <StatCard
                            title="Essential Spend"
                            value={`₹${essentialSpend.toLocaleString()}`}
                            subtext={`${Math.round((essentialSpend / (totalSpend || 1)) * 100)}% of total`}
                            icon={TrendingUp}
                            color="bg-secondary-accent"
                        />
                        <StatCard
                            title="Subscription Cost"
                            value={`₹${subscriptionCost.toLocaleString()}`}
                            subtext="Recurring services"
                            icon={CreditCard}
                            color="bg-warning"
                        />
                    </div>
                )}

                {/* Salary Countdown / Excitement Box */}
                {user.salaryMode && (() => {
                    const payday = user.salaryCreditDate || 1;
                    const today = new Date();
                    const currentDay = today.getDate();
                    const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

                    let daysLeft;
                    if (currentDay <= payday) {
                        daysLeft = payday - currentDay;
                    } else {
                        daysLeft = (totalDaysInMonth - currentDay) + payday;
                    }

                    return (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-8 rounded-[2.5rem] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-center md:text-left">
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-xs font-bold tracking-wider uppercase mb-4">
                                        💰 Payday Status
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-black leading-tight">
                                        {daysLeft === 0 ? "IT'S PAYDAY! 🥳🎉" : `Next salary hits in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}!`}
                                    </h2>
                                    <p className="text-indigo-100 mt-2 font-medium">
                                        {daysLeft === 0 ? "Your wallet is about to get a major upgrade!" : "Stay strong! Financial freedom is just around the corner."}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                                    <span className="text-4xl font-black">{daysLeft}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">Days to go</span>
                                </div>
                            </div>
                            {/* Decorative background elements */}
                            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-[-50px] left-[-20px] w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl" />
                        </motion.div>
                    );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    {user.salaryMode ? (
                        <WittyOracle burnScore={burnScore} totalSpend={totalSpend} essentialSpend={essentialSpend} />
                    ) : (
                        <div className="card p-8 flex flex-col justify-center">
                            <h3 className="text-2xl font-bold mb-4">Pure Expense Tracking 🚀</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                You are currently in Normal Mode. We are only tracking your expenses without the complexity of salary or burn scores.
                            </p>
                        </div>
                    )}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="card bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col justify-center border-none shadow-2xl relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{user.salaryMode ? 'Saving Streak' : 'Activity Streak'}</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                    {user.savingStreak || 0}
                                </span>
                                <span className="text-lg md:text-xl font-bold text-slate-500 italic">Days</span>
                            </div>
                            <p className="text-slate-400 mt-4 text-xs md:text-sm font-medium">
                                {user.salaryMode ? 'Keep your burn score below 50 to grow your streak! 🎖️' : 'Log your expenses daily to keep this streak alive! 🔥'}
                            </p>
                        </div>
                        <div className="absolute top-[-20px] right-[-20px] w-32 md:w-48 h-32 md:h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                    {/* Spending Trend */}
                    <div className="lg:col-span-2 card">
                        <h3 className="text-xl font-bold mb-6">Spending Trend</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#003366" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#003366" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        cursor={{ stroke: '#003366', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#003366"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Waste Areas (Dynamic snippet) */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-6">Top Waste Areas</h3>
                        <div className="space-y-6">
                            {expenses.filter(e => e.category === 'Non-Essential').slice(0, 2).map((e, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className={`w-12 h-12 ${idx === 0 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'} rounded-2xl flex items-center justify-center`}>
                                        <ArrowDown size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold">{e.subcategory}</h4>
                                        <p className="text-slate-400 text-sm">₹{e.amount} spent</p>
                                    </div>
                                    <span className={`${idx === 0 ? 'text-orange-600' : 'text-blue-600'} font-bold`}>{e.amount > 1000 ? 'High' : 'Med'}</span>
                                </div>
                            ))}

                            {expenses.length === 0 && (
                                <p className="text-slate-400 text-sm text-center py-8">No expenses logged yet.</p>
                            )}

                            <div className="p-4 bg-secondary rounded-2xl border border-secondary-accent/20 mt-8">
                                <p className="text-primary text-sm font-medium font-serif italic">
                                    "Track your non-essential spending here to see where you can save money."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
