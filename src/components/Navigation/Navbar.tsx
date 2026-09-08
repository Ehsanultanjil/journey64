import React from 'react';
import { motion } from 'motion/react';
import {
  Map,
  BookOpen,
  Settings,
  LogIn,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    authUser,
    profile,
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

  const profileDisplayName = profile.displayName || profile.name || authUser?.user_metadata?.display_name || authUser?.email?.split('@')[0] || 'প্রোফাইল';

  return (
    <header className="sticky top-0 z-50 w-full py-2.5 sm:py-3.5 px-3 sm:px-6 lg:px-8 bg-transparent pointer-events-none transition-all">
      <div className="relative flex items-center justify-center max-w-7xl mx-auto min-h-[38px] sm:min-h-[44px]">
        {/* Center: Perfectly Symmetrical Navigation Capsule with Equal Width Tabs */}
        <nav className="flex items-center bg-[#12141A]/90 backdrop-blur-2xl border border-white/15 p-1 rounded-full shadow-2xl pointer-events-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                id={`nav-tab-${item.key}`}
                onClick={() => handleTabChange(item.key)}
                className={`relative w-[100px] sm:w-[135px] py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-body font-bold tracking-wide transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 sm:gap-2 z-10 ${
                  isActive
                    ? 'text-white'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 bg-[#004526] rounded-full shadow-md shadow-[#004526]/30 -z-10"
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Corner: Auth Status & Settings / Profile Button */}
        <div className="absolute right-0 flex items-center gap-2 pointer-events-auto">
          {!authUser ? (
            <button
              id="nav-login-btn"
              onClick={() => openAuthModal('আপনার ভ্রমণ তথ্য সংরক্ষণ ও সিঙ্ক করতে লগইন করুন')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 bg-[#004526] hover:bg-[#005a32] text-white text-[11px] sm:text-xs font-body font-bold shadow-lg shadow-[#004526]/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগইন করুন</span>
              <span className="sm:hidden">লগইন</span>
            </button>
          ) : (
            <button
              id="nav-settings-circle-btn"
              onClick={() => handleTabChange('settings')}
              className={`flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full backdrop-blur-xl border transition-all cursor-pointer shadow-md hover:scale-105 group relative ${
                activeTab === 'settings'
                  ? 'bg-[#004526] border-[#004526] text-white shadow-lg shadow-[#004526]/30'
                  : 'bg-[#12141A]/85 border-white/15 text-stone-200 hover:text-white hover:bg-[#1A1D24] hover:border-white/30'
              }`}
              title={`প্রোফাইল ও সেটিংস (${authUser.email})`}
              aria-label="সেটিংস ও প্রোফাইল"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold uppercase border border-emerald-500/40">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profileDisplayName[0]?.toUpperCase()
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-bold font-body max-w-[90px] truncate hidden md:inline">
                {profileDisplayName}
              </span>
              <Settings className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300 text-stone-400 group-hover:text-white" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
