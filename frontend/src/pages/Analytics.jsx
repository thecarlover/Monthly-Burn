import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { getExpenses } from '../services/api';

const Analytics = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchExpenses();
    }, []);

    // Helper to group by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Derived Data
    const categoryTotals = expenses.reduce((acc, exp) => {
        let cat = 'Leisure';
        if (exp.category === 'Essential') cat = 'Essentials';
        else if (['Food Ordering', 'Online Shopping', 'Entertainment'].includes(exp.subcategory)) cat = 'Waste';

        acc[cat] = (acc[cat] || 0) + exp.amount;
        return acc;
    }, { Essentials: 0, Leisure: 0, Waste: 0 });

    const categoryData = [
        { name: 'Essentials', value: categoryTotals.Essentials, color: '#003366' },
        { name: 'Leisure', value: categoryTotals.Leisure, color: '#38b2ac' },
        { name: 'Waste', value: categoryTotals.Waste, color: '#ff9800' },
    ].filter(d => d.value > 0);

    // Group by month for trend data
    const monthlyDataMap = expenses.reduce((acc, exp) => {
        const date = new Date(exp.date);
        const month = months[date.getMonth()];

        if (!acc[month]) {
            acc[month] = { month, essential: 0, leisure: 0, waste: 0 };
        }

        if (exp.category === 'Essential') {
            acc[month].essential += exp.amount;
        } else if (['Food Ordering', 'Online Shopping', 'Entertainment'].includes(exp.subcategory)) {
            acc[month].waste += exp.amount;
        } else {
            acc[month].leisure += exp.amount;
        }

        return acc;
    }, {});

    const trendData = Object.values(monthlyDataMap).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));

    if (loading) return <div className="flex items-center justify-center h-screen">Loading Analytics...</div>;

    return (
        <div className="space-y-6 md:space-y-8 pb-12 px-2 md:px-0">
            <header>
                <h1 className="text-3xl md:text-4xl font-bold">Financial Analytics</h1>
                <p className="text-slate-500 mt-1 md:mt-2 text-sm md:text-base">Deep dive into your spending patterns and trends.</p>
            </header>

            {expenses.length === 0 ? (
                <div className="card text-center py-20">
                    <p className="text-slate-400 text-lg">No expense data available to analyze yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                    {/* Category Breakdown */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-6">Spending Breakdown</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Burn Trend */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-6">Essential vs Non-Essential</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="essential" fill="#003366" radius={[4, 4, 0, 0]} name="Essential" />
                                    <Bar dataKey="leisure" fill="#38b2ac" radius={[4, 4, 0, 0]} name="Leisure" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Long term trend */}
                    <div className="lg:col-span-2 card">
                        <h3 className="text-xl font-bold mb-6">Monthly Burn Trend</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="waste" stroke="#ff9800" strokeWidth={4} dot={{ r: 6, fill: '#ff9800' }} name="Historical Waste" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
