"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
    PlusCircle,
    Activity,
    Trash2,
    Calendar,
    Smile,
    Meh,
    Frown,
    Loader2,
    PieChart as PieChartIcon,
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

type Transaction = {
    id: string;
    type: "income" | "expense";
    category: string;
    amount: number;
    mood: "good" | "neutral" | "bad" | null;
    created_at: string;
};

const CATEGORIES = ["Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills", "Health", "Other"];

const MOODS = [
    { value: "good", label: "Happy / Good", icon: Smile, color: "text-emerald-500", bg: "bg-emerald-100", border: "border-emerald-200" },
    { value: "neutral", label: "Neutral / Okay", icon: Meh, color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" },
    { value: "bad", label: "Sad / Stressed", icon: Frown, color: "text-rose-500", bg: "bg-rose-100", border: "border-rose-200" },
];

export default function MoneyManagementPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

    // Form State
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [type, setType] = useState<"income" | "expense">("expense");
    const [mood, setMood] = useState<"good" | "neutral" | "bad">("neutral");

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/login");
            return;
        }

        const { data, error } = await supabase
            .from("transactions")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setTransactions(data);
        }
        setLoading(false);
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount))) return;

        setSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setSubmitting(false);
            return;
        }

        // We explicitly log mood only for expenses conceptually, but we can save it for both.
        const { error } = await supabase.from("transactions").insert([
            {
                user_id: user.id,
                type,
                category,
                amount: Number(amount),
                mood: type === "expense" ? mood : "neutral"
            },
        ]);

        if (!error) {
            setAmount("");
            fetchData();
        } else {
            console.error(error);
            alert("Failed to add transaction. Make sure the 'mood' column exists in your Supabase transactions table! (type: text)");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete transaction?")) return;
        const { error } = await supabase.from("transactions").delete().eq("id", id);
        if (!error) {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const expenses = transactions.filter(t => t.type === "expense");

    // Mood Analytics Math
    const moodTotals = {
        good: expenses.filter(t => t.mood === "good").reduce((sum, t) => sum + t.amount, 0),
        neutral: expenses.filter(t => t.mood === "neutral" || !t.mood).reduce((sum, t) => sum + t.amount, 0),
        bad: expenses.filter(t => t.mood === "bad").reduce((sum, t) => sum + t.amount, 0),
    };

    const totalExpenseAmount = expenses.reduce((sum, t) => sum + t.amount, 0) || 1; // avoid div by 0

    const moodChartData = [
        { name: 'Good Mood', value: moodTotals.good, color: '#10b981' },   // emerald-500
        { name: 'Neutral Mood', value: moodTotals.neutral, color: '#64748b' }, // slate-500
        { name: 'Stressed/Bad', value: moodTotals.bad, color: '#f43f5e' },    // rose-500
    ].filter(v => v.value > 0);

    const filteredTransactions = transactions.filter(t => filter === "all" ? true : t.type === filter);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="text-slate-800 font-sans pb-8">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Money Management</h1>
                        <p className="text-slate-500 text-lg">Track how your emotions influence your spending habits.</p>
                    </div>
                </div>

                {/* --- PRIMARY ACTION: Record Entry (Now Big & Prominent at the top) --- */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                        <div className="flex-1 text-white">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 leading-tight">Record New<br /><span className="text-indigo-400">Transaction</span></h2>
                            <p className="text-indigo-200 text-lg mb-8 max-w-sm">Keep your finances in check by logging every income and emotional expense.</p>

                            {/* Type Toggle */}
                            <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 max-w-sm">
                                <button
                                    type="button"
                                    onClick={() => setType("expense")}
                                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${type === "expense" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30" : "text-slate-300 hover:text-white"}`}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("income")}
                                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${type === "income" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "text-slate-300 hover:text-white"}`}
                                >
                                    Income
                                </button>
                            </div>
                        </div>

                        <div className="flex-[1.5] w-full bg-white rounded-3xl p-6 md:p-8 shadow-xl">
                            <form onSubmit={handleAddTransaction} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Amount (Rp)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="text-slate-400 font-semibold">Rp</span>
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-lg font-bold text-slate-800"
                                                placeholder="50.000"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none text-lg font-semibold text-slate-700"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {type === "expense" && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <label className="block text-sm font-bold text-slate-700 mb-3 text-center md:text-left">How did you feel spending this?</label>
                                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                                            {MOODS.map(m => (
                                                <button
                                                    key={m.value}
                                                    type="button"
                                                    onClick={() => setMood(m.value as any)}
                                                    className={`py-4 px-2 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all ${mood === m.value
                                                        ? `${m.bg} ${m.border} ${m.color} ring-4 ring-${m.color.split('-')[1]}-500/20 scale-[1.02]`
                                                        : "border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:border-slate-200"
                                                        }`}
                                                >
                                                    <m.icon className="w-8 h-8" />
                                                    <span className="text-xs font-bold leading-tight text-center">{m.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:shadow-none hover:scale-[1.01]"
                                >
                                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><PlusCircle className="w-6 h-6" /> Save Transaction</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* --- SECONDARY: Emotional Spending Profile --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                    {/* The Chart */}
                    <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                        <h3 className="text-lg font-bold text-slate-800 self-start w-full mb-4 flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-indigo-500" />
                            Emotional Spending
                        </h3>
                        {moodChartData.length > 0 ? (
                            <div className="w-full h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={moodChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {moodChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => formatCurrency(Number(value))}
                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="w-full h-48 flex items-center justify-center text-slate-400">
                                <p>Not enough data</p>
                            </div>
                        )}
                    </div>

                    {/* The Breakdown Cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                                    <Smile className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-emerald-900">Happy Spending</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-emerald-700">{formatCurrency(moodTotals.good)}</h3>
                                <p className="text-sm font-medium text-emerald-600/70 mt-1">
                                    {Math.round((moodTotals.good / totalExpenseAmount) * 100)}% of total expenses
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-slate-200 rounded-xl text-slate-600">
                                    <Meh className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-slate-700">Neutral Spending</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(moodTotals.neutral)}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">
                                    {Math.round((moodTotals.neutral / totalExpenseAmount) * 100)}% of total expenses
                                </p>
                            </div>
                        </div>

                        <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                                    <Frown className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-rose-900">Stressed Spending</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-rose-700">{formatCurrency(moodTotals.bad)}</h3>
                                <p className="text-sm font-medium text-rose-600/70 mt-1">
                                    {Math.round((moodTotals.bad / totalExpenseAmount) * 100)}% of total expenses
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TERTIARY: Transaction Ledger --- */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mt-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Ledger</h3>
                        <div className="flex gap-2">
                            {(["all", "income", "expense"] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredTransactions.length === 0 ? (
                        <div className="py-20 flex flex-col items-center text-slate-400">
                            <Activity className="w-12 h-12 mb-4 text-slate-200" />
                            <p className="text-lg">No records found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTransactions.map(t => {
                                const isIncome = t.type === "income";
                                const moodData = MOODS.find(m => m.value === t.mood) || MOODS[1];
                                const MoodIcon = moodData.icon;

                                return (
                                    <div key={t.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl flex items-center justify-center ${isIncome ? "bg-emerald-50 text-emerald-600" : moodData.bg + " " + moodData.color
                                                }`}>
                                                {isIncome ? <ArrowUpCircle className="w-6 h-6" /> : <MoodIcon className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{t.category}</p>
                                                <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(t.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className={`font-bold text-lg ${isIncome ? "text-emerald-600" : "text-slate-800"}`}>
                                                    {isIncome ? "+" : "-"}{formatCurrency(t.amount)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}