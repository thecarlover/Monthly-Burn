import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, BarChart3, ArrowRight, Play, Loader2, AlertCircle, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle, login, register } from '../services/api';

const LandingPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: ''
    });
    const [error, setError] = useState('');

    const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID && !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('your_real');

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLoginSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            await loginWithGoogle(credentialResponse.credential);
            navigate('/dashboard');
        } catch (error) {
            console.error('Google Login Error:', error);
            setError('Google Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (authMode === 'login') {
                await login(formData.email, formData.password);
            } else {
                await register(formData.email, formData.password, formData.displayName);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMockLogin = () => {
        localStorage.setItem('token', 'mock_token');
        localStorage.setItem('user', JSON.stringify({
            _id: 'mock_id',
            displayName: 'Demo User',
            email: 'demo@example.com',
            currency: '₹'
        }));
        navigate('/dashboard');
    };

    return (
        <div className="bg-slate-50 text-[#0f172a] overflow-x-hidden min-h-screen font-sans selection:bg-primary/10">
            {/* Minimal Navbar */}
            <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 rotate-3">M</div>
                    <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">Monthly Burn</span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-10 pb-32">
                {/* Left Side: Hero Text */}
                <div className="space-y-12">
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-bold border border-slate-200 shadow-sm"
                        >
                            <Zap size={14} className="text-primary" fill="currentColor" />
                            <span className="text-slate-500">ADVANCED EXPENSE ANALYTICS</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter text-slate-900"
                        >
                            Financial <br />
                            <span className="text-primary">Clarity</span> <br />
                            Real-time.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-slate-500 max-w-md leading-relaxed font-medium"
                        >
                            The ultimate dashboard to track your monthly burn, identify leaks, and master your subscriptions.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-4">
                        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                            <CheckCircle2 size={18} className="text-primary" /> Multi-account Isolation
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                            <CheckCircle2 size={18} className="text-primary" /> Smart Leak Detection
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute -inset-10 bg-gradient-to-tr from-primary/10 to-indigo-100 blur-3xl opacity-50 rounded-full"></div>
                    <div className="card border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative z-10 p-10 bg-white/80 backdrop-blur-xl rounded-[3rem]">
                        <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl mb-10 w-fit mx-auto">
                            <button
                                onClick={() => setAuthMode('login')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setAuthMode('signup')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Register
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3"
                                >
                                    <AlertCircle size={16} /> {error}
                                </motion.div>
                            )}

                            {authMode === 'signup' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Display Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            required
                                            type="text"
                                            name="displayName"
                                            placeholder="John Doe"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all font-bold placeholder:text-slate-300"
                                            value={formData.displayName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        placeholder="you@email.com"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all font-bold placeholder:text-slate-300"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        required
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all font-bold placeholder:text-slate-300"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </form>

                        <div className="relative my-10 px-10">
                            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-100 -translate-y-1/2"></div>
                            <span className="relative z-10 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-300 block mx-auto w-fit">Or continue with</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className={!isGoogleConfigured ? "opacity-5 ; grayscale pointer-events-none" : ""}>
                                <GoogleLogin
                                    onSuccess={handleLoginSuccess}
                                    onError={() => setError('Google Login Failed')}
                                    theme="outline"
                                    shape="pill"
                                    width="100%"
                                />
                            </div>
                            {!isGoogleConfigured && (
                                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">
                                    Google Login coming soon to production
                                </p>
                            )}

                            <button
                                onClick={handleMockLogin}
                                className="text-xs font-bold text-slate-400 hover:text-primary transition-all mt-4 text-center"
                            >
                                Use Instant Demo Access →
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default LandingPage;
