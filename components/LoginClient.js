"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function LoginClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      });

      if (result?.error) {
        setError("Access denied. Your email is not authorised for any club.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0C2945]">

      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-[#1a4a7a] opacity-40 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-[#CFAF5A] opacity-20 blur-3xl" />

      {/* Main container */}
      <div className="relative z-10 w-full max-w-5xl mx-4 flex rounded-2xl overflow-hidden shadow-2xl">

        {/* ───── LEFT SIDE ───── */}
        <div className="w-full md:w-[38%] bg-white flex flex-col items-center justify-center p-10 gap-8">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <NITLogo size={64} />
            <div className="text-center">
              <p className="text-xs font-semibold text-[#0C2945] tracking-widest uppercase">
                NIT Delhi
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Club Management System
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="w-full flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0C2945]">
              Welcome back
            </h1>
            <p className="text-sm text-gray-400 text-center">
              Sign in with your NIT Delhi Google account
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center w-full gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Sign in</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Button */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full py-3 px-5 rounded-xl bg-white border border-gray-300 shadow-sm hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all font-medium text-gray-700 text-sm disabled:opacity-60"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin text-gray-400" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                    fill="none"
                  />
                  <path
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    fill="currentColor"
                    className="opacity-75"
                  />
                </svg>
              ) : (
                <GoogleIcon />
              )}

              {loading ? "Redirecting securely..." : "Continue with Google"}
            </button>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center">
                {error}
              </div>
            )}
          </div>

          {/* Note */}
          <p className="text-[10px] text-gray-300 text-center">
            <span className="text-red-500">*</span> Only NIT Delhi email IDs allowed
          </p>

          {/* Footer */}
          <p className="text-[10px] text-gray-400 text-center">
            © {new Date().getFullYear()} NIT Delhi · All rights reserved
          </p>
        </div>

        {/* ───── RIGHT SIDE ───── */}
        <div className="hidden md:flex flex-[62%] flex-col justify-between p-10 bg-gradient-to-br from-[#0C2945] via-[#102f52] to-[#081e33] text-white relative overflow-hidden">

          {/* Decorative circles */}
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border border-white/10" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full border border-white/5" />

          {/* Header */}
          <div className="flex items-center gap-5 z-10">
            <NITLogo size={72} />
            <div>
              <div className="font-bold text-base">
                राष्ट्रीय प्रौद्योगिकी संस्थान, दिल्ली
              </div>
              <div className="font-bold text-lg">
                National Institute of Technology, Delhi
              </div>
              <div className="text-white/60 text-xs mt-1">
                Ministry of Education, Govt. of India
              </div>
            </div>
          </div>

          {/* Hero text */}
          <div className="z-10 my-auto">
            <p className="text-white/50 text-sm uppercase tracking-widest mb-3">
              Student Club Portal
            </p>

            <h2 className="text-5xl font-bold leading-tight">
              Manage your <br />
              <span className="text-[#CFAF5A]">club,</span> your way.
            </h2>

            <p className="mt-4 text-white/60 text-sm max-w-xs">
              Manage members, roles, and club activities seamlessly.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 z-10">
            {["Member Directory", "Role Management", "Club Profiles"].map((f) => (
              <span
                key={f}
                className="text-xs bg-white/10 border border-white/15 rounded-full px-3 py-1"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── REAL LOGO COMPONENT ───── */
function NITLogo({ size = 64 }) {
  return (
    <Image
      src="/nitdelhi.png"
      alt="NIT Delhi Logo"
      width={size}
      height={size}
      className="object-contain"
      priority
    />
  );
}

/* ───── GOOGLE ICON ───── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84c-.21 1.12-.84 2.08-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.87 2.69-6.62z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.03-3.71H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
      <path d="M3.96 10.71A5.4 5.4 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3-2.33z" fill="#FBBC05"/>
      <path d="M9 3.58c1.32 0 2.51.45 3.44 1.34l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}