"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { api, clearStoredUser, clearTokens, setStoredUser, setTokens } from "@/lib/api";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      clearTokens();
      clearStoredUser();
      const data = await api.register(email, password);
      setTokens(data.access, data.refresh);
      setStoredUser(data.user);
      router.push("/notes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 font-inter">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex h-40 w-56 items-center justify-center">
          <img
            src="/images/cat-sleeping.png"
            alt="Sleeping cat"
            className="h-full w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <h1 className="font-inria-serif text-3xl font-bold text-brown">
          Yay, New Friend!
        </h1>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="auth-input w-full rounded-lg border border-brown-border bg-transparent px-4 py-3 text-black outline-none focus:border-black"
            required
          />
          <PasswordInput
            value={password}
            onChange={setPassword}
            minLength={6}
          />

          {error && (
            <p className="text-center text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full border border-brown py-3 font-semibold text-brown transition-colors hover:bg-cream-dark disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <Link
          href="/login"
          className="text-sm text-brown underline underline-offset-4 hover:text-brown-light"
        >
          We&apos;re already friends!
        </Link>
      </div>
    </div>
  );
}
