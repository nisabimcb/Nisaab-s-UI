"use client";

import React, { useState, useRef, useEffect } from "react";
import { GraduationCap, Search, UserPlus, ChevronDown, Settings, LogOut } from "lucide-react";
import { UserProfile } from "@/types/student";

interface AppHeaderProps {
  user: UserProfile;
  onSignOut: () => void;
  onOpenAddStudent: () => void;
  onSearchChange: (query: string) => void;
  onOpenSettings: () => void;
}

export default function AppHeader({
  user,
  onSignOut,
  onOpenAddStudent,
  onSearchChange,
  onOpenSettings,
}: AppHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearchChange(val);
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-blue-500/20 bg-[#091122]/90 backdrop-blur-md z-40 shrink-0 sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-800 border border-blue-400/30 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          <GraduationCap className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="block font-bold text-sm tracking-tight text-white font-[family-name:var(--font-heading)] leading-none">
            Student Manager
          </span>
          <span className="text-[10px] font-semibold text-blue-400 tracking-wider uppercase">
            Pro Portal &bull; Localhost
          </span>
        </div>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-md mx-6 relative hidden sm:flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchVal}
          onChange={handleSearch}
          placeholder="Search students, roll numbers, or courses... (Press '/' to focus)"
          className="w-full pl-10 pr-4 py-1.5 rounded-full bg-[#060c16]/80 border border-blue-500/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onOpenAddStudent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-xs border border-blue-400/30 shadow-[0_2px_10px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Student</span>
        </button>

        {/* Online Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-semibold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>Online</span>
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 pr-2.5 rounded-full bg-blue-950/40 border border-blue-500/20 hover:border-blue-400/40 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-blue-700 text-white font-bold text-xs flex items-center justify-center">
              {user.avatar}
            </div>
            <div className="text-left hidden lg:block">
              <span className="block text-xs font-semibold text-white leading-tight">
                {user.name}
              </span>
              <span className="block text-[10px] text-slate-400 leading-tight">
                {user.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 p-1.5 rounded-xl glass-card border border-blue-500/30 shadow-2xl bg-[#091122]/95 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-blue-500/15">
                <span className="block font-semibold text-xs text-white truncate">
                  {user.name}
                </span>
                <span className="block text-[11px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-blue-600/15 hover:text-white transition-all text-left mt-1 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Portal Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-all text-left mt-0.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
