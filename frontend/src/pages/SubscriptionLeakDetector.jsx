import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, CheckCircle2, RefreshCw, Smartphone, Monitor, Shield, X, Plus, Trash2, Loader2, Play, Tv, Headphones, Zap } from 'lucide-react';
import { getSubscriptions, getAnalytics, addSubscription, updateSubscription } from '../services/api';

const iconMap = {
    'Netflix': Tv,
    'Disney+ Hotstar': Tv,
    'Amazon Prime': Play,
    'Spotify': Headphones,
    'Generic': Zap
};

const SubscriptionLeakDetector = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // New Subscription Form State
    const [newSub, setNewSub] = useState({
        name: '',
        cost: '',
        billingCycle: 'Monthly',
        usageFrequency: 'Medium'
    });

    const fetchData = async () => {
        try {
            const [subsData, analyticsData] = await Promise.all([
                getSubscriptions(),
                getAnalytics()
            ]);
            setSubscriptions(subsData.filter(s => s.isActive));
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Error fetching leak detector data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddSubscription = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await addSubscription({
                ...newSub,
                cost: parseFloat(newSub.cost)
            });
            setShowAddModal(false);
            setNewSub({ name: '', cost: '', billingCycle: 'Monthly', usageFrequency: 'Medium' });
            await fetchData();
        } catch (error) {
            alert('Failed to add subscription');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResolveNow = async () => {
        setActionLoading(true);
        try {
            const lowUsage = subscriptions.filter(s => s.usageFrequency === 'Low');
            await Promise.all(lowUsage.map(s => updateSubscription(s._id, { isActive: false })));
            setDismissed(true);
            await fetchData();
        } catch (error) {
            alert('Failed to resolve leaks');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Checking for subscription leaks...</div>;

    const redundancyInsight = analytics?.insights?.find(i => i.id === 'subscriptions-limit');

    return (
        <div className="space-y-8 pb-12">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold">Subscription Leak Detector</h1>
                    <p className="text-slate-500 mt-2">
                        {dismissed ? 'Your subscription health is looking better!' : `We found ${subscriptions.length} active recurring payments.`}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white p-4 rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2 font-bold"
                >
                    <Plus size={20} />
                    Add New
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">Active Subscriptions</h3>
                    {subscriptions.length === 0 ? (
                        <div className="card text-center py-12 bg-slate-50 border-dashed border-2 border-slate-200">
                            <Zap className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-400 font-medium">No active subscriptions detected.</p>
                        </div>
                    ) : (
                        subscriptions.map((sub) => {
                            const Icon = iconMap[sub.name] || iconMap['Generic'];
                            return (
                                <div key={sub._id} className="card flex items-center gap-6 group hover:translate-x-2 transition-all">
                                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg">{sub.name}</h4>
                                        <p className="text-slate-400 text-sm">₹{sub.cost.toLocaleString()} / {sub.billingCycle}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-heavy inline-block mb-1 ${sub.usageFrequency === 'Low' ? 'bg-red-100 text-red-600' :
                                            sub.usageFrequency === 'Medium' ? 'bg-orange-100 text-orange-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                            {sub.usageFrequency} Usage
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1">RENEWAL: {new Date(sub.nextRenewal || Date.now() + 86400000 * 7).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="space-y-6">
                    {!dismissed && redundancyInsight && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-500/20 ring-1 ring-orange-200 dark:ring-orange-500/30 shadow-xl shadow-orange-500/5"
                        >
                            <div className="flex gap-4">
                                <div className="p-3 bg-orange-500 rounded-2xl text-white h-fit shadow-lg shadow-orange-500/40">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200">{redundancyInsight.title}</h3>
                                    <p className="text-orange-800 dark:text-orange-300 mt-2 text-sm leading-relaxed">
                                        {redundancyInsight.description}
                                    </p>
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            disabled={actionLoading}
                                            onClick={handleResolveNow}
                                            className="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                                        >
                                            {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                            Resolve All Leaks
                                        </button>
                                        <button
                                            onClick={() => setDismissed(true)}
                                            className="text-orange-700 dark:text-orange-400 px-4 py-2 text-sm font-bold hover:bg-orange-100 dark:hover:bg-white/5 rounded-xl transition-all"
                                        >
                                            Ignore
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="card">
                        <header className="flex justify-between items-center mb-6">
                            <h3 className="font-bold flex items-center gap-2 text-lg">
                                <RefreshCw size={20} className="text-primary" />
                                Efficiency Forecast
                            </h3>
                            <button className="text-primary text-xs font-bold hover:underline">View All</button>
                        </header>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm text-slate-500">Current Efficiency</span>
                                    <span className="text-xl font-bold">{100 - (analytics?.burnScore || 0)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-600 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${100 - (analytics?.burnScore || 0)}%` }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                You could increase your efficiency to <b>92%</b> by switching Netflix to an annual plan and pausing the Disney+ subscription which has "Low" recorded usage.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Subscription Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl"
                        >
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-2xl font-bold mb-6">Add Subscription</h2>
                            <form onSubmit={handleAddSubscription} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Service Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Netflix, Spotify"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                        value={newSub.name}
                                        onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">Cost (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder="299"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                            value={newSub.cost}
                                            onChange={(e) => setNewSub({ ...newSub, cost: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">Frequency</label>
                                        <select
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white appearance-none"
                                            value={newSub.usageFrequency}
                                            onChange={(e) => setNewSub({ ...newSub, usageFrequency: e.target.value })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    disabled={actionLoading}
                                    type="submit"
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading && <Loader2 className="animate-spin" size={18} />}
                                    Add Subscription
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubscriptionLeakDetector;
