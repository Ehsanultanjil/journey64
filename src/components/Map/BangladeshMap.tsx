import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  Layers,
  MapPin,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ChevronRight,
  Eye,
  Camera,
  X,
} from 'lucide-react';
import { DISTRICTS, getDistrictById } from '../../data/districts';
import { DIVISIONS } from '../../data/divisions';
import { useApp } from '../../context/AppContext';
import { District, DistrictDivision, DistrictStatus } from '../../types';

interface TooltipState {
  district: District;
  x: number;
  y: number;
}

export const BangladeshMap: React.FC = () => {
  const {
    userData,
    visits,
    settings,
    selectedDistrict,
    selectDistrict,
    setDistrictStatus,
    openDistrictJournal,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hoveredDistrict, setHoveredDistrict] = useState<TooltipState | null>(null);

  // SVG Pan & Zoom state
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Map viewport dimensions
  const viewBoxWidth = 800;
  const viewBoxHeight = 1000;

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    return DISTRICTS.filter((d) => {
      // Division filter
      if (divisionFilter !== 'all' && d.division !== divisionFilter) {
        return false;
      }
      // Status filter
      const userStatus = userData[d.id]?.status || 'not_visited';
      if (statusFilter !== 'all' && userStatus !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = d.name.toLowerCase().includes(q);
        const matchBn = d.bn_name.includes(q);
        const matchDiv = d.division.toLowerCase().includes(q);
        const matchSpots = d.famousSpots?.some((s) => s.toLowerCase().includes(q));
        return matchName || matchBn || matchDiv || matchSpots;
      }
      return true;
    });
  }, [divisionFilter, statusFilter, searchQuery, userData]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return DISTRICTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.bn_name.includes(q) ||
        d.division.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  // Handle Zoom controls
  const handleZoomIn = () => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.35, 4.5),
    }));
  };

  const handleZoomOut = () => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.35, 0.9),
      x: prev.scale <= 1.2 ? 0 : prev.x,
      y: prev.scale <= 1.2 ? 0 : prev.y,
    }));
  };

  const handleResetZoom = () => {
    setTransform({ scale: 1, x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredDistrict(null);
  };


  // Touch pan handlers for mobile pinch & drag
  const touchStartRef = useRef<{ x: number; y: number; dist: number }>({ x: 0, y: 0, dist: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      touchStartRef.current = {
        x: e.touches[0].clientX - transform.x,
        y: e.touches[0].clientY - transform.y,
        dist: 0,
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - transform.x,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - transform.y,
        dist,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setTransform((prev) => ({
        ...prev,
        x: e.touches[0].clientX - touchStartRef.current.x,
        y: e.touches[0].clientY - touchStartRef.current.y,
      }));
    } else if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleFactor = dist / touchStartRef.current.dist;
      setTransform((prev) => ({
        ...prev,
        scale: Math.min(Math.max(prev.scale * scaleFactor, 0.9), 4.5),
      }));
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartRef.current.dist = 0;
  };

  // Helper to determine district fill color
  const getDistrictFill = (district: District, isSelected: boolean) => {
    const userStatus = userData[district.id]?.status || 'not_visited';

    if (settings.divisionHighlightMode) {
      const divMeta = DIVISIONS.find((d) => d.name === district.division);
      const baseColor = divMeta?.color || '#F27D26';
      if (userStatus === 'visited') return baseColor;
      if (userStatus === 'want_to_visit') return '#F59E0B';
      return '#222222';
    }

    if (userStatus === 'visited') {
      return isSelected ? '#ff8c37' : '#F27D26'; // Bold Electric Burnt Orange
    }
    if (userStatus === 'want_to_visit') {
      return isSelected ? '#FBBF24' : '#F59E0B'; // Amber Gold
    }
    return isSelected ? '#383838' : '#1e1e1e'; // Sleek dark slate
  };

  const getDistrictStroke = (district: District, isSelected: boolean) => {
    if (isSelected) return '#FFFFFF'; // High contrast white outline for active district
    const userStatus = userData[district.id]?.status || 'not_visited';
    if (userStatus === 'visited') return '#ff9d54';
    if (userStatus === 'want_to_visit') return '#FBBF24';
    return '#333333';
  };

  // Get photo count for district
  const getDistrictMemoryCount = (districtId: string) => {
    const districtVisits = visits.filter((v) => v.districtId === districtId);
    return districtVisits.reduce((acc, v) => acc + (v.photos?.length || 0), 0);
  };

  const getDistrictCoverUrl = (districtId: string) => {
    const districtVisits = visits.filter((v) => v.districtId === districtId);
    for (const v of districtVisits) {
      const cover = v.photos?.find((p) => p.isCover) || v.photos?.[0];
      if (cover) return cover.url;
    }
    return null;
  };

  return (
    <div id="map-container" className="relative w-full flex flex-col bg-[#0a0a0a] border border-white/15 overflow-hidden shadow-2xl">
      {/* Top Map Controls Bar */}
      <div className="p-2.5 sm:p-4 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-[#050505]/90 backdrop-blur-md z-10">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="জেলা খুঁজুন... (যেমন: ঢাকা, কক্সবাজার)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs font-body font-semibold tracking-wide bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Search Dropdown */}
          <AnimatePresence>
            {searchResults.length > 0 && searchQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 right-0 top-full mt-1.5 bg-[#111111] border border-white/20 py-1.5 z-50 overflow-hidden shadow-2xl"
              >
                {searchResults.map((d) => {
                  const status = userData[d.id]?.status || 'not_visited';
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        selectDistrict(d.id);
                        setSearchQuery('');
                      }}
                      className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-white/10 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 shrink-0 ${
                            status === 'visited'
                              ? 'bg-[#F27D26]'
                              : status === 'want_to_visit'
                              ? 'bg-amber-400'
                              : 'bg-white/30'
                          }`}
                        />
                        <div>
                          <p className="font-body text-base font-bold text-white group-hover:text-[#F27D26]">
                            {d.bn_name}{' '}
                            <span className="text-xs font-normal text-white/40">
                              ({d.name})
                            </span>
                          </p>
                          <p className="font-body text-[10px] uppercase tracking-wider text-white/50">
                            {d.division} বিভাগ
                          </p>
                        </div>
                      </div>
                      <span className="font-body text-xs font-bold text-[#F27D26]">
                        নির্বাচন করুন →
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Division & Status Filters (Side by side on mobile) */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          {/* Division Selector */}
          <div className="relative">
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="w-full sm:w-auto text-xs font-body font-semibold bg-white/5 border border-white/15 px-2.5 py-2 text-white focus:outline-none focus:border-[#F27D26] cursor-pointer truncate"
            >
              <option value="all" className="bg-[#111] text-white">সকল বিভাগ (৮টি)</option>
              {DIVISIONS.map((div) => (
                <option key={div.name} value={div.name} className="bg-[#111] text-white">
                  {div.bn_name} বিভাগ ({div.districtsCount})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto text-xs font-body font-semibold bg-white/5 border border-white/15 px-2.5 py-2 text-white focus:outline-none focus:border-[#F27D26] cursor-pointer truncate"
            >
              <option value="all" className="bg-[#111] text-white">সকল স্থিতি (৬৪)</option>
              <option value="visited" className="bg-[#111] text-[#F27D26]">ঘুরেছি</option>
              <option value="want_to_visit" className="bg-[#111] text-amber-400">যেতে চাই</option>
              <option value="not_visited" className="bg-[#111] text-stone-400">বাকি আছে</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main SVG Vector Canvas */}
      <div
        ref={svgContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full h-[380px] sm:h-[540px] md:h-[680px] lg:h-[760px] select-none cursor-${
          isDragging ? 'grabbing' : 'grab'
        } overflow-hidden flex items-center justify-center bg-[#060606]`}
      >
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full max-h-full transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            <filter id="district-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </filter>
            <filter id="active-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#F27D26" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Country Boundary Background Glow */}
          <g id="bangladesh-districts-group">
            {DISTRICTS.map((district) => {
              const isSelected = selectedDistrict?.id === district.id;
              const fillColor = getDistrictFill(district, isSelected);
              const strokeColor = getDistrictStroke(district, isSelected);
              const isMatch = filteredDistricts.some((d) => d.id === district.id);

              return (
                <path
                  key={district.id}
                  id={`district-${district.id}`}
                  d={district.path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3.5 : 1}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="bd-district-path"
                  style={{
                    opacity: isMatch ? 1 : 0.2,
                    filter: isSelected ? 'url(#active-glow)' : undefined,
                  }}
                  onMouseEnter={(e) => {
                    const rect = svgContainerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setHoveredDistrict({
                        district,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseMove={(e) => {
                    const rect = svgContainerRef.current?.getBoundingClientRect();
                    if (rect && hoveredDistrict?.district.id === district.id) {
                      setHoveredDistrict({
                        district,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectDistrict(district.id);
                  }}
                />
              );
            })}
          </g>

          {/* District Center Markers & Labels in Bangla */}
          {settings.showDistrictLabels && (
            <g id="district-labels-group" className="pointer-events-none">
              {DISTRICTS.map((district) => {
                const isSelected = selectedDistrict?.id === district.id;
                const userStatus = userData[district.id]?.status || 'not_visited';
                const isMatch = filteredDistricts.some((d) => d.id === district.id);

                if (!isMatch && !isSelected) return null;

                const isImportantOrSelected =
                  isSelected ||
                  userStatus === 'visited' ||
                  transform.scale > 1.2 ||
                  ['dhaka', 'chattogram', 'sylhet', 'cox-s-bazar', 'khulna', 'rajshahi', 'barishal', 'rangpur'].includes(district.id);

                if (!isImportantOrSelected) return null;

                return (
                  <g key={`label-${district.id}`} transform={`translate(${district.center[0]}, ${district.center[1]})`}>
                    {userStatus === 'visited' && (
                      <circle
                        r={isSelected ? 4 : 2.5}
                        fill="#FFFFFF"
                        stroke="#F27D26"
                        strokeWidth={1.5}
                      />
                    )}
                    <text
                      y={userStatus === 'visited' ? -6 : 4}
                      textAnchor="middle"
                      className={`font-body font-bold tracking-tight transition-all duration-150 ${
                        isSelected
                          ? 'fill-white font-black drop-shadow-md'
                          : userStatus === 'visited'
                          ? 'fill-[#F27D26]'
                          : 'fill-white/80'
                      }`}
                      style={{
                        fontSize: isSelected ? '13px' : transform.scale > 2 ? '12px' : '9.5px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)',
                      }}
                    >
                      {district.bn_name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Floating Zoom & Action Controls */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1 bg-[#050505]/95 border border-white/20 p-1 z-20 shadow-2xl">
          <button
            id="map-zoom-in-btn"
            onClick={handleZoomIn}
            aria-label="জুম ইন"
            className="p-2.5 text-white hover:bg-[#F27D26] hover:text-white transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            id="map-zoom-out-btn"
            onClick={handleZoomOut}
            aria-label="জুম আউট"
            className="p-2.5 text-white hover:bg-[#F27D26] hover:text-white transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            id="map-reset-zoom-btn"
            onClick={handleResetZoom}
            aria-label="রিসেট জুম"
            className="p-2.5 text-white hover:bg-[#F27D26] hover:text-white transition-colors border-t border-white/10 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Hover Tooltip in Bangla */}
        <AnimatePresence>
          {hoveredDistrict && !selectedDistrict && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.12 }}
              className="absolute pointer-events-none bg-[#050505] text-white p-4 border border-white/30 max-w-xs z-30 shadow-2xl"
              style={{
                left: Math.min(Math.max(hoveredDistrict.x + 15, 12), (svgContainerRef.current?.clientWidth || 300) - 240),
                top: Math.min(Math.max(hoveredDistrict.y - 45, 12), (svgContainerRef.current?.clientHeight || 400) - 120),
              }}
            >
              <div className="flex items-start gap-3">
                {getDistrictCoverUrl(hoveredDistrict.district.id) && (
                  <img
                    src={getDistrictCoverUrl(hoveredDistrict.district.id)!}
                    alt={hoveredDistrict.district.name}
                    className="w-12 h-12 object-cover shrink-0 border border-white/20"
                  />
                )}
                <div>
                  <span className="font-body font-bold text-[9px] uppercase tracking-wider text-[#F27D26] block">
                    {hoveredDistrict.district.division} বিভাগ
                  </span>
                  <h4 className="font-display text-2xl font-bold leading-tight text-white mt-0.5">
                    {hoveredDistrict.district.bn_name}
                  </h4>
                  <p className="font-body text-xs text-white/50 mt-0.5">
                    {hoveredDistrict.district.name}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`font-body text-[10px] font-bold px-2 py-0.5 inline-block ${
                        userData[hoveredDistrict.district.id]?.status === 'visited'
                          ? 'bg-[#F27D26] text-white'
                          : userData[hoveredDistrict.district.id]?.status === 'want_to_visit'
                          ? 'bg-amber-400 text-black'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {userData[hoveredDistrict.district.id]?.status === 'visited'
                        ? 'ঘুরেছি'
                        : userData[hoveredDistrict.district.id]?.status === 'want_to_visit'
                        ? 'যেতে চাই'
                        : 'বাকি আছে'}
                    </span>
                    {getDistrictMemoryCount(hoveredDistrict.district.id) > 0 && (
                      <span className="font-body text-xs font-bold text-white/70 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-[#F27D26]" />
                        {getDistrictMemoryCount(hoveredDistrict.district.id)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Legend Bar in Bangla */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-t border-white/10 bg-[#050505] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#F27D26] shrink-0" />
            <span className="font-body text-[11px] sm:text-xs font-semibold text-white">
              ভ্রমণ সম্পন্ন ({DISTRICTS.filter((d) => userData[d.id]?.status === 'visited').length})
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-400 shrink-0" />
            <span className="font-body text-[11px] sm:text-xs font-semibold text-white/80">
              ইচ্ছাতালিকা ({DISTRICTS.filter((d) => userData[d.id]?.status === 'want_to_visit').length})
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/20 shrink-0" />
            <span className="font-body text-[11px] sm:text-xs font-semibold text-white/50">
              বাকি আছে ({64 - DISTRICTS.filter((d) => userData[d.id]?.status === 'visited' || userData[d.id]?.status === 'want_to_visit').length})
            </span>
          </div>
        </div>

        <div className="font-body font-bold text-[11px] sm:text-xs text-[#F27D26]">
          ৬৪ জেলা সম্পূর্ণ করতে আর {64 - DISTRICTS.filter((d) => userData[d.id]?.status === 'visited').length}টি জেলা বাকি
        </div>
      </div>
    </div>
  );
};
