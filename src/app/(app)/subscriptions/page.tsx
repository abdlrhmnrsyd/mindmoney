"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, RefreshCw, Trash2, Calendar, DollarSign, Activity, AlertCircle } from "lucide-react";
import { toast } from "sonner";
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

type RecurringTransaction = {
    id: string;
    amount: number;
    category: string;
    type: "income" | "expense";
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    next_date: string;
    is_active: boolean;
    mood: string;
};

const EXPENSE_CATEGORIES = ["Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", "Health", "Other"];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Gift", "Other"];
const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

export default function SubscriptionsPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [subscriptions, setSubscriptions] = useState<RecurringTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [isCreating, setIsCreating] = useState(false);
    const [type, setType] = useState<"income" | "expense">("expense");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
    const [mood, setMood] = useState("neutral");
    const [startDate, setStartDate] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
            } else {
                setUserId(session.user.id);
                fetchSubscriptions();
                // We set start date to today by default
                setStartDate(new Date().toISOString().split("T")[0]);
            }
        };
        checkAuth();
    }, [router]);

    const fetchSubscriptions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("recurring_transactions")
            .select("*")
            .eq("is_active", true)
            .order("next_date", { ascending: true });

        if (error) {
            toast.error("Failed to load subscriptions.");
        } else if (data) {
            setSubscriptions(data as RecurringTransaction[]);
        }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        const numAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        if (!startDate) {
            toast.error("Please select a start date.");
            return;
        }

        const newSub = {
            user_id: userId,
            amount: numAmount,
            category: category,
            type: type,
            frequency: frequency,
            next_date: new Date(startDate).toISOString(),
            mood: mood,
            is_active: true
        };

        const { error } = await supabase
            .from("recurring_transactions")
            .insert(newSub);

        if (error) {
            console.error(error);
            toast.error("Failed to create subscription.");
        } else {
            toast.success("Subscription created successfully!");
            setIsCreating(false);
            setAmount("");
            fetchSubscriptions();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subscription?")) return;

        const { error } = await supabase
            .from("recurring_transactions")
            .update({ is_active: false })
            .eq("id", id);

        if (error) {
            toast.error("Failed to delete subscription.");
        } else {
            toast.success("Subscription deleted.");
            fetchSubscriptions();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            </div>
        );
    }

    const currentCategories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-slate-800 dark:text-slate-100 font-sans pb-8"
        >
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Subscriptions & Bills</h1>
                        <p className="text-slate-500 text-lg">Manage your recurring payments and income automatically.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-md transition-all flex items-center gap-2 transform active:scale-95"
                    >
                        {isCreating ? <AlertCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                        {isCreating ? "Cancel" : "New Subscription"}
                    </button>
                </div>

                <AnimatePresence>
                    {isCreating && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-sm border border-indigo-100 dark:border-indigo-900/50"
                        >
                            <div className="p-6 md:p-8">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <RefreshCw className="w-6 h-6 text-indigo-600" />
                                    Add Recurring Item
                                </h3>

                                <form onSubmit={handleCreate} className="space-y-6">
                                    <div className="flex gap-4 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl w-fit border border-slate-100 dark:border-slate-800/50">
                                        <button
                                            type="button"
                                            onClick={() => { setType("expense"); setCategory(EXPENSE_CATEGORIES[0]); }}
                                            className={`px-6 py-2 rounded-xl font-semibold transition-all ${type === "expense" ? "bg-white dark:bg-slate-800 shadow-sm text-rose-600 dark:text-rose-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                        >
                                            Expense
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setType("income"); setCategory(INCOME_CATEGORIES[0]); }}
                                            className={`px-6 py-2 rounded-xl font-semibold transition-all ${type === "income" ? "bg-white dark:bg-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                        >
                                            Income
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount (Rp)</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                                placeholder="50000"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                                            <select
                                                required
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                            >
                                                {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Frequency</label>
                                            <select
                                                required
                                                value={frequency}
                                                onChange={(e) => setFrequency(e.target.value as any)}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Next Billing Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                                        >
                                            Save Setup
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* List Subscriptions */}
                <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 pb-10">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Active Subscriptions
                    </h3>

                    {subscriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <RefreshCw className="w-12 h-12 mb-3 text-slate-200 dark:text-slate-800" />
                            <p className="text-lg font-medium text-slate-500">No recurring items found</p>
                            <p className="text-sm mt-1">Set up your bills or salary to track automatically!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subscriptions.map(s => {
                                const isExpense = s.type === "expense";
                                return (
                                    <div key={s.id} className="group relative flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 dark:text-white">{s.category}</span>
                                            <span className="text-xs font-semibold text-slate-500 capitalize flex items-center gap-1 mt-1">
                                                <RefreshCw className="w-3 h-3" />
                                                {s.frequency}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                Next: {new Date(s.next_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`text-xl font-bold ${isExpense ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                                {isExpense ? "-" : "+"}{formatCurrency(s.amount)}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Cancel Subscription"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

            </main>
        </motion.div>
    );
}
