"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    Wallet,
    Target,
    LogOut,
    LayoutDashboard,
    Menu,
    X,
    Settings,
    PieChart,
    RefreshCw
} from "lucide-react";
import { CommandPalette } from "@/components/CommandPalette";
import { AIChat } from "@/components/AIChat";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [userName, setUserName] = useState("User");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        checkSession();
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

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Money Management", href: "/money", icon: Wallet },
        { name: "Wishlists", href: "/wishlists", icon: Target },
        { name: "Reports", href: "/reports", icon: PieChart },
        { name: "Subscriptions", href: "/subscriptions", icon: RefreshCw },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">

            {/* --- Desktop Sidebar --- */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/50 fixed h-full z-20 transition-colors">
                <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/50">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-none group-hover:scale-105 transition-transform">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                            MindMoney
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Signed in as</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate" title={userName}>{userName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleSignOut}
                                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- Mobile Header & Navigation --- */}
            <div className="md:hidden fixed top-0 w-full h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 z-30 flex items-center justify-between px-4 transition-colors">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-none">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                        MindMoney
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-20 bg-slate-900/20 backdrop-blur-sm pt-16">
                    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/50 px-4 py-6 shadow-xl space-y-2 animate-in slide-in-from-top-4 duration-200">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 font-medium"
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Main Content Envelope --- */}
            <main className="flex-1 min-w-0 md:ml-64 pt-16 md:pt-0">
                {children}
            </main>

            <CommandPalette />
            <AIChat />
        </div>
    );
}
