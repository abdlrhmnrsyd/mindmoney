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
    X
} from "lucide-react";

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
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">

            {/* --- Desktop Sidebar --- */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-20">
                <div className="h-20 flex items-center px-6 border-b border-slate-100">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
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
                                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Signed in as</span>
                            <span className="text-sm font-bold text-slate-800 truncate" title={userName}>{userName}</span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* --- Mobile Header & Navigation --- */}
            <div className="md:hidden fixed top-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                        MindMoney
                    </span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-600 bg-slate-100 rounded-lg"
                >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-20 bg-slate-900/20 backdrop-blur-sm pt-16">
                    <div className="bg-white border-b border-slate-200 px-4 py-6 shadow-xl space-y-2 animate-in slide-in-from-top-4 duration-200">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                                        : "text-slate-600 hover:bg-slate-50 font-medium"
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                        <div className="pt-4 mt-2 border-t border-slate-100">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors"
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

        </div>
    );
}
