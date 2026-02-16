import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, PieChart, Lightbulb, Bell, Settings, LogOut, Sun, Moon, Clock, MoreHorizontal, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });
    const [showMobileMore, setShowMobileMore] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

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

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
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
                {navItems.slice(0, 4).map((item) => (
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
                        <item.icon size={22} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
                    </NavLink>
                ))}
                <button
                    onClick={() => setShowMobileMore(true)}
                    className={`flex flex-col items-center gap-1 transition-all ${showMobileMore ? 'text-primary dark:text-sky-400' : 'text-slate-400'}`}
                >
                    <MoreHorizontal size={22} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">More</span>
                </button>
            </div>

            {/* Mobile More Overlay */}
            <AnimatePresence>
                {showMobileMore && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileMore(false)}
                            className="md:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[32px] p-8 z-[70] border-t border-slate-100 dark:border-slate-800 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold dark:text-white">Menu</h2>
                                <button
                                    onClick={() => setShowMobileMore(false)}
                                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Link
                                    to="/settings"
                                    onClick={() => setShowMobileMore(false)}
                                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-700 dark:text-slate-200"
                                >
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                        <Settings size={20} />
                                    </div>
                                    <span className="font-semibold">Settings</span>
                                </Link>

                                <button
                                    onClick={() => {
                                        setDarkMode(!darkMode);
                                        setShowMobileMore(false);
                                    }}
                                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-700 dark:text-slate-200"
                                >
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                    </div>
                                    <span className="font-semibold">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                                </button>

                                {deferredPrompt && (
                                    <button
                                        onClick={() => {
                                            handleInstallClick();
                                            setShowMobileMore(false);
                                        }}
                                        className="flex items-center gap-4 p-4 bg-primary/10 rounded-2xl text-primary dark:text-sky-400"
                                    >
                                        <div className="p-2 bg-primary text-white rounded-xl shadow-md">
                                            <Download size={20} />
                                        </div>
                                        <span className="font-bold">Add to Home Screen</span>
                                    </button>
                                )}

                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl text-red-500"
                                >
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                        <LogOut size={20} />
                                    </div>
                                    <span className="font-semibold">Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
