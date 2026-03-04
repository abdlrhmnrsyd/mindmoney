"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ShieldCheck, Heart, Github, Instagram } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500/30 overflow-hidden relative">

      {/* --- Animated Background Elements --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-600/10 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* --- Navigation --- */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">MindMoney</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#testimonials" className="hover:text-white transition-colors">Testimonials</Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/register" className="group relative inline-flex h-10 sm:h-11 items-center justify-center overflow-hidden rounded-full bg-indigo-500 px-4 sm:px-8 font-semibold text-neutral-50 transition-all hover:bg-indigo-400">
              <span className="hidden sm:inline mr-2">Get Started</span>
              <span className="sm:hidden mr-2">Start</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* --- Hero Section --- */}
      <main className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">MindMoney 2.0 is Live</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">money.</span><br />
                Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">mind.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                The first personal finance app that connects the dots between your spending habits and your emotional well-being. Stop budgeting blindly and start building a healthier relationship with wealth.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/register" className="h-14 px-8 w-full sm:w-auto rounded-full bg-white text-slate-950 font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                  Start for free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#demo" className="h-14 px-8 w-full sm:w-auto rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-md">
                  View Demo
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center" style={{ zIndex: 5 - i }}>
                      <span className="text-xs">{(i * 9).toString(36)}</span>
                    </div>
                  ))}
                </div>
                <p>Join 10,000+ mindful spenders</p>
              </div>
            </motion.div>

            {/* Abstract Hero Image / Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex-1 w-full max-w-xl lg:max-w-none relative perspective-1000"
            >
              {/* Glow behind mockup */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 blur-3xl rounded-[3rem]"></div>

              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden transform md:rotate-y-[-10deg] md:rotate-x-[5deg] transition-transform duration-700 hover:rotate-0">
                {/* Mac OS style header */}
                <div className="h-10 bg-slate-900 border-b border-white/5 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                {/* Mock UI Body */}
                <div className="p-6 md:p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div className="w-1/3 h-8 bg-white/5 rounded-lg"></div>
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full border border-indigo-500/30"></div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/20 flex items-center px-8">
                    <div className="space-y-3">
                      <div className="h-4 w-24 bg-emerald-500/40 rounded"></div>
                      <div className="h-8 w-48 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] rounded"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-40 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col justify-end">
                      <div className="h-2 w-full bg-indigo-500/40 rounded-full mb-2"></div>
                      <div className="h-2 w-3/4 bg-indigo-500/40 rounded-full"></div>
                    </div>
                    <div className="h-40 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col justify-between">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-1/2 bg-slate-700 rounded"></div>
                        <div className="h-6 w-3/4 bg-slate-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      {/* --- Features Section --- */}
      <section id="features" className="relative z-10 py-24 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Not just another tracker.</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">MindMoney brings a psychological approach to wealth management, providing tools that make saving feel effortless and spending feel intentional.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-slate-900 border border-white/5 rounded-3xl p-8 hover:bg-slate-800/80 transition-colors"
            >
              <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-2xl mb-6">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Visual Analytics</h3>
              <p className="text-slate-400 leading-relaxed">Beautifully crafted charts that make understanding your cash flow intuitive. See exactly where every Rupiah goes without the spreadsheet headache.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-slate-900 border border-white/5 rounded-3xl p-8 hover:bg-slate-800/80 transition-colors"
            >
              <div className="w-14 h-14 bg-rose-500/20 text-rose-400 flex items-center justify-center rounded-2xl mb-6">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Mood Tracking</h3>
              <p className="text-slate-400 leading-relaxed">Correlate your spending with your emotions. Discover if you spend more when stressed, and build healthier financial coping mechanisms.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-900 border border-white/5 rounded-3xl p-8 hover:bg-slate-800/80 transition-colors"
            >
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-2xl mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Goal Gamification</h3>
              <p className="text-slate-400 leading-relaxed">Turn your savings targets into achievable milestones. Our visual wishlists make locking money away feel deeply rewarding.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Footer & Watermark --- */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 mt-auto bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
              <span className="text-slate-950 font-bold text-xs">M</span>
            </div>
            <span className="font-semibold tracking-tight text-white">MindMoney</span>
          </div>

          {/* Watermark Section */}
          <div className="flex flex-col items-center md:items-end text-sm text-slate-500 gap-1">
            <p>Designed & Developed by <span className="font-bold text-slate-300">Abdul Rahman Rasyid</span></p>
            <div className="flex items-center gap-4 mt-2">
              <a href="https://instagram.com/asit4u_" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
                <Instagram className="w-4 h-4" />
                <span>@asit4u_</span>
              </a>
              <a href="https://github.com/abdlrhmnrsyd" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
                <span>abdlrhmnrsyd</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
