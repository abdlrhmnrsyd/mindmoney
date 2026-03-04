"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="p-6 md:p-8 space-y-6 animate-pulse">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>;
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Appearance</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setTheme("light")}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === "light"
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500"
                                : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50"
                            }`}
                    >
                        <Sun className={`w-8 h-8 ${theme === "light" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`} />
                        <span className={`font-medium ${theme === "light" ? "text-indigo-900 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"}`}>Light</span>
                    </button>

                    <button
                        onClick={() => setTheme("dark")}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === "dark"
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500"
                                : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50"
                            }`}
                    >
                        <Moon className={`w-8 h-8 ${theme === "dark" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`} />
                        <span className={`font-medium ${theme === "dark" ? "text-indigo-900 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"}`}>Dark</span>
                    </button>

                    <button
                        onClick={() => setTheme("system")}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === "system"
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500"
                                : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50"
                            }`}
                    >
                        <Monitor className={`w-8 h-8 ${theme === "system" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`} />
                        <span className={`font-medium ${theme === "system" ? "text-indigo-900 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"}`}>System</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
