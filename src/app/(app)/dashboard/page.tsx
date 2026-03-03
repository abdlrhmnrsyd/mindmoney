"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Wallet,
    Target,
    ArrowUpCircle,
    ArrowDownCircle,
    TrendingUp,
    Activity,
    Calendar,
    ArrowRight,
    Star, Car, Plane, Laptop, Home, Gift
} from "lucide-react";

type Transaction = {
    id: string;
    type: "income" | "expense";
    category: string;
    amount: number;
    created_at: string;
};

type Wishlist = {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    icon: string;
    status: "active" | "achieved";
};

const ICONS = [
    { name: "Star", component: Star, color: "text-amber-500", bg: "bg-amber-100" },
    { name: "Car", component: Car, color: "text-blue-500", bg: "bg-blue-100" },
    { name: "Plane", component: Plane, color: "text-sky-500", bg: "bg-sky-100" },
    { name: "Laptop", component: Laptop, color: "text-slate-700", bg: "bg-slate-200" },
    { name: "Home", component: Home, color: "text-emerald-600", bg: "bg-emerald-100" },
    { name: "Gift", component: Gift, color: "text-rose-500", bg: "bg-rose-100" },
];

export default function GlobalDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }

            // Fetch recent transactions (limit to 5)
            const { data: txData } = await supabase
                .from("transactions")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(5);

            if (txData) setTransactions(txData);

            // Fetch active wishlists
            const { data: wlData } = await supabase
                .from("wishlists")
                .select("*")
                .eq("status", "active")
                .order("created_at", { ascending: false })
                .limit(4);

            if (wlData) setWishlists(wlData);

            setLoading(false);
        };

        fetchDashboardData();
    }, [router]);

    // Calculate core metrics
    const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const liquidBalance = totalIncome - totalExpense;

    // For net worth we assume transactions represent total cash, and wishlists represents saved assets.
    // Given the current basic architecture, let's just showcase liquid balance purely to keep numbers accurate, 
    // since 'wishlist' savings technically come out of liquid cash.
    const activeGoalsTotal = wishlists.reduce((sum, w) => sum + w.target_amount, 0);
    const totalSaved = wishlists.reduce((sum, w) => sum + w.current_amount, 0);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const getIconData = (iconName: string) => {
        return ICONS.find(i => i.name === iconName) || ICONS[0];
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex justify-center items-center gap-2 text-indigo-600">
                    <Activity className="w-6 h-6 animate-pulse" />
                    <span className="font-semibold">Loading Dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="text-slate-800 font-sans pb-8">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header Welcome area */}
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome back! 👋</h1>
                    <p className="text-slate-500 text-lg">Here's what's happening with your money today.</p>
                </div>

                {/* Top-Level Summary Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Main Balance Card */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex justify-between items-start mb-8">
                            <div>
                                <p className="text-indigo-200 font-medium mb-1 uppercase tracking-wider text-sm">Liquid Balance</p>
                                <h3 className="text-4xl md:text-5xl font-bold tracking-tight">{formatCurrency(liquidBalance)}</h3>
                            </div>
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform">
                                <Wallet className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div className="relative z-10 flex gap-4">
                            <Link href="/money" className="bg-indigo-500/30 hover:bg-indigo-500/50 backdrop-blur text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors border border-indigo-400/30">
                                Send Money
                            </Link>
                            <Link href="/money" className="bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold py-2 px-4 rounded-xl transition-colors">
                                Add Income
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center gap-2 hover:border-emerald-200 transition-colors group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                <ArrowUpCircle className="w-5 h-5" />
                            </div>
                            <p className="text-slate-500 font-semibold text-sm">Recent Income</p>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(totalIncome)}</h3>
                        <p className="text-xs text-slate-400">Based on recent entries</p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center gap-2 hover:border-rose-200 transition-colors group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-rose-50 rounded-xl text-rose-600 group-hover:bg-rose-100 transition-colors">
                                <ArrowDownCircle className="w-5 h-5" />
                            </div>
                            <p className="text-slate-500 font-semibold text-sm">Recent Expenses</p>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(totalExpense)}</h3>
                        <p className="text-xs text-slate-400">Based on recent entries</p>
                    </div>
                </div>

                {/* Sub-sections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Mini Recent Transactions */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                Latest Transactions
                            </h3>
                            <Link href="/money" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                                View Full
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400">
                                <TrendingUp className="w-12 h-12 mb-3 text-slate-200" />
                                <p>No transactions yet</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-4">
                                {transactions.map((t) => (
                                    <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {t.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{t.category}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(t.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Saving Goals Preview */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Target className="w-5 h-5 text-emerald-500" />
                                Active Wishlists
                            </h3>
                            <Link href="/wishlists" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                                Manage
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {wishlists.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400">
                                <Target className="w-12 h-12 mb-3 text-slate-200" />
                                <p>No active savings goals</p>
                                <Link href="/wishlists" className="text-indigo-500 font-medium mt-2 text-sm hover:underline">Create your first goal</Link>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col space-y-6">
                                {/* Overall Progress Summary */}
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold text-slate-700">Total Saved</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(totalSaved)} / <span className="text-slate-400">{formatCurrency(activeGoalsTotal)}</span></span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                                            style={{ width: `${Math.min(100, (totalSaved / (activeGoalsTotal || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* List of active items */}
                                {wishlists.map((w) => {
                                    const iconData = getIconData(w.icon);
                                    const TheIcon = iconData.component;
                                    const progress = Math.min(100, Math.round((w.current_amount / w.target_amount) * 100));

                                    return (
                                        <div key={w.id} className="group">
                                            <div className="flex items-center justify-between mb-2 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${iconData.bg} ${iconData.color}`}>
                                                        <TheIcon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{w.name}</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">{progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full ml-11 overflow-hidden" style={{ width: 'calc(100% - 44px)' }}>
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full transition-all"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
