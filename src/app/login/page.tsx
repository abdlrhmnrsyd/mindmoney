"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRememberMe, setIsRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        localStorage.setItem("remember_me", isRememberMe.toString());

        const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
        const tempClient = getSupabaseBrowserClient(isRememberMe);

        const { error } = await tempClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            toast.error(error.message);
            setLoading(false);
        } else {
            toast.success("Welcome back!");
            router.push("/dashboard");
        }
    };

    const loginWithGoogle = async () => {
        localStorage.setItem("remember_me", isRememberMe.toString());

        // Also set a temporary 5-minute cookie to survive the OAuth callback redirect
        document.cookie = `mindmoney_remember_me_oauth=${isRememberMe.toString()}; path=/; max-age=300; SameSite=Lax`;

        const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
        const tempClient = getSupabaseBrowserClient(isRememberMe);

        await tempClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950 font-sans">
            {/* Left Column: Login Form */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24"
            >
                <div className="mx-auto w-full max-w-sm lg:w-96">

                    {/* Logo & Header */}
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                                MindMoney
                            </span>
                        </div>
                        <h2 className="mt-8 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleLogin} className="space-y-6">

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Email address
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100 animate-in fade-in zoom-in-95 duration-200">
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={isRememberMe}
                                        onChange={(e) => setIsRememberMe(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-slate-950 text-slate-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={loginWithGoogle}
                                    className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Sign in with Google
                                </button>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Don't have an account?{" "}
                            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Right Column: Graphic/Image */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:block relative w-1/2 bg-slate-50"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                    <div className="absolute inset-0 flex flex-col justify-center px-16 text-white">
                        <div className="p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl max-w-lg shadow-2xl">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold mb-4 tracking-tight">
                                Take control of your financial wellbeing.
                            </h1>
                            <p className="text-indigo-100 text-lg leading-relaxed mb-8">
                                MindMoney helps you track expenses, analyze spending habits, and ensure your financial health remains top-notch with a beautiful user experience.
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-500 bg-slate-200 overflow-hidden">
                                            <img
                                                src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                                alt="User Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm font-medium text-indigo-100">
                                    Join <span className="text-white font-bold">10,000+</span> users today
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}