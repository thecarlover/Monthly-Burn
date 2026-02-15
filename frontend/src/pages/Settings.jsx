import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, CreditCard, HelpCircle, ChevronRight, Save, X, Trash2, Loader2, LogOut } from 'lucide-react';
import { updateProfile, deleteAccount, changePassword } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [activeSection, setActiveSection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: user.displayName || '',
        email: user.email || '',
        monthlyIncome: user.monthlyIncome || '',
        currency: user.currency || '₹',
        notificationsEnabled: user.notificationsEnabled ?? true,
        salaryCreditDate: user.salaryCreditDate || 1,
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("New passwords don't match");
            return;
        }
        setLoading(true);
        try {
            await changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            alert('Password updated successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                monthlyIncome: parseFloat(formData.monthlyIncome) || 0
            };
            const updated = await updateProfile(dataToSave);
            setUser(updated);
            setFormData({
                displayName: updated.displayName || '',
                email: updated.email || '',
                monthlyIncome: updated.monthlyIncome || '',
                currency: updated.currency || '₹',
                notificationsEnabled: updated.notificationsEnabled ?? true,
                salaryCreditDate: updated.salaryCreditDate || 1,
            });
            setActiveSection(null);
            alert('Settings updated successfully!');
        } catch (error) {
            console.error('Update Error:', error);
            alert('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you absolutely sure? This will delete all your financial data permanently.')) {
            setLoading(true);
            try {
                await deleteAccount();
                navigate('/');
            } catch (error) {
                alert('Failed to delete account');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const sections = [
        { id: 'profile', icon: User, label: 'Profile Settings', desc: 'Manage your name, email and avatar' },
        { id: 'financial', icon: CreditCard, label: 'Financial Info', desc: 'Monthly income, currency and budget goals' },
        { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Set alerts for spending leaks and renewals' },
        { id: 'security', icon: Shield, label: 'Security', desc: 'Password, 2FA and login sessions' },
        { id: 'support', icon: HelpCircle, label: 'Support & Help', desc: 'Contact us or view tutorials' },
    ];

    if (activeSection === 'profile') {
        return (
            <div className="max-w-xl py-8 space-y-8">
                <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4">
                    <ChevronRight className="rotate-180" size={20} /> Back to Settings
                </button>
                <header>
                    <h1 className="text-2xl md:text-3xl font-bold">Profile Settings</h1>
                    <p className="text-slate-500 mt-1 text-sm md:text-base">Update your personal information.</p>
                </header>
                <form onSubmit={handleSave} className="card space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">Display Name</label>
                        <input
                            type="text"
                            className="w-full p-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">Email</label>
                        <input
                            disabled
                            type="email"
                            className="w-full p-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl outline-none opacity-60 flex items-center"
                            value={formData.email}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </form>
            </div>
        );
    }

    if (activeSection === 'financial') {
        return (
            <div className="max-w-xl py-8 space-y-8">
                <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4">
                    <ChevronRight className="rotate-180" size={20} /> Back to Settings
                </button>
                <header>
                    <h1 className="text-2xl md:text-3xl font-bold">Financial Info</h1>
                    <p className="text-slate-500 mt-1 text-sm md:text-base">Set your income and preferred currency.</p>
                </header>
                <form onSubmit={handleSave} className="card space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">Monthly Income ({formData.currency})</label>
                        <input
                            type="number"
                            className="w-full p-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none"
                            value={formData.monthlyIncome}
                            onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">Currency Symbol</label>
                        <select
                            className="w-full p-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none"
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        >
                            <option value="₹">Rupee (₹)</option>
                            <option value="$">Dollar ($)</option>
                            <option value="€">Euro (€)</option>
                            <option value="£">Pound (£)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">Salary Credit Date (Day of Month)</label>
                        <select
                            className="w-full p-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl outline-none"
                            value={formData.salaryCreditDate}
                            onChange={(e) => setFormData({ ...formData, salaryCreditDate: parseInt(e.target.value) })}
                        >
                            {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-2 italic">We'll use this to show a countdown on your dashboard! 🚀</p>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </form>
            </div>
        );
    }

    if (activeSection === 'notifications') {
        return (
            <div className="max-w-xl py-8 space-y-8">
                <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4">
                    <ChevronRight className="rotate-180" size={20} /> Back to Settings
                </button>
                <header>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    <p className="text-slate-500 mt-1">Manage how you receive alerts and updates.</p>
                </header>
                <div className="card space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-lg">App Notifications</h4>
                            <p className="text-sm text-slate-400">Receive alerts about high burn and leaks.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, notificationsEnabled: !formData.notificationsEnabled })}
                            className={`w-14 h-8 rounded-full transition-all relative ${formData.notificationsEnabled ? 'bg-primary' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.notificationsEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Notification Preferences
                    </button>
                </div>
            </div>
        );
    }

    if (activeSection === 'security') {
        return (
            <div className="max-w-xl py-8 space-y-8">
                <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4">
                    <ChevronRight className="rotate-180" size={20} /> Back to Settings
                </button>
                <header>
                    <h1 className="text-3xl font-bold">Security</h1>
                    <p className="text-slate-500 mt-1">Manage your password and account security.</p>
                </header>

                {user.authMethod === 'google' ? (
                    <div className="card bg-blue-50 border-blue-100 flex items-center gap-4 p-6">
                        <Shield className="text-blue-500" size={32} />
                        <p className="text-blue-700 text-sm font-medium">Your account is secured with Google. Password management is handled by your Google Account.</p>
                    </div>
                ) : (
                    <form onSubmit={handlePasswordChange} className="card space-y-6">
                        <h4 className="font-bold text-lg mb-2">Change Password</h4>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-2">Current Password</label>
                            <input
                                type="password"
                                required
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-2">New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Update Password
                        </button>
                    </form>
                )}
            </div>
        );
    }

    if (activeSection === 'support') {
        const faqs = [
            { q: "How is 'Burn Score' calculated?", a: "It's the ratio of your non-essential spending to your total spending, reflecting your discretionary burn rate." },
            { q: "Is my data secure?", a: "Absolutely. We use industry-standard encryption, JWT for sessions, and bcrypt for password security." },
            { q: "Can I use multiple currencies?", a: "Currently, we support one primary currency at a time, which you can set in Financial Info." }
        ];
        return (
            <div className="max-w-xl py-8 space-y-8">
                <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4">
                    <ChevronRight className="rotate-180" size={20} /> Back to Settings
                </button>
                <header>
                    <h1 className="text-3xl font-bold">Support & Help</h1>
                    <p className="text-slate-500 mt-1">Common questions and contact options.</p>
                </header>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="card p-6 border border-slate-50 dark:border-slate-800">
                            <h4 className="font-bold mb-2 text-primary">{faq.q}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                    <div className="card bg-gradient-to-br from-primary to-primary-light text-white p-8 text-center space-y-4">
                        <HelpCircle size={48} className="mx-auto opacity-20" />
                        <h4 className="text-xl font-bold">Still have questions?</h4>
                        <p className="text-blue-100 text-sm">Our support team is ready to help you gain financial clarity.</p>
                        <a href="mailto:support@monthlyburn.com" className="inline-block bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
                            Email Our Team
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl py-8 space-y-10">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold">Settings</h1>
                    <p className="text-slate-500 mt-2">Manage your account and app preferences.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold transition-all px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl"
                >
                    <LogOut size={20} /> Logout
                </button>
            </header>

            <div className="card p-0 overflow-hidden divide-y divide-slate-50 dark:divide-slate-700">
                {sections.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group active:bg-slate-100 dark:active:bg-slate-700 text-left"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <item.icon size={22} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{item.label}</h4>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-all" />
                    </button>
                ))}
            </div>

            <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-500/10 flex justify-between items-center mt-12">
                <div>
                    <h4 className="font-bold text-red-900 dark:text-red-200">Danger Zone</h4>
                    <p className="text-red-700 dark:text-red-400 text-sm mt-1">Permanently delete your account and all financial data.</p>
                </div>
                <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default Settings;
