






"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const login = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    /* 🔥 SINGLE CONTINUOUS BACKGROUND */
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* glow blobs */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-24 left-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-24 w-96 h-96 bg-pink-500 rounded-full blur-3xl" />
      </div>

      {/* CONTENT GRID */}
      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT – MARKETING (DESKTOP ONLY) */}
        <div className="hidden lg:flex flex-col justify-center px-16 text-white">
          <div className="max-w-xl space-y-6 animate-fadeIn">
            <h1 className="text-4xl font-bold leading-tight">
              Turn conversations into
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                clear human replies
              </span>
            </h1>

            <p className="text-lg text-gray-300">
              PlainReply lets you paste any chat or conversation and instantly get
              a short, clear, and natural reply — ready to send.
            </p>

            <ul className="space-y-3 text-gray-300">
              <li>✔ No AI-generated tone</li>
              <li>✔ Works with WhatsApp, Slack, Email, Teams</li>
              <li>✔ Built for professionals & non-technical users</li>
            </ul>

            <p className="text-sm text-gray-400">
              Used for client replies, manager updates, and professional communication.
            </p>
          </div>
        </div>

        {/* RIGHT – LOGIN */}
        <div className="flex items-center justify-center px-4">
          <div className="w-full max-w-md backdrop-blur-2xl bg-white/10 p-8 rounded-2xl
            border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-slideUp">

            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center
                bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 rounded-full">
                ⚡
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-gray-300 text-sm">
                Sign in to continue to PlainReply
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                login();
              }}
              className="space-y-5"
            >
              <input
                type="email"
                placeholder="Email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/15
                text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/15
                  text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-300"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {error && (
                <div className="text-sm text-red-300 bg-red-500/20 p-2 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-gradient-to-r
                from-purple-600 via-fuchsia-500 to-pink-500
                text-white font-semibold hover:scale-[1.02] transition disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-gray-300 mt-6 text-sm">
              Don’t have an account?{" "}
              <Link href="/auth/signup" className="text-purple-400 font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
