import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingDown, Target, Zap, ArrowRight, Save, CheckCircle } from 'lucide-react';
import { getAnalytics } from '../services/api';

const iconMap = {
    Zap: Zap,
    TrendingDown: TrendingDown,
    Target: Target,
    Lightbulb: Lightbulb
};

const SmartSuggestions = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applied, setApplied] = useState([]);
    const [goalSet, setGoalSet] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAnalytics();
                setAnalytics(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleSuggestion = (id) => {
        if (applied.includes(id)) {
            setApplied(applied.filter(a => a !== id));
        } else {
            setApplied([...applied, id]);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Evaluating your spending patterns...</div>;

    const insights = analytics?.insights || [];

    return (
        <div className="space-y-8 pb-12">
            <header>
                <h1 className="text-4xl font-bold">Smart AI Suggestions</h1>
                <p className="text-slate-500 mt-2">Personalized insights to help you reduce your monthly burn.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">Actionable Insights</h3>
                    {insights.length === 0 ? (
                        <div className="card text-center py-12">
                            <Lightbulb className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-400">Add more expenses to generate AI insights.</p>
                        </div>
                    ) : (
                        insights.map((s) => {
                            const Icon = iconMap[s.iconType] || Lightbulb;
                            return (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`card group cursor-pointer transition-all ${applied.includes(s.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}
                                    onClick={() => toggleSuggestion(s.id)}
                                >
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-2xl transition-all ${applied.includes(s.id) ? 'bg-primary text-white' : 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                                            {applied.includes(s.id) ? <CheckCircle size={24} /> : <Icon size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-bold text-lg leading-tight">{s.title}</h4>
                                                <span className="text-secondary-accent font-bold whitespace-nowrap text-sm">Save {s.potentialSavings}</span>
                                            </div>
                                            <p className="text-slate-500 mt-2 text-sm leading-relaxed">{s.description}</p>
                                            <button className={`mt-4 flex items-center gap-2 font-bold text-sm ${applied.includes(s.id) ? 'text-green-600' : 'text-primary'}`}>
                                                {applied.includes(s.id) ? 'Applied' : 'Apply Suggestion'} <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                <div className="space-y-8">
                    <div className="card bg-primary text-white border-none shadow-xl shadow-primary/20">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Target size={24} />
                            Recommended Budget
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-primary-light/30">
                                <span className="text-blue-100 italic font-serif">Essentials</span>
                                <span className="font-bold">₹{analytics?.essentialSpend?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-primary-light/30">
                                <span className="text-blue-100 italic font-serif">Leisure (Target)</span>
                                <span className="font-bold">₹{Math.round((analytics?.totalSpend || 0) * 0.1).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-blue-100 italic font-serif">Savings Potential</span>
                                <span className="font-bold text-secondary-accent">₹{analytics?.savingsPotential?.toLocaleString() || '0'}</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setGoalSet(!goalSet);
                            }}
                            className={`w-full mt-6 py-3 rounded-2xl font-bold transition-all ${goalSet ? 'bg-green-500 text-white' : 'bg-white text-primary hover:bg-blue-50'}`}
                        >
                            {goalSet ? 'Goal Active ✨' : 'Set as Monthly Goal'}
                        </button>
                    </div>

                    <div className="card">
                        <h3 className="text-xl font-bold mb-6">Efficiency Pulse</h3>
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700 p-6 rounded-3xl">
                            <div>
                                <p className="text-4xl font-bold text-primary">{100 - (analytics?.burnScore || 0)}%</p>
                                <p className="text-slate-500 text-sm mt-1">Efficiency Rating</p>
                            </div>
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${i < Math.round((100 - (analytics?.burnScore || 0)) / 20) ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}
                                    >
                                        {i < Math.round((100 - (analytics?.burnScore || 0)) / 20) ? <CheckCircle size={14} /> : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-center text-slate-400 text-xs mt-4">Based on your Essential vs Non-Essential spend ratio.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartSuggestions;

