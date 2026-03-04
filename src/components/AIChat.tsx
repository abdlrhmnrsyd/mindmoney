"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, User, Sparkles, Minus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Message = {
    id: string;
    role: "user" | "ai";
    content: string;
};

export function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "ai", content: "Hi! I'm your MindMoney AI assistant. How can I help you with your finances today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Context caching
    const [financeContext, setFinanceContext] = useState<any>(null);

    useEffect(() => {
        if (isOpen && !financeContext) {
            fetchContext();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isMinimized, isOpen]);

    const fetchContext = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: transactions } = await supabase
            .from("transactions")
            .select("amount, category, type, created_at")
            .order("created_at", { ascending: false })
            .limit(50); // Just send last 50 for context size limits

        const { data: budgets } = await supabase.from("budgets").select("*");

        setFinanceContext({
            transactions: transactions || [],
            budgets: budgets || [],
            currentDate: new Date().toISOString()
        });
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg.content,
                    contextObj: financeContext || { note: "Context still loading..." }
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "Sorry, I ran into an error processing that. Did you set the GEMINI_API_KEY?" }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "Network error fetching AI response." }]);
        }

        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1, height: isMinimized ? "auto" : "500px" }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900/50 w-[350px] sm:w-[400px] mb-4 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 text-white p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5" />
                                <span className="font-bold">MindMoney AI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:bg-indigo-700 p-1 rounded">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="hover:bg-indigo-700 p-1 rounded">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Body */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 space-y-4">
                                    {messages.map(m => (
                                        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${m.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm"}`}>
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1">
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask about your spending..."
                                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading || !input.trim()}
                                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating FAB button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setIsOpen(true); setIsMinimized(false); }}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full p-4 shadow-xl border-2 border-white dark:border-slate-800 shadow-indigo-600/30 flex items-center justify-center relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -ml-12 w-8"></div>
                    <Sparkles className="w-6 h-6" />
                </motion.button>
            )}
        </div>
    );
}
