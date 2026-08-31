import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  User,
  Download,
  Upload,
  RefreshCcw,
  Trash2,
  Moon,
  Sun,
  Laptop,
  Check,
  AlertTriangle,
  Sparkles,
  MapPin,
  ShieldCheck,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../lib/storage';

export const SettingsPage: React.FC = () => {
  const {
    profile,
    settings,
    updateProfile,
    updateSettings,
    resetToCleanSlate,
    loadDemoMode,
    importJsonBackup,
    setActiveTab,
  } = useApp();

  const [userNameDraft, setUserNameDraft] = useState(profile.name);
  const [userBioDraft, setUserBioDraft] = useState(profile.bio);
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmDemoOpen, setConfirmDemoOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: userNameDraft.trim(),
      bio: userBioDraft.trim(),
    });
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2500);
  };

  const handleExportBackup = () => {
    StorageService.exportBackupFile();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importJsonBackup(content);
        if (res.success) {
          setImportStatus('Backup restored successfully!');
          setTimeout(() => {
            setImportStatus(null);
            setActiveTab('explore');
          }, 1800);
        } else {
          setImportStatus(`Import failed: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Title */}
      <div className="border-b border-white/10 pb-6">
        <span className="font-body font-black text-[9px] uppercase tracking-[0.3em] text-[#F27D26]">
          System & Storage Configuration
        </span>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white mt-1">
          SETTINGS & DATA VAULT
        </h1>
        <p className="font-body text-xs sm:text-sm text-stone-400 font-light mt-1 max-w-xl">
          Traveler identity, cartographic rendering preferences, JSON export, and offline local cache management.
        </p>
      </div>

      {/* Traveler Profile Section */}
      <div className="bg-[#0e0e0e] border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="border-b border-white/10 pb-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-white flex items-center gap-2.5">
            <User className="w-6 h-6 text-[#F27D26]" />
            TRAVELER DOSSIER
          </h2>
          <p className="font-body text-xs text-stone-400 font-light mt-0.5">
            Personal credentials and journal author metadata
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div>
            <label className="block font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/60 mb-2">
              TRAVELER IDENTIFIER / NAME
            </label>
            <input
              type="text"
              value={userNameDraft}
              onChange={(e) => setUserNameDraft(e.target.value)}
              placeholder="e.g. Tahmid Chowdhury"
              className="w-full px-4 py-3 text-sm bg-black border border-white/15 focus:border-[#F27D26] outline-none text-white font-body"
            />
          </div>

          <div>
            <label className="block font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/60 mb-2">
              TRAVEL MOTTO / EXPEDITION LOGLINE
            </label>
            <input
              type="text"
              value={userBioDraft}
              onChange={(e) => setUserBioDraft(e.target.value)}
              placeholder="e.g. Exploring all 64 districts with a backpack and a camera."
              className="w-full px-4 py-3 text-sm bg-black border border-white/15 focus:border-[#F27D26] outline-none text-white font-body"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileSavedToast && (
              <span className="font-body font-bold text-xs text-[#F27D26] uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-4 h-4" /> PROFILE DOSSIER SAVED
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-[#F27D26] hover:bg-[#d96c1e] text-white font-body font-black text-xs uppercase tracking-[0.2em] transition-colors ml-auto cursor-pointer"
            >
              SAVE DOSSIER
            </button>
          </div>
        </form>
      </div>

      {/* Map & App Display Options */}
      <div className="bg-[#0e0e0e] border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="border-b border-white/10 pb-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-white flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-[#F27D26]" />
            MAP & CARTOGRAPHY PREFERENCES
          </h2>
          <p className="font-body text-xs text-stone-400 font-light mt-0.5">
            Customize topographic rendering and script typography
          </p>
        </div>

        <div className="space-y-4">
          {/* Theme Selector */}
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
            <div>
              <p className="font-display text-base uppercase text-white tracking-wide">
                COLOR APPEARANCE
              </p>
              <p className="font-body text-xs text-stone-400 font-light mt-0.5">
                Choose high-contrast dark, light, or follow system environment
              </p>
            </div>
            <div className="flex items-center gap-1 bg-black p-1 border border-white/15">
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`p-2 font-body text-xs font-bold transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-[#F27D26] text-white'
                    : 'text-white/40 hover:text-white'
                }`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`p-2 font-body text-xs font-bold transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-[#F27D26] text-white'
                    : 'text-white/40 hover:text-white'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateSettings({ theme: 'system' })}
                className={`p-2 font-body text-xs font-bold transition-colors ${
                  settings.theme === 'system'
                    ? 'bg-[#F27D26] text-white'
                    : 'text-white/40 hover:text-white'
                }`}
                title="System Auto"
              >
                <Laptop className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Show Bengali Names toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
            <div>
              <p className="font-display text-base uppercase text-white tracking-wide">
                SHOW BENGALI (বাংলা) SCRIPT
              </p>
              <p className="font-body text-xs text-stone-400 font-light mt-0.5">
                Display authentic Bengali district nomenclature (কক্সবাজার, সিলেট, ইত্যাদি)
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.showBengaliNames}
              onChange={(e) => updateSettings({ showBengaliNames: e.target.checked })}
              className="w-5 h-5 accent-[#F27D26] cursor-pointer"
            />
          </div>

          {/* Show District Center Labels */}
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
            <div>
              <p className="font-display text-base uppercase text-white tracking-wide">
                DISTRICT CENTROID LABELS
              </p>
              <p className="font-body text-xs text-stone-400 font-light mt-0.5">
                Render typography markers on district territorial centers
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.showDistrictLabels}
              onChange={(e) => updateSettings({ showDistrictLabels: e.target.checked })}
              className="w-5 h-5 accent-[#F27D26] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Backup, Export & Restore Section */}
      <div className="bg-[#0e0e0e] border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wide text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#F27D26]" />
              DATA VAULT & PORTABILITY
            </h2>
            <p className="font-body text-xs text-stone-400 font-light mt-0.5">
              Export and restore your travel journals with zero cloud dependency
            </p>
          </div>
          <span className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-[#F27D26] px-3 py-1 bg-white/5 border border-[#F27D26]/30 self-start sm:self-auto">
            100% PRIVATE OFFLINE STORAGE
          </span>
        </div>

        <p className="font-body text-xs text-stone-400 font-light leading-relaxed">
          Your travel journal, photo memories, and trip records are stored safely in browser-persistent Indexed/Local storage. You can download a complete backup file to keep forever or transfer to another device.
        </p>

        {importStatus && (
          <div className="p-4 bg-[#F27D26]/20 border border-[#F27D26] text-white font-body font-bold text-xs uppercase tracking-wider">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExportBackup}
            className="p-5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#F27D26] text-left transition-all group flex items-start gap-4 cursor-pointer"
          >
            <Download className="w-6 h-6 text-[#F27D26] shrink-0 mt-0.5 group-hover:translate-y-0.5 transition-transform" />
            <div>
              <h4 className="font-display text-lg uppercase tracking-wide text-white">
                EXPORT JSON BACKUP
              </h4>
              <p className="font-body text-xs text-stone-400 font-light mt-1">
                Download your full travel journal, photos & records as a portable JSON vault
              </p>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#F27D26] text-left transition-all group flex items-start gap-4 cursor-pointer"
          >
            <Upload className="w-6 h-6 text-[#F27D26] shrink-0 mt-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div>
              <h4 className="font-display text-lg uppercase tracking-wide text-white">
                RESTORE / IMPORT BACKUP
              </h4>
              <p className="font-body text-xs text-stone-400 font-light mt-1">
                Upload a previously saved .json travel journal vault
              </p>
            </div>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Demo Mode & Reset Buttons */}
        <div className="pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setConfirmDemoOpen(true)}
            className="px-5 py-2.5 text-xs font-body font-black uppercase tracking-[0.2em] text-[#F27D26] hover:text-white hover:bg-[#F27D26] border border-[#F27D26] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            LOAD SAMPLE EXPEDITION (17/64)
          </button>

          <button
            onClick={() => setConfirmResetOpen(true)}
            className="px-5 py-2.5 text-xs font-body font-black uppercase tracking-[0.2em] text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-500/40 hover:border-rose-600 flex items-center gap-2 transition-colors ml-auto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            RESET TO CLEAN SLATE (0/64)
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0e0e0e] border border-white/20 p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="font-display text-2xl uppercase tracking-wide text-white">
                RESET ALL JOURNAL DATA?
              </h3>
            </div>
            <p className="font-body text-xs text-stone-300 font-light leading-relaxed">
              This will clear all 64 districts, visits, memories, and trips so you can record your own real travels from 0/64. (You can also export a backup first).
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2.5 text-xs font-body font-black uppercase tracking-wider text-stone-400 hover:text-white cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  resetToCleanSlate();
                  setConfirmResetOpen(false);
                  setActiveTab('explore');
                }}
                className="px-5 py-2.5 text-xs font-body font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                YES, RESET TO 0
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Demo Load Confirmation Modal */}
      {confirmDemoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0e0e0e] border border-white/20 p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center gap-3 text-[#F27D26]">
              <Sparkles className="w-7 h-7 shrink-0" />
              <h3 className="font-display text-2xl uppercase tracking-wide text-white">
                LOAD SAMPLE TRAVEL JOURNAL?
              </h3>
            </div>
            <p className="font-body text-xs text-stone-300 font-light leading-relaxed">
              This will populate 17 iconic districts (Cox's Bazar, Bandarban, Sylhet, Sreemangal, Dhaka, Sundarbans, etc.) with rich photos, personal memories, and road trips.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setConfirmDemoOpen(false)}
                className="px-4 py-2.5 text-xs font-body font-black uppercase tracking-wider text-stone-400 hover:text-white cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  loadDemoMode();
                  setConfirmDemoOpen(false);
                  setActiveTab('explore');
                }}
                className="px-5 py-2.5 text-xs font-body font-black uppercase tracking-wider bg-[#F27D26] hover:bg-[#d96c1e] text-white cursor-pointer"
              >
                LOAD SAMPLE DATA
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
