"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { motion } from "framer-motion";
import { Activity, Calendar, PiggyBank, Receipt, ShoppingBag } from "lucide-react";

type Transaction = {
    id: string;
    type: "income" | "expense";
    category: string;
    amount: number;
    created_at: string;
};

// Colors for the donut chart
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function ReportsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }

            const { data } = await supabase
                .from("transactions")
                .select("*")
                .order("created_at", { ascending: false });

            if (data) setTransactions(data);
            setLoading(false);
        };

        fetchTransactions();
    }, [router]);

    // Data Processing
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.created_at);
            return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
        });
    }, [transactions, selectedMonth, selectedYear]);

    const expenses = filteredTransactions.filter(t => t.type === "expense");
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = filteredTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

    const categoryDataMap = expenses.reduce((acc: Record<string, number>, t) => {
        if (!acc[t.category]) acc[t.category] = 0;
        acc[t.category] += t.amount;
        return acc;
    }, {});

    const chartData = Object.keys(categoryDataMap)
        .map((key, idx) => ({
            name: key,
            value: categoryDataMap[key],
            color: COLORS[idx % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value);

    // Helpers
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const availableYears = Array.from(new Set(transactions.map(t => new Date(t.created_at).getFullYear()))).sort((a, b) => b - a);
    if (!availableYears.includes(new Date().getFullYear())) availableYears.unshift(new Date().getFullYear());

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex justify-center items-center gap-2 text-indigo-600">
                    <Activity className="w-6 h-6 animate-pulse" />
                    <span className="font-semibold">Loading Reports...</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-slate-800 dark:text-slate-100 font-sans pb-8"
        >
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Monthly Reports</h1>
                        <p className="text-slate-500 text-lg">Analyze your spending and find ways to save.</p>
                    </div>

                    <div className="flex gap-3 bg-white dark:bg-slate-950 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-300 cursor-pointer pl-2 pr-1"
                        >
                            {months.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-transparent font-medium shadow-sm outline-none text-slate-700 dark:text-slate-300 cursor-pointer pr-2 border-l border-slate-200 dark:border-slate-800 pl-3"
                        >
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30 flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                <PiggyBank className="w-5 h-5" />
                            </div>
                            <p className="text-slate-500 font-semibold text-sm">Total Income</p>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalIncome)}</h3>
                    </div>

                    <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 shadow-sm border border-rose-100 dark:border-rose-900/30 flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <p className="text-slate-500 font-semibold text-sm">Total Expense</p>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalExpense)}</h3>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-center gap-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex items-center gap-3 mb-2">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white">
                                <Activity className="w-5 h-5" />
                            </div>
                            <p className="text-indigo-200 font-semibold text-sm">Net Cash Flow</p>
                        </div>
                        <h3 className="relative z-10 text-3xl font-bold">{formatCurrency(totalIncome - totalExpense)}</h3>
                    </div>
                </div>

                {totalExpense > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Donut Chart */}
                        <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white self-start mb-6 w-full flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-indigo-500" />
                                Spending by Category
                            </h3>
                            <div className="w-full h-80 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number | undefined) => formatCurrency(value || 0)}
                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            formatter={(value) => <span className="text-slate-600 font-medium ml-1">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                    <span className="text-slate-400 font-medium text-sm">Total</span>
                                    <span className="text-xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalExpense)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Category List */}
                        <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white self-start mb-6 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-indigo-500" />
                                Breakdown
                            </h3>
                            <div className="space-y-4">
                                {chartData.map((item, idx) => {
                                    const percentage = Math.round((item.value / totalExpense) * 100);
                                    return (
                                        <div key={item.name} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group border border-transparent hover:border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(item.value)}</p>
                                                <p className="text-xs font-medium text-slate-400">{percentage}% of total</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-950 rounded-3xl p-12 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No expenses this month</h3>
                        <p className="text-slate-500 max-w-sm">You haven't recorded any expenses for {months[selectedMonth]} {selectedYear}. Once you do, your detailed breakdown will appear here.</p>
                    </div>
                )}
            </main>
        </motion.div>
    );
}
