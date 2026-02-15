import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, PieChart, Lightbulb, Bell, Settings, LogOut, Sun, Moon, Clock } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/add-expense', icon: PlusCircle, label: 'Add Expense' },
        { path: '/transactions', icon: Clock, label: 'Transactions' },
        { path: '/analytics', icon: PieChart, label: 'Analytics' },
        { path: '/suggestions', icon: Lightbulb, label: 'Smart Insights' },
        { path: '/leak-detector', icon: Bell, label: 'Leak Detector' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col p-6 fixed z-50">
                <Link to="/" className="flex items-center gap-3 mb-10 group">
                    <div className="w-10 h-10 group-hover:scale-110 transition-transform">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent dark:from-sky-400 dark:to-blue-500">
                        Monthly Burn
                    </h1>
                </Link>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 hover:translate-x-1'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 rounded-2xl transition-all"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50">
                {navItems.slice(0, 5).map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 transition-all ${isActive
                                ? 'text-primary dark:text-sky-400 scale-110'
                                : 'text-slate-400'
                            }`
                        }
                    >
                        <item.icon size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
                    </NavLink>
                ))}
            </div>
        </>
    );
};

export default Sidebar;
