import React from 'react';
import {
  Map,
  BookOpen,
  Car,
  Trophy,
  Settings,
  Sun,
  Moon,
  Compass,
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
    openTripDetail,
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
    { key: 'explore', label: 'মানচিত্র এক্সপ্লোর', icon: Map },
    { key: 'memories', label: 'স্মৃতি ও ডায়েরি', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md border-b border-white/10 text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => handleTabChange('explore')}
            className="flex items-center gap-3.5 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 bg-white text-black flex items-center justify-center group-hover:bg-[#F27D26] group-hover:text-white transition-colors duration-300 shadow-md">
              <Compass className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-body font-bold text-[10px] tracking-[0.2em] uppercase text-[#F27D26] leading-none mb-1">
                ৬৪ জেলা ভ্রমণের ডায়েরি
              </span>
              <div className="flex items-baseline gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase leading-none text-white">
                  আমার বাংলাদেশ
                </h1>
                <span className="text-xs text-white/50 hidden sm:inline font-mono">
                  Journey64
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop / Tablet) - 2 Main Pages in Bangla */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 font-body text-sm font-bold tracking-wide">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  id={`nav-tab-${item.key}`}
                  onClick={() => handleTabChange(item.key)}
                  className={`pb-1.5 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-[#F27D26] border-b-2 border-[#F27D26] font-bold'
                      : 'text-white/70 hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Footprint meter, Supabase pill, Auth & Settings */}
          <div className="flex items-center gap-3">
            {/* Quick Live Footprint Meter */}
            <button
              onClick={() => handleTabChange('explore')}
              className="flex items-center gap-3 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/15 transition-all cursor-pointer group"
              title="৬৪ জেলা পদচিহ্ন"
            >
              <div className="text-right">
                <span className="block font-body font-bold text-[9px] uppercase tracking-wider text-[#F27D26]">
                  পদচিহ্ন
                </span>
                <span className="block font-display text-base sm:text-lg leading-none text-white tracking-wide">
                  {stats.visitedCount} <span className="text-white/40 text-xs font-sans">/ ৬৪</span>
                </span>
              </div>
              <div className="h-6 w-[1px] bg-white/20" />
              <span className="font-display text-sm text-[#F27D26] font-bold">
                {stats.percentageExplored}%
              </span>
            </button>

            {/* Supabase Cloud Indicator */}
            <button
              onClick={() => handleTabChange('settings')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono transition-colors text-white/70 hover:text-white"
              title={cloudSync.message || 'Supabase ক্লাউড ডাটাবেজ'}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  cloudSync.connected ? 'bg-[#3ECF8E] animate-pulse' : 'bg-yellow-400'
                }`}
              />
              <span className="font-body uppercase tracking-wider text-[10px] font-bold">
                {cloudSync.syncing ? 'সিঙ্ক হচ্ছে' : cloudSync.connected ? 'ক্লাউড সক্রিয়' : 'ক্লাউড প্রস্তুত'}
              </span>
            </button>

            {/* Auth / Profile Button */}
            {authUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTabChange('settings')}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-colors cursor-pointer"
                  title={`লগইনকৃত: ${authUser.email}`}
                >
                  <div className="w-5 h-5 bg-[#F27D26] text-white flex items-center justify-center font-bold text-xs uppercase">
                    {(authUser.user_metadata?.display_name || authUser.email || 'U')[0]}
                  </div>
                  <span className="hidden md:inline font-body text-xs font-semibold">
                    {authUser.user_metadata?.display_name || authUser.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  onClick={signOut}
                  className="hidden md:inline-flex text-xs font-body text-stone-400 hover:text-white underline cursor-pointer"
                  title="লগআউট"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-3.5 py-1.5 bg-[#F27D26] hover:bg-[#d96615] text-white font-body text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                লগইন
              </button>
            )}

            {/* Settings Button */}
            <button
              onClick={() => handleTabChange('settings')}
              className={`p-2.5 bg-white/5 hover:bg-white/15 border transition-colors ${
                activeTab === 'settings' ? 'border-[#F27D26] text-[#F27D26]' : 'border-white/10 text-white'
              }`}
              aria-label="সেটিংস"
              title="সেটিংস ও ক্লাউড"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors"
              aria-label="থিম পরিবর্তন"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#F27D26]" />
              ) : (
                <Moon className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))]">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                id={`mobile-nav-tab-${item.key}`}
                onClick={() => handleTabChange(item.key)}
                className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 px-1 transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#F27D26] font-bold scale-105'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-body text-[11px] font-bold leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => handleTabChange('settings')}
            className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 px-1 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'text-[#F27D26] font-bold scale-105'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-body text-[11px] font-bold leading-none">
              সেটিংস
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
};


