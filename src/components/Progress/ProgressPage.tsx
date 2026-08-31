import React from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Award,
  Compass,
  MapPin,
  CheckCircle2,
  Bookmark,
  Camera,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DIVISIONS } from '../../data/divisions';

export const ProgressPage: React.FC = () => {
  const {
    stats,
    divisionStats,
    achievements,
    selectDistrict,
    setActiveTab,
  } = useApp();

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="border-b border-white/10 pb-6">
        <span className="font-body font-black text-[9px] uppercase tracking-[0.3em] text-[#F27D26]">
          Territory Statistics & Milestones
        </span>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white mt-1">
          EXPEDITION PROGRESS
        </h1>
        <p className="font-body text-xs sm:text-sm text-stone-400 font-light mt-1 max-w-xl">
          National coverage metrics, administrative division telemetry, and unlocked travel honors.
        </p>
      </div>

      {/* Main Exploration Scorecard */}
      <div className="bg-[#0e0e0e] border border-white/15 p-6 sm:p-10 text-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <span className="font-body font-black text-[9px] uppercase tracking-[0.25em] px-3 py-1 bg-[#F27D26] text-white">
              NATIONAL FOOTPRINT
            </span>
            <h2 className="font-display text-4xl sm:text-6xl uppercase tracking-tight mt-3">
              {stats.visitedCount} <span className="text-white/40">/ 64</span> DISTRICTS
            </h2>
            <p className="font-body text-xs sm:text-sm text-stone-300 mt-1 font-light">
              You have unlocked <strong className="font-bold text-[#F27D26]">{stats.percentageExplored}%</strong> of Bangladesh's sovereign landmass.
            </p>
          </div>

          <div className="flex items-center gap-8 sm:text-right">
            <div>
              <p className="font-display text-3xl sm:text-4xl text-amber-400">
                {stats.wantToVisitCount}
              </p>
              <p className="font-body font-black text-[9px] uppercase tracking-[0.2em] text-white/50">
                WISHLIST
              </p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl text-white/30">
                {stats.notVisitedCount}
              </p>
              <p className="font-body font-black text-[9px] uppercase tracking-[0.2em] text-white/50">
                UNEXPLORED
              </p>
            </div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentageExplored}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-[#F27D26]"
            />
          </div>
          <div className="flex items-center justify-between font-body font-black text-[9px] uppercase tracking-[0.2em] text-white/40">
            <span>0 DISTRICTS</span>
            <span>32 HALFWAY</span>
            <span>64 FULL SOVEREIGNTY</span>
          </div>
        </div>

        {/* Milestone highlights row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <div className="bg-white/5 p-4 border border-white/10">
            <p className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/50">
              MEMORIES
            </p>
            <p className="font-display text-2xl text-white mt-1">{stats.totalMemories}</p>
          </div>
          <div className="bg-white/5 p-4 border border-white/10">
            <p className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/50">
              PHOTOS SAVED
            </p>
            <p className="font-display text-2xl text-white mt-1">{stats.totalPhotos}</p>
          </div>
          <div className="bg-white/5 p-4 border border-white/10">
            <p className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/50">
              TRIPS LOGGED
            </p>
            <p className="font-display text-2xl text-white mt-1">{stats.totalTrips}</p>
          </div>
          <div className="bg-white/5 p-4 border border-white/10">
            <p className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-[#F27D26]">
              HONORS UNLOCKED
            </p>
            <p className="font-display text-2xl text-[#F27D26] mt-1">
              {unlockedCount} / {achievements.length}
            </p>
          </div>
        </div>
      </div>

      {/* Division Explorer Breakdown (8 Divisions) */}
      <div className="space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-white flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-[#F27D26]" />
            DIVISION COMPLETION (8 DIVISIONS)
          </h2>
          <p className="font-body text-xs text-stone-400 font-light mt-0.5">
            Territorial coverage broken down across administrative divisions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {divisionStats.map((div) => {
            const is100 = div.percentage === 100;
            return (
              <div
                key={div.division}
                className={`bg-[#0e0e0e] p-5 border transition-all ${
                  is100
                    ? 'border-[#F27D26] bg-[#1a120c]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg uppercase tracking-wide text-white">
                    {div.division}
                  </h3>
                  <span
                    className={`font-body font-black text-xs uppercase tracking-wider ${
                      is100 ? 'text-[#F27D26]' : 'text-white/50'
                    }`}
                  >
                    {div.visited}/{div.total}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-white/10 overflow-hidden mt-3">
                  <div
                    className={`h-full transition-all duration-500 ${
                      is100 ? 'bg-[#F27D26]' : 'bg-white'
                    }`}
                    style={{ width: `${div.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between font-body text-[10px] text-white/50 mt-2.5 uppercase tracking-wider">
                  <span>{div.percentage}% COMPLETE</span>
                  {is100 && (
                    <span className="font-black text-[#F27D26] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> FULL
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Travel Highlights & Fun Stats */}
      <div className="bg-[#0e0e0e] border border-white/10 p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-2xl uppercase tracking-wide text-white flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-[#F27D26]" />
          TELEMETRY & INSIGHTS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Most Explored Division */}
          {stats.mostExploredDivision && (
            <div className="bg-white/5 p-4 border border-white/10">
              <p className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/50">
                MOST EXPLORED DIVISION
              </p>
              <p className="font-display text-xl uppercase text-white mt-1">
                {stats.mostExploredDivision.division}
              </p>
              <p className="font-body text-[10px] text-[#F27D26] font-bold uppercase tracking-wider mt-1">
                {stats.mostExploredDivision.visited} OF {stats.mostExploredDivision.total} DISTRICTS LOGGED
              </p>
            </div>
          )}

          {/* First District Visited */}
          {stats.firstVisitedDistrict && (
            <div
              onClick={() => selectDistrict(stats.firstVisitedDistrict!.id)}
              className="bg-white/5 p-4 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <p className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/50">
                FIRST DISTRICT LOGGED
              </p>
              <p className="font-display text-xl uppercase text-white mt-1">
                {stats.firstVisitedDistrict.name}
              </p>
              <p className="font-body text-[10px] text-white/50 uppercase tracking-wider mt-1">
                {new Date(stats.firstVisitedDistrict.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* Most Recent District */}
          {stats.latestVisitedDistrict && (
            <div
              onClick={() => selectDistrict(stats.latestVisitedDistrict!.id)}
              className="bg-white/5 p-4 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <p className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/50">
                LATEST JOURNEY LOGGED
              </p>
              <p className="font-display text-xl uppercase text-white mt-1">
                {stats.latestVisitedDistrict.name}
              </p>
              <p className="font-body text-[10px] text-white/50 uppercase tracking-wider mt-1">
                {new Date(stats.latestVisitedDistrict.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Badges & Achievements Showcase */}
      <div className="space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h2 className="font-display text-2xl uppercase tracking-wide text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#F27D26]" />
            EXPEDITION HONORS & BADGES ({unlockedCount} / {achievements.length})
          </h2>
          <p className="font-body text-xs text-stone-400 font-light mt-0.5">
            Unlock badges as you traverse hills, coastal territories, historical spots, and highways
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = ach.isUnlocked;
            return (
              <div
                key={ach.id}
                className={`p-5 border transition-all flex items-start gap-4 ${
                  isUnlocked
                    ? 'bg-[#121212] border-[#F27D26]/50 shadow-md'
                    : 'bg-[#0a0a0a] border-white/10 opacity-50'
                }`}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked
                      ? 'bg-[#F27D26] text-white shadow-md'
                      : 'bg-white/10 text-white/40 grayscale'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base uppercase tracking-wide text-white truncate">
                      {ach.title}
                    </h3>
                    {isUnlocked && (
                      <span className="font-body font-black text-[9px] text-[#F27D26] uppercase tracking-[0.2em]">
                        UNLOCKED
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-stone-400 mt-1 font-light leading-snug">
                    {ach.description}
                  </p>

                  {/* Meter */}
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="h-1 flex-1 bg-white/10 overflow-hidden">
                      <div
                        className={`h-full ${
                          isUnlocked ? 'bg-[#F27D26]' : 'bg-white/40'
                        }`}
                        style={{
                          width: `${Math.min(
                            ((ach.currentValue || 0) / ach.targetValue) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="font-body font-bold text-[9px] text-white/50 uppercase tracking-wider">
                      {ach.currentValue}/{ach.targetValue}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
