"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

type TxType = "income" | "expense";

const MOODS = ["😄", "🙂", "😐", "😔", "😡"] as const;

export default function NewTransactionPage() {
  const [type, setType] = useState<TxType>("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [mood, setMood] = useState<(typeof MOODS)[number]>("😐");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      // 1) pastiin user login
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user) {
        setMsg("Lo belum login. Balik ke /login dulu ya.");
        return;
      }

      // 2) validasi amount
      const parsed = Number(amount);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setMsg("Amount harus angka > 0.");
        return;
      }

      if (!category.trim()) {
        setMsg("Category wajib diisi.");
        return;
      }

      // 3) convert emoji to mood string for postgres constraint
      let parsedMood: "good" | "neutral" | "bad" = "neutral";
      if (mood === "😄" || mood === "🙂") parsedMood = "good";
      else if (mood === "😔" || mood === "😡") parsedMood = "bad";

      // 4) insert ke table
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type,
        category: category.trim(),
        amount: parsed,
        mood: type === "expense" ? parsedMood : "neutral",
        note: note.trim() || null,
      });

      if (error) throw error;

      setMsg("✅ Transaksi ke-save!");
      setCategory("");
      setAmount("");
      setMood("😐");
      setNote("");
      setType("expense");
    } catch (err: any) {
      setMsg(err?.message ?? "Error unknown");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        New Transaction
      </h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TxType)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Category</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Coffee, Rent, Salary"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Amount</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="numeric"
            placeholder="e.g. 25000"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Mood</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 10,
                  background: mood === m ? "#eee" : "white",
                  cursor: "pointer",
                  fontSize: 18,
                }}
                aria-pressed={mood === m}
              >
                {m}
              </button>
            ))}
          </div>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Note (optional)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional: trigger / context..."
            rows={3}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #111",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving..." : "Save"}
        </button>

        {msg && <p>{msg}</p>}
      </form>

      <p style={{ marginTop: 16, opacity: 0.8 }}>
        Coba save, terus cek di Supabase → Table editor → transactions.
      </p>
    </div>
  );
}