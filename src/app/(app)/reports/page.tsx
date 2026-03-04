"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { motion } from "framer-motion";
import { Activity, Calendar, PiggyBank, Receipt, ShoppingBag, Target, Pencil, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Budget = {
    id: string;
    user_id: string;
    category: string;
    amount: number;
};

const EXPENSE_CATEGORIES = ["Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", "Health", "Other"];

type Transaction = {
    id: string;
    type: "income" | "expense";
    category: string;
    amount: number;
    created_at: string;
    mood?: string;
};

// Colors for the donut chart
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function ReportsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);

    // Budget Editor State
    const [editingBudget, setEditingBudget] = useState(false);
    const [budgetForm, setBudgetForm] = useState<Record<string, string>>({});

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

            const [txRes, budgetRes] = await Promise.all([
                supabase.from("transactions").select("*").order("created_at", { ascending: false }),
                supabase.from("budgets").select("*")
            ]);

            if (txRes.data) setTransactions(txRes.data);
            if (budgetRes.data) setBudgets(budgetRes.data);
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

    const handleSaveBudgets = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const upserts = Object.keys(budgetForm).map(cat => ({
            user_id: session.user.id,
            category: cat,
            amount: parseFloat(budgetForm[cat].replace(/[^0-9.-]+/g, "")) || 0
        })).filter(b => b.amount >= 0); // Allow saving 0 to clear budget

        if (upserts.length > 0) {
            const { error } = await supabase.from('budgets').upsert(upserts, { onConflict: 'user_id, category' });
            if (error) {
                toast.error("Failed to save budgets.");
            } else {
                toast.success("Budgets saved!");
                const { data } = await supabase.from("budgets").select("*");
                if (data) setBudgets(data);
                setEditingBudget(false);
            }
        } else {
            setEditingBudget(false);
        }
        setLoading(false);
    };

    const handleOpenBudgetEditor = () => {
        const initialForm: Record<string, string> = {};
        EXPENSE_CATEGORIES.forEach(cat => {
            const existing = budgets.find(b => b.category === cat);
            initialForm[cat] = existing?.amount ? existing.amount.toString() : "";
        });
        setBudgetForm(initialForm);
        setEditingBudget(true);
    };

    const exportCSV = () => {
        if (filteredTransactions.length === 0) {
            toast.error("No data to export for this month.");
            return;
        }

        const headers = ["Date", "Type", "Category", "Amount", "Mood"];
        const rows = filteredTransactions.map(t => [
            new Date(t.created_at).toLocaleDateString(),
            t.type,
            t.category,
            t.amount.toString(),
            t.mood || "N/A"
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\\n"
            + rows.map(e => e.join(",")).join("\\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `mindmoney_report_${months[selectedMonth]}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV Downloaded!");
    };

    const exportPDF = () => {
        if (filteredTransactions.length === 0) {
            toast.error("No data to export for this month.");
            return;
        }

        const doc = new jsPDF();
        doc.text(`MindMoney Report - ${months[selectedMonth]} ${selectedYear}`, 14, 15);

        doc.setFontSize(11);
        doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 14, 25);
        doc.text(`Total Expense: ${formatCurrency(totalExpense)}`, 14, 30);
        doc.text(`Net Cash Flow: ${formatCurrency(totalIncome - totalExpense)}`, 14, 35);

        const tableData = filteredTransactions.map(t => [
            new Date(t.created_at).toLocaleDateString(),
            t.type.toUpperCase(),
            t.category,
            formatCurrency(t.amount),
            t.mood || "N/A"
        ]);

        autoTable(doc, {
            head: [['Date', 'Type', 'Category', 'Amount', 'Mood']],
            body: tableData,
            startY: 45,
        });

        doc.save(`mindmoney_report_${months[selectedMonth]}_${selectedYear}.pdf`);
        toast.success("PDF Downloaded!");
    };

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

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex gap-2">
                            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <FileText className="w-4 h-4" /> CSV
                            </button>
                            <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <Download className="w-4 h-4" /> PDF
                            </button>
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

                {/* --- Budgets Section --- */}
                <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-500" />
                            Monthly Budgets
                        </h3>
                        {!editingBudget && (
                            <button onClick={handleOpenBudgetEditor} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                <Pencil className="w-4 h-4" /> Edit Budgets
                            </button>
                        )}
                    </div>

                    {editingBudget ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <div key={cat} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{cat}</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-medium pointer-events-none">Rp</span>
                                            <input
                                                type="number"
                                                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                                placeholder="0 or empty for no limit"
                                                value={budgetForm[cat] || ""}
                                                onChange={(e) => setBudgetForm({ ...budgetForm, [cat]: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={() => setEditingBudget(false)} className="px-5 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">Cancel</button>
                                <button onClick={handleSaveBudgets} className="px-6 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors">Save Budgets</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {EXPENSE_CATEGORIES.map(cat => {
                                const spent = categoryDataMap[cat] || 0;
                                const budgetObj = budgets.find(b => b.category === cat);
                                const limit = budgetObj?.amount || 0;

                                if (limit === 0 && spent === 0) return null; // Hide inactive empty categories

                                const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 100;
                                const isOver = limit > 0 && spent > limit;

                                return (
                                    <div key={cat}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                                            <span className={`font-bold ${isOver ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                                                {formatCurrency(spent)} <span className="text-slate-400 font-normal dark:text-slate-500">/ {limit > 0 ? formatCurrency(limit) : "No Limit"}</span>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden flex">
                                            {limit > 0 ? (
                                                <div
                                                    className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            ) : (
                                                <div className="h-full rounded-full transition-all bg-emerald-400" style={{ width: '100%' }} title="No Limit (All Good)" />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            {!budgets.some(b => b.amount > 0) && expenses.length === 0 && (
                                <div className="text-center py-6 text-slate-400">
                                    <p>No budgets set yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </motion.div>
    );
}
