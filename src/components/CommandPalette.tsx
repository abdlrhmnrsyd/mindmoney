"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { checkAchievements } from "@/lib/achievements";
import { Search, PlusCircle, CreditCard, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleQuickAdd = async (type: "expense" | "income") => {
        if (!query) return;

        // Simple parsing: first number is amount, rest is category/desc
        const words = query.trim().split(" ");
        const amountStr = words.find(w => !isNaN(Number(w)));
        const amount = amountStr ? Number(amountStr) : null;

        let category = "Other";
        if (amountStr) {
            const descWords = words.filter(w => w !== amountStr);
            if (descWords.length > 0) category = descWords.join(" ");
        } else {
            category = words.join(" ");
        }

        if (!amount) {
            toast.error("Please add an amount. E.g: '50000 Food'");
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase.from("transactions").insert({
            user_id: session.user.id,
            amount: amount,
            category: category,
            type: type,
            mood: "neutral" // Default
        });

        if (!error) {
            toast.success(`Added ${type}: Rp${amount} - ${category}`);
            checkAchievements("add_transaction");
            setOpen(false);
            setQuery("");
            // Router refresh to update current page data (dashboard/money)
            router.refresh();
        } else {
            toast.error("Failed to quick add.");
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative z-50 w-full max-w-xl bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        <Command className="w-full h-full flex flex-col" shouldFilter={false}>
                            <div className="flex items-center border-b border-slate-100 px-4">
                                <Search className="w-5 h-5 text-slate-400 mr-2" />
                                <Command.Input
                                    autoFocus
                                    placeholder="Quick add: 50000 Lunch..."
                                    value={query}
                                    onValueChange={setQuery}
                                    className="w-full py-5 text-lg outline-none text-slate-800 placeholder:text-slate-400 bg-transparent font-medium"
                                />
                                <div className="hidden sm:flex text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-400 rounded-md">
                                    ESC
                                </div>
                            </div>

                            <Command.List className="max-h-[300px] overflow-y-auto p-2 scroll-smooth">
                                <Command.Empty className="py-6 text-center text-slate-400 text-sm">
                                    Type an amount and category to quick add.
                                </Command.Empty>

                                {query.length > 0 && (
                                    <Command.Group heading="Actions" className="text-xs font-semibold text-slate-400 px-2 pt-2 mb-2">
                                        <Command.Item
                                            onSelect={() => handleQuickAdd("expense")}
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-700 cursor-pointer rounded-xl transition-colors aria-selected:bg-rose-50 aria-selected:text-rose-700"
                                        >
                                            <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                                                <CreditCard className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold">Add as Expense</span>
                                                <span className="text-xs opacity-70">Record money spent</span>
                                            </div>
                                        </Command.Item>
                                        <Command.Item
                                            onSelect={() => handleQuickAdd("income")}
                                            className="flex items-center gap-3 px-4 py-3 mt-1 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer rounded-xl transition-colors aria-selected:bg-emerald-50 aria-selected:text-emerald-700"
                                        >
                                            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                                                <Banknote className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold">Add as Income</span>
                                                <span className="text-xs opacity-70">Record money received</span>
                                            </div>
                                        </Command.Item>
                                    </Command.Group>
                                )}

                                <Command.Separator className="h-px bg-slate-100 my-2" />

                                <Command.Group heading="Navigation" className="text-xs font-semibold text-slate-400 px-2 pt-2 mb-2">
                                    <Command.Item onSelect={() => { router.push("/dashboard"); setOpen(false); }} className="flex items-center gap-2 px-4 py-3 text-sm cursor-pointer rounded-xl transition-colors hover:bg-slate-50 aria-selected:bg-slate-50">
                                        Go to Dashboard
                                    </Command.Item>
                                    <Command.Item onSelect={() => { router.push("/money"); setOpen(false); }} className="flex items-center gap-2 px-4 py-3 text-sm cursor-pointer rounded-xl transition-colors hover:bg-slate-50 aria-selected:bg-slate-50">
                                        Go to Money
                                    </Command.Item>
                                    <Command.Item onSelect={() => { router.push("/wishlists"); setOpen(false); }} className="flex items-center gap-2 px-4 py-3 text-sm cursor-pointer rounded-xl transition-colors hover:bg-slate-50 aria-selected:bg-slate-50">
                                        Go to Wishlists
                                    </Command.Item>
                                </Command.Group>
                            </Command.List>
                        </Command>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
