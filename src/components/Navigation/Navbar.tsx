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
    <header className="sticky top-0 z-50 w-full py-2.5 sm:py-3.5 px-3 sm:px-6 lg:px-8 bg-transparent pointer-events-none transition-all">
      <div className="relative flex items-center justify-center max-w-7xl mx-auto min-h-[38px] sm:min-h-[44px]">
        {/* Center: Perfectly Centered Pure Floating Capsule Navigation Bar */}
        <nav className="flex items-center bg-[#12141A]/90 backdrop-blur-2xl border border-white/15 p-0.5 sm:p-1 rounded-full shadow-2xl pointer-events-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                id={`nav-tab-${item.key}`}
                onClick={() => handleTabChange(item.key)}
                className={`relative px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-body font-bold tracking-wide transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 sm:gap-2 z-10 ${
                  isActive
                    ? 'text-white'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 bg-[#059669] rounded-full shadow-md shadow-[#059669]/30 -z-10"
                  />
                )}
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Corner: Settings Button Pin to Right without Offsetting Center */}
        <div className="absolute right-0 flex items-center pointer-events-auto">
          <button
            id="nav-settings-circle-btn"
            onClick={() => handleTabChange('settings')}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all cursor-pointer shadow-md hover:scale-105 group relative ${
              activeTab === 'settings'
                ? 'bg-[#059669] border-[#059669] text-white shadow-lg shadow-[#059669]/30'
                : 'bg-[#12141A]/85 border-white/15 text-stone-300 hover:text-white hover:bg-[#1A1D24] hover:border-white/30'
            }`}
            title={authUser ? `প্রোফাইল ও সেটিংস (${authUser.email})` : 'সেটিংস ও লগইন'}
            aria-label="সেটিংস"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-45 transition-transform duration-300" />
            {authUser && (
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-[#12141A]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
