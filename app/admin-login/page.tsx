"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Incorrect passcode.");
        setSubmitting(false);
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next") || "/admin";
      window.location.href = next;
    } catch {
      setError("Could not reach the server. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0A0B0E] px-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-white/12 bg-[#101216] p-6 sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">
          Modfem Autos
        </p>
        <h1 className="mt-1 text-xl font-medium tracking-tight text-white">
          Dealer Console Access
        </h1>
        <p className="mt-2 text-xs text-white/50">
          Enter the admin passcode to unlock logistics, milestone dispatch, and
          inventory intake.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              Passcode
            </span>
            <input
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              className="field font-mono"
              autoFocus
            />
          </label>
          {error && <p className="mt-2 font-mono text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 flex w-full items-stretch overflow-hidden rounded-full bg-white text-zinc-950 disabled:opacity-60"
          >
            <span className="flex flex-1 items-center justify-center px-4 py-3 text-[10px] font-medium uppercase tracking-widest">
              {submitting ? "Verifying..." : "Unlock Dealer Console"}
            </span>
            <span className="flex items-center justify-center border-l border-zinc-200 px-3">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
