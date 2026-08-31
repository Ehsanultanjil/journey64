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
    updateSettings,
    openDistrictJournal,
    openTripDetail,
  } = useApp();

  const handleTabChange = (tab: ActiveTab) => {
    if (tab !== 'memories') openDistrictJournal(null);
    if (tab !== 'trips') openTripDetail(null);
    setActiveTab(tab);
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const navItems: { key: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'explore', label: 'Explore Map', icon: Map },
    { key: 'memories', label: 'Memories', icon: BookOpen },
    { key: 'trips', label: 'Road Trips', icon: Car },
    { key: 'progress', label: 'Progress', icon: Trophy },
    { key: 'settings', label: 'Settings', icon: Settings },
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
              <span className="font-body font-black text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-[#F27D26] leading-none mb-1">
                Travel Journal • 64 Districts
              </span>
              <div className="flex items-baseline gap-2">
                <h1 className="font-display text-2xl sm:text-3xl tracking-wide uppercase leading-none text-white">
                  MY BANGLADESH
                </h1>
                <span className="font-bn text-xs text-white/50 hidden sm:inline font-semibold">
                  আমার বাংলাদেশ
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-body text-[11px] font-black tracking-[0.2em] uppercase">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  id={`nav-tab-${item.key}`}
                  onClick={() => handleTabChange(item.key)}
                  className={`pb-1.5 transition-all duration-200 uppercase tracking-[0.2em] cursor-pointer ${
                    isActive
                      ? 'text-[#F27D26] border-b-2 border-[#F27D26]'
                      : 'text-white/60 hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Live Stats Pill & Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Quick Live Footprint Meter in Bold Typography Style */}
            <button
              onClick={() => handleTabChange('progress')}
              className="flex items-center gap-3 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/15 transition-all cursor-pointer group"
              title="Click to view full progress"
            >
              <div className="text-right">
                <span className="block font-body font-black text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-[#F27D26]">
                  Footprint
                </span>
                <span className="block font-display text-base sm:text-lg leading-none text-white tracking-wide">
                  {stats.visitedCount} <span className="text-white/40 text-xs font-sans">/ 64</span>
                </span>
              </div>
              <div className="h-6 w-[1px] bg-white/20" />
              <span className="font-display text-sm text-[#F27D26]">
                {stats.percentageExplored}%
              </span>
            </button>

            {/* Supabase Cloud Indicator */}
            <button
              onClick={() => handleTabChange('settings')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono transition-colors text-white/70 hover:text-white"
              title={cloudSync.message || 'Supabase Cloud Database'}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  cloudSync.connected ? 'bg-[#3ECF8E] animate-pulse' : 'bg-yellow-400'
                }`}
              />
              <span className="font-display uppercase tracking-wider text-[9px]">
                {cloudSync.syncing ? 'SYNCING' : cloudSync.connected ? 'CLOUD ON' : 'DB READY'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors"
              aria-label="Toggle Theme"
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
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))]">
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
                    ? 'text-[#F27D26] font-black scale-105'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-body text-[9px] font-black uppercase tracking-wider leading-none">
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
