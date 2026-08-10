"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setInviteToken(params.get("inviteToken"));
  }, []);

  const { data: session, status } = useSession();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard (or accept invite)
    if (status === "authenticated") {
      if (inviteToken) {
        // attempt to accept the invite then redirect to project
        (async () => {
          const acceptRes = await fetch(`/api/invites/${inviteToken}/accept`, { method: "POST" });
          if (acceptRes.ok) {
            const { projectId } = await acceptRes.json();
            router.push(`/dashboard/${projectId}`);
          } else {
            router.push("/dashboard");
          }
        })();
        return;
      }
      router.push("/dashboard");
    }
  }, [status, inviteToken, router]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      setStep("code");
    } else {
      setError("Couldn't send the code. Try again.");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      code,
      redirect: false,
    });

    if (!result?.ok) {
      setLoading(false);
      setError("That code didn't check out. Try again.");
      return;
    }

    if (inviteToken) {
      const acceptRes = await fetch(`/api/invites/${inviteToken}/accept`, {
        method: "POST",
      });
      setLoading(false);
      if (acceptRes.ok) {
        const { projectId } = await acceptRes.json();
        router.push(`/dashboard/${projectId}`);
      } else {
        const { error: acceptError } = await acceptRes.json();
        setError(acceptError ?? "Couldn't accept the invite.");
      }
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold mb-2">
          {step === "email" ? "Sign in" : "Enter your code"}
        </h1>
        <p className="text-muted text-sm mb-8">
          {step === "email"
            ? "No password. We'll send a one-time code to your email."
            : `Sent to ${email}.`}
        </p>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-text placeholder:text-muted focus:outline-none focus:border-amber"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber text-ink font-medium px-4 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              required
              inputMode="numeric"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-text font-mono tracking-widest placeholder:text-muted focus:outline-none focus:border-amber"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber text-ink font-medium px-4 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & sign in"}
            </button>
          </form>
        )}

        {error && (
          <p className="text-signal-red text-sm mt-4 font-mono">{error}</p>
        )}
      </div>
    </main>
  );
}
