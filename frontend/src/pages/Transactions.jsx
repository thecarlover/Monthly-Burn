import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Filter, Download, ArrowUpRight, ArrowDownRight, Search, ChevronLeft, ChevronRight, Clock, Trash2, RefreshCcw, AlertCircle, Edit3, X, Save } from 'lucide-react';
import { getExpenses, deleteExpense, updateExpense, resetExpenses } from '../services/api';

const Transactions = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'all'
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmConfig, setConfirmConfig] = useState(null); // { title, message, onConfirm, type: 'danger' | 'info' }
    const [editingExpense, setEditingExpense] = useState(null);
    const [editFormData, setEditFormData] = useState({
        amount: '',
        category: 'Non-Essential',
        subcategory: '',
        description: '',
        date: ''
    });

    const fetchExpenses = async () => {
        try {
            const data = await getExpenses();
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteExpense(id);
            setExpenses(expenses.filter(e => e._id !== id));
            setConfirmConfig(null);
        } catch (error) {
            alert('Failed to delete transaction');
        }
    };

    const handleReset = async () => {
        setLoading(true);
        try {
            await resetExpenses();
            setExpenses([]);
            setConfirmConfig(null);
        } catch (error) {
            alert('Failed to reset data');
        } finally {
            setLoading(false);
        }
    };

    const openDeleteConfirm = (e, id) => {
        e.stopPropagation();
        setConfirmConfig({
            title: 'Delete Transaction?',
            message: 'This action cannot be undone. Are you sure you want to remove this record?',
            onConfirm: () => handleDelete(id),
            type: 'danger'
        });
    };

    const openEditModal = (exp) => {
        setEditingExpense(exp);
        setEditFormData({
            amount: exp.amount,
            category: exp.category,
            subcategory: exp.subcategory,
            description: exp.description || '',
            date: new Date(exp.date).toISOString().split('T')[0]
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updated = await updateExpense(editingExpense._id, editFormData);
            setExpenses(expenses.map(exp => exp._id === updated._id ? updated : exp));
            setEditingExpense(null);
        } catch (error) {
            alert('Failed to update transaction');
        } finally {
            setLoading(false);
        }
    };

    const openResetConfirm = (e) => {
        e.stopPropagation();
        setConfirmConfig({
            title: 'Reset All Data?',
            message: 'CRITICAL: This will permanently delete ALL your recorded expenses. This is irreversible.',
            onConfirm: handleReset,
            type: 'danger'
        });
    };

    // Filter Logic
    const filteredExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const now = new Date();

        // Search filter
        const matchesSearch = exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exp.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (period === 'daily') {
            return expDate.toDateString() === now.toDateString();
        } else if (period === 'weekly') {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            return expDate >= weekStart;
        } else if (period === 'monthly') {
            return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
        }
        return true; // 'all'
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Group by Date
    const groupedExpenses = filteredExpenses.reduce((groups, exp) => {
        const date = new Date(exp.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!groups[date]) groups[date] = [];
        groups[date].push(exp);
        return groups;
    }, {});

    if (loading) return (
        <div className="flex items-center justify-center h-screen space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-.5s]"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 relative">
            <AnimatePresence>
                {confirmConfig && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full border border-slate-100 dark:border-slate-800"
                        >
                            <div className={`w-16 h-16 rounded-3xl mb-6 flex items-center justify-center ${confirmConfig.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
                                <AlertCircle size={32} />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">{confirmConfig.title}</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">{confirmConfig.message}</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={confirmConfig.onConfirm}
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all active:scale-95 ${confirmConfig.type === 'danger' ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200' : 'bg-primary text-white hover:bg-primary-light shadow-lg shadow-primary/20'}`}
                                >
                                    Confirm Action
                                </button>
                                <button
                                    onClick={() => setConfirmConfig(null)}
                                    className="flex-1 py-4 rounded-2xl font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {editingExpense && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 max-w-xl w-full border border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-bold">Edit Transaction</h2>
                                <button onClick={() => setEditingExpense(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">Amount (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20"
                                            value={editFormData.amount}
                                            onChange={(e) => setEditFormData({ ...editFormData, amount: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20"
                                            value={editFormData.date}
                                            onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Type</label>
                                    <select
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20"
                                        value={editFormData.category}
                                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                    >
                                        <option value="Essential">Essential (Investment in Life)</option>
                                        <option value="Non-Essential">Non-Essential (Burn Area)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20"
                                        value={editFormData.subcategory}
                                        onChange={(e) => setEditFormData({ ...editFormData, subcategory: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                                >
                                    <Save size={22} />
                                    Update Record
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="w-full md:w-auto text-left">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Transaction History</h1>
                    <p className="text-slate-500 mt-1 font-medium italic font-serif">Deep audit of your monthly burn.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={(e) => openResetConfirm(e)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all border border-red-100"
                    >
                        <RefreshCcw size={18} /> Reset
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} /> Export
                    </button>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {['daily', 'weekly', 'monthly', 'all'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`flex-1 min-w-[70px] md:min-w-0 px-4 py-2 rounded-lg text-xs font-heavy capitalize transition-all ${period === p ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-primary text-white border-none shadow-xl shadow-primary/20 p-6 flex justify-between items-center">
                    <div>
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Total Period Spend</p>
                        <p className="text-3xl font-bold">₹{filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-2xl"><Calendar className="text-white" /></div>
                </div>
                <div className="card p-6 flex justify-between items-center">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Transactions</p>
                        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{filteredExpenses.length}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl"><Clock className="text-slate-400" /></div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-10">
                {Object.keys(groupedExpenses).length === 0 ? (
                    <div className="card py-20 text-center space-y-4 border-dashed border-2 border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Filter className="text-slate-300" size={32} />
                        </div>
                        <p className="text-slate-400 font-medium">No transactions found for this period.</p>
                    </div>
                ) : (
                    Object.keys(groupedExpenses).map((date) => (
                        <div key={date} className="space-y-4">
                            <h3 className="text-sm font-heavy text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="h-px bg-slate-100 flex-1"></div>
                                {date}
                                <div className="h-px bg-slate-100 flex-1"></div>
                            </h3>
                            <div className="space-y-3">
                                {groupedExpenses[date].map((exp, idx) => (
                                    <motion.div
                                        key={exp._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="card flex flex-col md:flex-row md:items-center justify-between group hover:shadow-lg transition-all gap-4 md:gap-0"
                                    >
                                        <div className="flex items-center gap-4 uppercase font-bold text-lg">
                                            <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${exp.category === 'Essential' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {exp.category === 'Essential' ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
                                            </div>
                                            <div className="min-w-0 pr-4">
                                                <h4 className="text-slate-800 dark:text-slate-100 truncate md:whitespace-normal">{exp.subcategory}</h4>
                                                <p className="text-sm text-slate-400 font-medium normal-case font-serif italic truncate md:whitespace-normal">{exp.description || 'No description'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                                            <div className="text-left md:text-right">
                                                <p className="text-xl font-bold text-slate-900 dark:text-white">₹{exp.amount.toLocaleString()}</p>
                                                <span className={`text-[10px] uppercase font-heavy tracking-wider ${exp.category === 'Essential' ? 'text-green-500' : 'text-red-500'}`}>{exp.category}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(exp); }}
                                                    className="p-3 bg-slate-50 dark:bg-slate-800 md:bg-transparent md:dark:bg-transparent text-slate-400 md:text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => openDeleteConfirm(e, exp._id)}
                                                    className="p-3 bg-slate-50 dark:bg-slate-800 md:bg-transparent md:dark:bg-transparent text-slate-400 md:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Transactions;
