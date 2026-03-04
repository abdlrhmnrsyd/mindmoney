"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, User, Upload, Loader2, Save } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Profile State
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setUserId(session.user.id);
            const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
            if (data) {
                setUsername(data.username || "");
                if (data.avatar_url) setAvatarUrl(data.avatar_url);
            } else {
                // Set default username based on email
                setUsername(session.user.email?.split("@")[0] || "");
            }
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${userId}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            toast.success("Avatar uploaded! Remember to save changes.");

        } catch (error: any) {
            toast.error("Error uploading avatar: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!userId) return;
        setSaving(true);
        try {
            const updates = {
                id: userId,
                username,
                avatar_url: avatarUrl,
            };

            const { error } = await supabase.from("profiles").upsert(updates);
            if (error) throw error;
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error("Error updating profile: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (!mounted) {
        return <div className="p-6 md:p-8 space-y-6 animate-pulse">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="p-6 md:p-8 space-y-6 max-w-2xl"
        >
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

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Profile Settings</h2>

                <div className="flex flex-col sm:flex-row gap-8 items-start">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-slate-400" />
                                )}
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">JPG, GIF or PNG. Max size of 2MB</span>
                    </div>

                    {/* Profile Fields */}
                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                placeholder="Your awesome name"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-semibold rounded-xl transition-all shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 flex justify-center items-center gap-2 disabled:opacity-70"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
