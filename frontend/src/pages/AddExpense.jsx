import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Utensils, ShoppingBag, Tv, Home, Train, HeartPulse, Zap, Plus, Layers, Car, GraduationCap, Globe, Coffee, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addExpense, getCategories, addCustomCategory, getProfile, getExpenses } from '../services/api';

const defaultCategories = [
    { name: 'Rent', icon: Home, type: 'Essential' },
    { name: 'Groceries', icon: ShoppingBag, type: 'Essential' },
    { name: 'Transport', icon: Train, type: 'Essential' },
    { name: 'Medical', icon: HeartPulse, type: 'Essential' },
    { name: 'Utilities', icon: Zap, type: 'Essential' },
    { name: 'Education', icon: GraduationCap, type: 'Essential' },
    { name: 'Work', icon: Briefcase, type: 'Essential' },
    { name: 'Food Ordering', icon: Utensils, type: 'Non-Essential' },
    { name: 'Entertainment', icon: Tv, type: 'Non-Essential' },
    { name: 'Shopping', icon: ShoppingBag, type: 'Non-Essential' },
    { name: 'Travel', icon: Globe, type: 'Non-Essential' },
    { name: 'Coffee', icon: Coffee, type: 'Non-Essential' },
];

const AddExpense = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customCats, setCustomCats] = useState([]);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatType, setNewCatType] = useState('Non-Essential');

    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const initForm = async () => {
            try {
                const [catsData, profileData, expensesData] = await Promise.all([
                    getCategories(),
                    getProfile(),
                    getExpenses()
                ]);

                setCustomCats(catsData.map(c => ({
                    ...c,
                    icon: Plus
                })));
                setUser(profileData);
                setExpenses(expensesData);
            } catch (error) {
                console.error('Error fetching form data:', error);
            }
        };
        initForm();
    }, []);

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const currentBalance = (user.monthlyIncome || 0) - totalSpent;
    const projectedBalance = currentBalance - (parseFloat(formData.amount) || 0);

    const allCategories = [...defaultCategories, ...customCats];

    const handleAddCustomCategory = async () => {
        if (!newCatName) return;
        try {
            const updatedCustoms = await addCustomCategory({ name: newCatName, type: newCatType });
            setCustomCats(updatedCustoms.map(c => ({ ...c, icon: Plus })));
            setFormData({ ...formData, category: newCatName });
            setShowCustomModal(false);
            setNewCatName('');
        } catch (error) {
            alert('Failed to add category');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.category) {
            alert('Please enter amount and category');
            return;
        }

        setLoading(true);
        try {
            const categoryObj = allCategories.find(c => c.name === formData.category);
            const payload = {
                amount: parseFloat(formData.amount),
                category: categoryObj.type,
                subcategory: formData.category,
                description: formData.description,
                date: formData.date,
            };

            await addExpense(payload);
            alert('Expense saved successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Failed to save expense.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <header className="mb-6 md:mb-10 text-center">
                <h1 className="text-2xl md:text-3xl font-bold">Log an Expense</h1>
                <p className="text-slate-500 mt-1 md:text-base text-sm">Where did the money go today?</p>
            </header>

            <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="card md:p-8 p-4">
                    <div className="mb-6 md:mb-8 text-center">
                        <label className="text-slate-400 text-xs md:text-sm font-medium mb-1 md:mb-2 block">Amount Spent</label>
                        <div className="flex items-center justify-center text-4xl md:text-5xl font-bold text-primary">
                            <span>₹</span>
                            <input
                                type="number"
                                placeholder="0"
                                className="bg-transparent border-none focus:outline-none w-32 md:w-48 text-center placeholder:text-slate-200"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        <div className="mt-4 flex flex-col items-center">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Live Balance After Expense</span>
                            <div className={`mt-1 text-2xl font-black ${projectedBalance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                ₹{projectedBalance.toLocaleString()}
                            </div>
                            <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(0, Math.min(100, (projectedBalance / (user.monthlyIncome || 1)) * 100))}%` }}
                                    className={`h-full ${projectedBalance < 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-500 text-sm font-medium mb-2 block">Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-2xl p-4 focus:ring-2 ring-primary/20 transition-colors"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-slate-500 text-sm font-medium mb-2 block">Description (Optional)</label>
                            <input
                                type="text"
                                placeholder="Dinner, shoes, etc."
                                className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-2xl p-4 focus:ring-2 ring-primary/20 transition-colors"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">Select Category</h3>
                        <button
                            type="button"
                            onClick={() => setShowCustomModal(true)}
                            className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                        >
                            <Plus size={16} /> Add Custom
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
                        {allCategories.map((cat) => (
                            <button
                                key={cat.name}
                                type="button"
                                onClick={() => setFormData({ ...formData, category: cat.name })}
                                className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${formData.category === cat.name
                                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                    : 'border-transparent bg-white dark:bg-slate-800 hover:border-slate-100 dark:hover:border-slate-700'
                                    }`}
                            >
                                <div className={`p-2.5 rounded-2xl mb-2 ${formData.category === cat.name ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-500'}`}>
                                    <cat.icon size={20} />
                                </div>
                                <span className="text-xs font-bold text-center leading-tight truncate w-full px-1">{cat.name}</span>
                                <span className={`text-[8px] mt-1 font-bold ${cat.type === 'Essential' ? 'text-green-500' : 'text-orange-500'}`}>
                                    {cat.type === 'Essential' ? 'ESSENTIAL' : 'LEISURE'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 btn-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] shadow-xl shadow-primary/25'}`}
                    >
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save Expense'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="btn-secondary py-4 px-8 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <X size={20} />
                        Cancel
                    </button>
                </div>
            </form>

            <AnimatePresence>
                {showCustomModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold mb-6">Custom Category</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Category Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Pet Care, Hobbies"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20"
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-4">Category Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setNewCatType('Essential')}
                                            className={`p-4 rounded-2xl font-bold border-2 transition-all ${newCatType === 'Essential' ? 'border-green-500 bg-green-50 text-green-700' : 'border-transparent bg-slate-50 text-slate-400'}`}
                                        >
                                            Essential
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewCatType('Non-Essential')}
                                            className={`p-4 rounded-2xl font-bold border-2 transition-all ${newCatType === 'Non-Essential' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-transparent bg-slate-50 text-slate-400'}`}
                                        >
                                            Leisure
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleAddCustomCategory}
                                        className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform"
                                    >
                                        Add Category
                                    </button>
                                    <button
                                        onClick={() => setShowCustomModal(false)}
                                        className="px-6 bg-slate-100 dark:bg-slate-700 rounded-2xl font-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddExpense;
