import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupabaseDB } from '../../lib/supabase/db';
import { PublicUserSummary } from '../../types';

export const UserSearchModal: React.FC = () => {
  const { isSearchModalOpen, closeSearchModal, openPublicProfile, profile: currentProfile, authUser } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus on open & clear state
  useEffect(() => {
    if (isSearchModalOpen) {
      setQuery('');
      setResults([]);
      setHasSearched(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isSearchModalOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchModalOpen) {
        closeSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, closeSearchModal]);

  // Debounced search
  useEffect(() => {
    const clean = query.trim().replace(/^@+/, '');
    if (!clean) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const searchResults = await SupabaseDB.searchUsers(clean);
      setResults(searchResults);
      setIsLoading(false);
      setHasSearched(true);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectUser = (user: PublicUserSummary) => {
    closeSearchModal();
    openPublicProfile(user);
  };

  if (!isSearchModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-24 px-3 sm:px-4 bg-black/80 backdrop-blur-md font-body">
        {/* Click outside backdrop */}
        <div className="absolute inset-0" onClick={closeSearchModal} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-[#12141A] border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
        >
          {/* Search Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs font-semibold">
                @
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ইউজারনেম লিখুন..."
                className="w-full pl-7 pr-8 py-2 bg-white/5 border border-white/15 rounded-xl text-white text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:border-emerald-500/80 transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={closeSearchModal}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Content Body */}
          <div className="overflow-y-auto p-3 sm:p-4 space-y-1.5 flex-1 no-scrollbar">
            {isLoading && (
              <div className="flex items-center justify-center py-8 gap-2.5 text-stone-400 text-xs">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>খোঁজা হচ্ছে...</span>
              </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && (
              <div className="text-center py-8 px-4 text-xs text-stone-400">
                "@{query.replace(/^@+/, '')}" নামে কাউকে পাওয়া যায়নি
              </div>
            )}

            {!isLoading && !hasSearched && !query && (
              <div className="py-10 text-center text-stone-500 text-xs font-light">
                ইউজারনেম দিয়ে অনুসন্ধান করুন
              </div>
            )}

            {/* Results list */}
            {!isLoading && results.length > 0 && (
              <div className="space-y-1.5">
                {results.map((user) => {
                  const isLocked = user.isLocked;
                  const displayName = user.displayName || user.name || 'ভ্রমণকারী';
                  const handleName = user.handle || user.displayName?.toLowerCase().replace(/\s+/g, '') || user.name?.toLowerCase().replace(/\s+/g, '') || user.id.slice(0, 8);
                  const isSelf = (authUser && user.id === authUser.id) || (currentProfile.handle && user.handle === currentProfile.handle);

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="group p-2.5 sm:p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#004526] to-[#002e18] text-white flex items-center justify-center font-bold text-sm">
                              {displayName[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                              {displayName}
                            </p>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                আপনি
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 truncate">
                            @{handleName}
                          </p>
                        </div>
                      </div>

                      {/* Status: Lock icon only if locked */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isLocked && (
                          <Lock className="w-3.5 h-3.5 text-stone-400" />
                        )}

                        <div className="w-6 h-6 rounded-lg bg-white/5 group-hover:bg-[#004526] text-stone-400 group-hover:text-white flex items-center justify-center transition-all">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
