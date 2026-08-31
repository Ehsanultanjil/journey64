import React from 'react';
import {
  Map,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Compass,
  ArrowRight,
  User,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    stats,
    settings,
    cloudSync,
    authUser,
    openAuthModal,
    signOut,
    updateSettings,
    openDistrictJournal,
  } = useApp();

  const handleTabChange = (tab: ActiveTab) => {
    if (tab !== 'memories') openDistrictJournal(null);
    setActiveTab(tab);
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const navItems: { key: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'explore', label: 'মানচিত্র এক্সপ্লোরার', icon: Map },
    { key: 'memories', label: 'স্মৃতি ও ডায়েরি', icon: BookOpen },
    { key: 'settings', label: 'সেটিংস', icon: Settings },
  ];

  return (
    <header className="relative z-40 w-full pt-3 px-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-2 sm:gap-4 relative">
        {/* Left Pill Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-[#12141A]/90 backdrop-blur-xl border border-white/15 p-1.5 rounded-full shadow-lg">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                id={`nav-tab-${item.key}`}
                onClick={() => handleTabChange(item.key)}
                className={`px-4 py-2 rounded-full text-xs font-body font-bold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/30 scale-105'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile Left Brand Emblem */}
        <div
          onClick={() => handleTabChange('explore')}
          className="md:hidden flex items-center gap-2 cursor-pointer bg-[#12141A]/90 border border-white/15 p-1.5 pr-3 rounded-full"
        >
          <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-display text-sm font-bold text-white tracking-tight">
            আমার বাংলাদেশ
          </span>
        </div>

        {/* Center Hanging Notched Brand Badge */}
        <div
          onClick={() => handleTabChange('explore')}
          className="hidden md:flex items-center gap-2.5 bg-white text-stone-950 px-6 py-2.5 rounded-b-2xl shadow-xl border-x border-b border-stone-300/60 cursor-pointer group hover:scale-[1.02] transition-transform -mt-3"
        >
          <div className="w-7 h-7 bg-[#EA580C] text-white flex items-center justify-center rounded-lg shadow-xs group-hover:rotate-45 transition-transform duration-300">
            <Compass className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display text-base lg:text-lg font-black tracking-tight text-stone-950">
                আমার বাংলাদেশ
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                64
              </span>
            </div>
            <span className="font-body text-[8px] font-bold text-[#EA580C] tracking-wider uppercase leading-tight mt-0.5">
              Expedition Tracker
            </span>
          </div>
        </div>

        {/* Right Action Pills */}
        <div className="flex items-center gap-2">
          {/* Live Footprint Pill */}
          <button
            onClick={() => handleTabChange('explore')}
            className="hidden sm:flex items-center gap-2 bg-[#12141A]/90 backdrop-blur-xl border border-white/15 px-3.5 py-2 rounded-full text-white hover:bg-[#1A1D24] transition-all cursor-pointer shadow-md"
            title="৬৪ জেলা পদচিহ্ন"
          >
            <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse" />
            <span className="font-body text-xs font-bold">
              পদচিহ্ন: <strong className="text-white">{stats.visitedCount}</strong>/৬৪
            </span>
            <span className="text-[11px] font-display font-bold text-[#EA580C] bg-[#EA580C]/15 px-2 py-0.5 rounded-full">
              {stats.percentageExplored}%
            </span>
          </button>

          {/* Cloud Sync Status Pill */}
          <button
            onClick={() => handleTabChange('settings')}
            className="hidden lg:flex items-center gap-1.5 bg-[#12141A]/90 border border-white/15 px-3 py-2 rounded-full text-[11px] font-body font-bold text-stone-300 hover:text-white transition-colors"
            title={cloudSync.message || 'Supabase ক্লাউড ডাটাবেজ'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cloudSync.connected ? 'bg-[#10B981] animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{cloudSync.connected ? 'ক্লাউড সক্রিয়' : 'ক্লাউড প্রস্তুত'}</span>
          </button>

          {/* Auth Button with Circular Arrow */}
          {authUser ? (
            <div className="flex items-center gap-1 bg-[#12141A]/90 border border-white/15 p-1 rounded-full">
              <button
                onClick={() => handleTabChange('settings')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-full text-white text-xs font-body font-bold transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 bg-[#EA580C] text-white rounded-full flex items-center justify-center text-[10px] font-bold uppercase">
                  {(authUser.user_metadata?.display_name || authUser.email || 'U')[0]}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {authUser.user_metadata?.display_name || authUser.email?.split('@')[0]}
                </span>
              </button>
              <button
                onClick={signOut}
                className="p-1.5 hover:bg-white/10 text-stone-400 hover:text-rose-400 rounded-full transition-colors cursor-pointer"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 bg-[#EA580C] hover:bg-[#c2410c] text-white px-4 py-2 rounded-full font-body text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#EA580C]/25"
            >
              <span>লগইন করুন</span>
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-[#12141A]/90 hover:bg-[#1A1D24] border border-white/15 rounded-full text-stone-200 hover:text-white transition-colors cursor-pointer shadow-md"
            aria-label="থিম পরিবর্তন"
            title={settings.theme === 'dark' ? 'হোয়াইট থিমে পরিবর্তন' : 'ডার্ক থিমে পরিবর্তন'}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#F59E0B]" />
            ) : (
              <Moon className="w-4 h-4 text-stone-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-3 left-4 right-4 z-50 bg-[#12141A]/95 backdrop-blur-2xl border border-white/20 rounded-full p-1.5 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                id={`mobile-nav-tab-${item.key}`}
                onClick={() => handleTabChange(item.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EA580C] text-white font-bold shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-body text-xs font-bold leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};




