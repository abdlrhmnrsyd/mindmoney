"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    PlusCircle,
    Target,
    Wallet,
    LogOut,
    Loader2,
    Star,
    Car,
    Plane,
    Laptop,
    Home,
    Gift,
    CheckCircle2,
    Trash2,
    TrendingUp
} from "lucide-react";

type Wishlist = {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    icon: string;
    status: "active" | "achieved";
    created_at: string;
};

const ICONS = [
    { name: "Star", component: Star, color: "text-amber-500", bg: "bg-amber-100" },
    { name: "Car", component: Car, color: "text-blue-500", bg: "bg-blue-100" },
    { name: "Plane", component: Plane, color: "text-sky-500", bg: "bg-sky-100" },
    { name: "Laptop", component: Laptop, color: "text-slate-700", bg: "bg-slate-200" },
    { name: "Home", component: Home, color: "text-emerald-600", bg: "bg-emerald-100" },
    { name: "Gift", component: Gift, color: "text-rose-500", bg: "bg-rose-100" },
];

export default function WishlistPage() {
    const router = useRouter();
    const [userName, setUserName] = useState("User");
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Form State
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("Star");
    const [submitting, setSubmitting] = useState(false);

    // Contribute Form State
    const [contributeId, setContributeId] = useState<string | null>(null);
    const [contributeAmount, setContributeAmount] = useState("");

    useEffect(() => {
        checkSession();
        fetchWishlists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/login");
        } else {
            const email = session.user.email || "";
            setUserName(email.split("@")[0] || "User");
        }
    };

    const fetchWishlists = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("wishlists")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setWishlists(data);
        }
        setLoading(false);
    };

    const handleCreateWishlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount || isNaN(Number(targetAmount))) return;

        setSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setSubmitting(false);
            return;
        }

        const { error } = await supabase.from("wishlists").insert([
            {
                user_id: user.id,
                name,
                target_amount: Number(targetAmount),
                current_amount: 0,
                icon: selectedIcon,
                status: "active"
            },
        ]);

        if (!error) {
            setName("");
            setTargetAmount("");
            setIsCreating(false);
            fetchWishlists();
        } else {
            console.error(error);
            alert("Failed to create wishlist");
        }
        setSubmitting(false);
    };

    const handleContribute = async (e: React.FormEvent, wishlist: Wishlist) => {
        e.preventDefault();
        if (!contributeAmount || isNaN(Number(contributeAmount))) return;

        setSubmitting(true);

        const amountToAdd = Number(contributeAmount);
        const newAmount = wishlist.current_amount + amountToAdd;
        const newStatus = newAmount >= wishlist.target_amount ? "achieved" : "active";

        const { error } = await supabase
            .from("wishlists")
            .update({
                current_amount: newAmount,
                status: newStatus
            })
            .eq("id", wishlist.id);

        if (!error) {
            setContributeAmount("");
            setContributeId(null);
            fetchWishlists();

            // Optionally add an expense transaction to track the money leaving the main balance
            // (This creates a realistic double-entry accounting feel, but we skip it here for simplicity unless requested)
        } else {
            console.error(error);
            alert("Failed to add savings");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this goal?")) return;
        const { error } = await supabase.from("wishlists").delete().eq("id", id);
        if (!error) {
            setWishlists(prev => prev.filter(w => w.id !== id));
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(val);
    };

    const getIconData = (iconName: string) => {
        return ICONS.find(i => i.name === iconName) || ICONS[0];
    };

    return (
        <div className="text-slate-800 font-sans pb-8">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">My Savings Goals</h1>
                        <p className="text-slate-600 text-lg">Turn your dreams into reality by tracking them.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                    >
                        <PlusCircle className="w-5 h-5" />
                        {isCreating ? "Cancel" : "New Goal"}
                    </button>
                </div>

                {/* Create Wishlist Form (Expandable) */}
                {isCreating && (
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Target className="w-6 h-6 text-indigo-600" />
                            What are you saving for?
                        </h3>

                        <form onSubmit={handleCreateWishlist} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                            <div className="md:col-span-4">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Goal Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="e.g., MacBook Pro M4"
                                />
                            </div>

                            <div className="md:col-span-4">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Target Amount (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="20000000"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Pick an Icon</label>
                                <div className="relative">
                                    <select
                                        value={selectedIcon}
                                        onChange={(e) => setSelectedIcon(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none"
                                    >
                                        {ICONS.map((icon) => (
                                            <option key={icon.name} value={icon.name}>{icon.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 flex justify-center items-center h-[50px]"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Set Goal"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Goals Grid */}
                {loading ? (
                    <div className="py-20 text-center text-slate-500">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-400 mb-4" />
                        <p className="font-medium text-lg">Loading your dreams...</p>
                    </div>
                ) : wishlists.length === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Gift className="w-10 h-10 text-indigo-300" />
                        </div>
                        <p className="text-2xl font-medium text-slate-700 mb-2">No savings goals yet</p>
                        <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                            Ready to start saving for that next big thing? Create your first wishlist!
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-6 py-3 bg-white border-2 border-indigo-100 text-indigo-600 font-semibold rounded-xl shadow-sm hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                        >
                            Create a Wishlist
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {wishlists.map((w) => {
                            const TheIcon = getIconData(w.icon);
                            const progressPercentage = Math.min(100, Math.round((w.current_amount / w.target_amount) * 100));
                            const isAchieved = w.status === "achieved" || progressPercentage === 100;

                            return (
                                <div
                                    key={w.id}
                                    className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm border transition-all relative overflow-hidden group ${isAchieved
                                        ? "border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50"
                                        : "border-slate-100 hover:border-indigo-100 hover:shadow-md"
                                        }`}
                                >
                                    {/* Decorative Background Blob for Achieved */}
                                    {isAchieved && (
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full mix-blend-multiply blur-2xl opacity-60"></div>
                                    )}

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isAchieved ? "bg-emerald-100 text-emerald-600" : `${TheIcon.bg} ${TheIcon.color}`
                                                }`}>
                                                {isAchieved ? <CheckCircle2 className="w-7 h-7" /> : <TheIcon.component className="w-7 h-7" />}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">{w.name}</h3>
                                                <p className={`text-sm font-medium ${isAchieved ? "text-emerald-600" : "text-slate-500"}`}>
                                                    {isAchieved ? "Goal Achieved! 🎉" : `${progressPercentage}% Completed`}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(w.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Current</p>
                                                <p className="text-2xl font-bold text-slate-800">{formatCurrency(w.current_amount)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target</p>
                                                <p className="text-lg font-bold text-slate-500">{formatCurrency(w.target_amount)}</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar Container */}
                                        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                                            <div
                                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${isAchieved ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-indigo-500 to-violet-500"
                                                    }`}
                                                style={{ width: `${progressPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Quick Add Form Section */}
                                    {!isAchieved && (
                                        <div className="mt-8 pt-6 border-t border-slate-100 relative z-10">
                                            {contributeId === w.id ? (
                                                <form
                                                    onSubmit={(e) => handleContribute(e, w)}
                                                    className="flex gap-3 items-center animate-in slide-in-from-bottom-2 duration-200"
                                                >
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Rp</span>
                                                        <input
                                                            type="number"
                                                            required
                                                            value={contributeAmount}
                                                            onChange={(e) => setContributeAmount(e.target.value)}
                                                            autoFocus
                                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-indigo-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-semibold"
                                                            placeholder="Amount to save"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setContributeId(null); setContributeAmount(""); }}
                                                        className="text-sm font-medium text-slate-500 hover:text-slate-800 px-2"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={submitting}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2"
                                                    >
                                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                                                    </button>
                                                </form>
                                            ) : (
                                                <button
                                                    onClick={() => setContributeId(w.id)}
                                                    className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-semibold rounded-xl text-sm transition-colors border border-slate-100 hover:border-indigo-100 flex items-center justify-center gap-2"
                                                >
                                                    <TrendingUp className="w-4 h-4" />
                                                    Update Progress
                                                </button>
                                            )}
                                        </div>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                )}

            </main>
        </div>
    );
}
