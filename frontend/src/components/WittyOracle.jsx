import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Sparkles, Flame, Zap } from 'lucide-react';

const WittyOracle = ({ burnScore, totalSpend, essentialSpend }) => {
    const isHighBurn = burnScore > 60;
    const isZen = burnScore < 40;

    const getOracleMessage = () => {
        if (totalSpend === 0) return {
            title: "The Clean Slate",
            text: "Your wallet is currently a temple of purity. Let's keep it that way, shall we?",
            icon: Sparkles,
            color: "text-blue-500",
            bg: "bg-blue-50"
        };

        if (isHighBurn) return {
            title: "The Roast 📉",
            text: "Your non-essential spending is moving faster than a Silicon Valley startup. Maybe put the credit card in the freezer?",
            icon: Flame,
            color: "text-orange-600",
            bg: "bg-orange-50"
        };

        if (isZen) return {
            title: "The Toast 🥂",
            text: "Financial monk status achieved. Your discipline is legendary. The savings account is singing your praises.",
            icon: Zap,
            color: "text-green-600",
            bg: "bg-green-50"
        };

        return {
            title: "The Mid-Way Mantra",
            text: "You're walking the tightrope of financial stability. One wrong latte could tip the scales. Stay sharp.",
            icon: Quote,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        };
    };

    const message = getOracleMessage();
    const Icon = message.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-8 rounded-[2.5rem] ${message.bg} border-2 border-white dark:border-slate-800 shadow-xl relative overflow-hidden`}
        >
            <div className="absolute top-[-10px] right-[-10px] opacity-10">
                <Icon size={120} />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${message.color} bg-white/50 backdrop-blur-sm`}>
                        <Icon size={20} />
                    </div>
                    <h4 className={`font-black uppercase tracking-widest text-xs ${message.color}`}>
                        {message.title}
                    </h4>
                </div>

                <p className="text-xl font-bold text-slate-700 dark:text-slate-200 leading-tight">
                    "{message.text}"
                </p>

                <div className="pt-2 flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-6 h-6 rounded-full border-2 border-white ${message.bg} flex items-center justify-center`}>
                                <div className={`w-2 h-2 rounded-full ${message.color} animate-pulse`} />
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        Oracle is watching...
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default WittyOracle;
