import React from 'react';
import { motion } from 'motion/react';
import {
  Map,
  BookOpen,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    authUser,
    openAuthModal,
    openDistrictJournal,
  } = useApp();

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'settings' && !authUser) {
      openAuthModal();
      return;
    }
    if (tab !== 'memories') openDistrictJournal(null);
    setActiveTab(tab);
  };

  const navItems: { key: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'explore', label: 'মানচিত্র', icon: Map },
    { key: 'memories', label: 'ভ্রমণ ডায়েরি', icon: BookOpen },
  ];

  return (
    <header className="relative z-40 w-full pt-3 px-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-2 relative max-w-7xl mx-auto min-h-[44px]">
        {/* Left Spacer for true centering */}
        <div className="w-10 shrink-0 hidden md:block" />

        {/* Center: Minimal Centered Navigation Bar with Ultra-Smooth Sliding Active Pill */}
        <nav className="hidden md:flex items-center bg-[#12141A]/90 backdrop-blur-2xl border border-white/15 p-1 rounded-full shadow-2xl absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                id={`nav-tab-${item.key}`}
                onClick={() => handleTabChange(item.key)}
                className={`relative w-36 sm:w-40 py-2 rounded-full text-xs font-body font-bold tracking-wide transition-colors cursor-pointer text-center flex items-center justify-center gap-2 z-10 ${
                  isActive
                    ? 'text-white'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 bg-[#059669] rounded-full shadow-lg shadow-[#059669]/30 -z-10"
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Corner: Sleek Circular Settings Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="nav-settings-circle-btn"
            onClick={() => handleTabChange('settings')}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all cursor-pointer shadow-md hover:scale-105 group relative ${
              activeTab === 'settings'
                ? 'bg-[#059669] border-[#059669] text-white shadow-lg shadow-[#059669]/30'
                : 'bg-[#12141A]/85 border-white/15 text-stone-300 hover:text-white hover:bg-[#1A1D24] hover:border-white/30'
            }`}
            title={authUser ? `প্রোফাইল ও সেটিংস (${authUser.email})` : 'সেটিংস ও লগইন'}
            aria-label="সেটিংস"
          >
            <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
            {authUser && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-[#12141A]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-3 left-4 right-4 z-50 bg-[#12141A]/95 backdrop-blur-2xl border border-white/20 rounded-full p-1.5 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-around relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                id={`mobile-nav-tab-${item.key}`}
                onClick={() => handleTabChange(item.key)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full transition-colors cursor-pointer z-10 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-mobile-nav-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 bg-[#059669] rounded-full shadow-md -z-10"
                  />
                )}
                <Icon className="w-4 h-4" />
                <span className="font-body text-xs font-bold leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => handleTabChange('settings')}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full transition-colors cursor-pointer z-10 ${
              activeTab === 'settings'
                ? 'text-white font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {activeTab === 'settings' && (
              <motion.div
                layoutId="active-mobile-nav-pill"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 bg-[#059669] rounded-full shadow-md -z-10"
              />
            )}
            <Settings className="w-4 h-4" />
            <span className="font-body text-xs font-bold leading-none">
              সেটিংস
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
};




