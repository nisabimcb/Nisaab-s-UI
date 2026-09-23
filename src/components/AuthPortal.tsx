"use client";

import React, { useState } from "react";
import { GraduationCap, User, Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { UserProfile } from "@/types/student";

interface AuthPortalProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthPortal({ onLoginSuccess }: AuthPortalProps) {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState("admin@academy.edu");
  const [signInPassword, setSignInPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpRole, setSignUpRole] = useState("Administrator");
  const [signUpPassword, setSignUpPassword] = useState("");

  // Forgot Password Dialog
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("admin@academy.edu");
  const [forgotSent, setForgotSent] = useState(false);

  function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // In UI testing mode, any credentials allow sign in!
      const raw = signInIdentifier.trim() || "Admin User";
      let name = raw;
      let email = raw;
      if (raw.includes("@")) {
        const prefix = raw.split("@")[0];
        name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      } else {
        email = `${raw.toLowerCase().replace(/\s+/g, ".")}@academy.edu`;
      }

      const user: UserProfile = {
        name,
        email,
        role: "Administrator",
        avatar: getInitials(name),
      };

      if (rememberMe) {
        localStorage.setItem("sm_active_user", JSON.stringify(user));
      }
      setIsLoading(false);
      onLoginSuccess(user);
    }, 450);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const name = signUpName.trim() || "New User";
      const email = signUpEmail.trim() || "user@academy.edu";
      const user: UserProfile = {
        name,
        email,
        role: signUpRole,
        avatar: getInitials(name),
      };

      localStorage.setItem("sm_active_user", JSON.stringify(user));
      setIsLoading(false);
      onLoginSuccess(user);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-[440px] p-8 rounded-2xl glass-card border border-blue-500/25 shadow-[0_20px_60px_rgba(2,6,15,0.7),0_0_30px_rgba(37,99,235,0.25)] relative">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-cyan-500/20 border border-blue-400/30 text-blue-400 mb-3 shadow-[0_0_20px_rgba(37,99,235,0.35)]">
            <GraduationCap className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-white tracking-tight">
            Student Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Academic Administration & Student Records Portal
          </p>
        </div>

        {/* Auth Tab Switcher */}
        <div className="flex bg-[#060c16]/80 p-1 rounded-xl border border-blue-500/15 mb-4">
          <button
            type="button"
            onClick={() => setAuthMode("signin")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authMode === "signin"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authMode === "signup"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Direct Access to Student Area Card */}
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-950/70 via-blue-900/50 to-indigo-950/70 border border-blue-400/35 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Student Section</span>
            </span>
            <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
              Direct Access
            </span>
          </div>
          <p className="text-[11px] text-blue-200/80 mb-2.5 leading-snug">
            Need the Student Area immediately? Click below to explore the student roster, records, and student portal:
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const guestUser: UserProfile = {
                  name: "Demo Administrator",
                  email: "admin@academy.edu",
                  role: "Administrator",
                  avatar: "DA",
                };
                localStorage.setItem("sm_active_user", JSON.stringify(guestUser));
                onLoginSuccess(guestUser);
              }}
              className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-[0_0_12px_rgba(37,99,235,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Open Student Area</span>
            </button>
            <a
              href="/students"
              className="py-1.5 px-2.5 rounded-lg bg-[#060c16] hover:bg-blue-950/80 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all hover:text-white"
              title="Open standalone /students URL"
            >
              /students &rarr;
            </a>
          </div>
        </div>

        {/* UI Testing Notice */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 mb-4 text-[11px] text-blue-300/80 leading-tight">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            <strong>UI Testing Mode:</strong> Any credentials will allow instant sign-in.
          </span>
        </div>

        {/* SIGN IN FORM */}
        {authMode === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email or Username
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="admin@academy.edu or username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#091122]/90 border border-blue-500/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-blue-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter any password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#091122]/90 border border-blue-500/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600 bg-slate-800 border-slate-700"
                />
                <span>Remember this session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm shadow-[0_4px_18px_rgba(37,99,235,0.4)] border border-blue-400/30 transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Dr. Hashir Naveed"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#091122]/90 border border-blue-500/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="user@academy.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#091122]/90 border border-blue-500/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account Role
              </label>
              <select
                value={signUpRole}
                onChange={(e) => setSignUpRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#091122]/90 border border-blue-500/20 text-white text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                <option value="Administrator">Administrator</option>
                <option value="Instructor">Faculty / Instructor</option>
                <option value="Registrar">Academic Registrar</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Create Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Enter any password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#091122]/90 border border-blue-500/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm shadow-[0_4px_18px_rgba(37,99,235,0.4)] border border-blue-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register & Open Dashboard</span>
              )}
            </button>
          </form>
        )}

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-blue-500/15 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Localhost Secured Session &bull; 256-bit Encryption</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm p-6 rounded-2xl glass-card border border-blue-500/30 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Password Recovery</h3>
            <p className="text-xs text-slate-300 mb-4">
              In UI testing mode, any password will sign you in immediately. Enter an email below to simulate a reset instructions link.
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#091122] border border-blue-500/30 text-white text-sm mb-4 outline-none focus:border-blue-400"
            />
            {forgotSent ? (
              <p className="text-xs text-emerald-400 mb-4">✓ Demo reset instructions link generated!</p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg border border-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setForgotSent(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow"
              >
                Simulate Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
