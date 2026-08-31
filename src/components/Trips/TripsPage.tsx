import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Car,
  Plus,
  Calendar,
  MapPin,
  Camera,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DISTRICTS, getDistrictById } from '../../data/districts';
import { DIVISIONS } from '../../data/divisions';
import { Trip } from '../../types';

export const TripsPage: React.FC = () => {
  const {
    trips,
    visits,
    createTrip,
    updateTrip,
    deleteTrip,
    activeTripId,
    openTripDetail,
    openDistrictJournal,
    openLightbox,
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<string[]>([]);
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [districtSearch, setDistrictSearch] = useState('');

  // Active Trip detail view
  const currentTrip = trips.find((t) => t.id === activeTripId);

  // Helper to toggle district selection
  const handleToggleDistrict = (id: string) => {
    if (selectedDistrictIds.includes(id)) {
      setSelectedDistrictIds(selectedDistrictIds.filter((dId) => dId !== id));
    } else {
      setSelectedDistrictIds([...selectedDistrictIds, id]);
    }
  };

  const handleCreateTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName.trim()) {
      alert('Please enter a trip name.');
      return;
    }
    if (selectedDistrictIds.length === 0) {
      alert('Please select at least one district for this trip.');
      return;
    }

    createTrip({
      name: newTripName.trim(),
      startDate: newStartDate,
      endDate: newEndDate,
      notes: newNotes.trim(),
      districtIds: selectedDistrictIds,
    });

    // Reset & close
    setNewTripName('');
    setNewNotes('');
    setSelectedDistrictIds([]);
    setIsCreateModalOpen(false);
  };

  // If in Trip Detail View
  if (currentTrip) {
    const tripDistricts = currentTrip.districtIds
      .map((id) => getDistrictById(id))
      .filter(Boolean);

    // Aggregate photos from visits matching this trip or districts
    const tripPhotos = visits
      .filter((v) => v.tripId === currentTrip.id || currentTrip.districtIds.includes(v.districtId))
      .flatMap((v) => v.photos || []);

    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-200">
        <button
          onClick={() => openTripDetail(null)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-body font-black uppercase tracking-[0.2em] bg-white/5 border border-white/15 text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO ALL TRIPS
        </button>

        {/* Trip Banner Header */}
        <div className="bg-[#0e0e0e] border border-white/15 p-6 sm:p-10 text-white relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 font-body font-black text-[9px] uppercase tracking-[0.25em] bg-[#F27D26] text-white">
              EXPEDITION ROUTE
            </span>
            <span className="px-3 py-1 font-body font-black text-[9px] uppercase tracking-[0.25em] bg-white/10 text-white border border-white/10">
              {tripDistricts.length} DISTRICTS CONNECTED
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight text-white">{currentTrip.name}</h1>

          <div className="flex items-center gap-3 font-body text-xs text-white/60 mt-3 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-[#F27D26]" />
            <span>
              {new Date(currentTrip.startDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}{' '}
              –{' '}
              {new Date(currentTrip.endDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          {currentTrip.notes && (
            <p className="mt-4 text-sm font-light text-stone-300 italic leading-relaxed max-w-2xl border-l-2 border-[#F27D26] pl-3 py-1">
              "{currentTrip.notes}"
            </p>
          )}

          <div className="absolute top-6 right-6">
            <button
              onClick={() => {
                if (confirm('Delete this road trip? Your district memories will remain safe.')) {
                  deleteTrip(currentTrip.id);
                  openTripDetail(null);
                }
              }}
              className="p-2.5 bg-black/60 hover:bg-[#F27D26] text-white transition-colors cursor-pointer border border-white/10"
              title="Delete Trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sequential Route Visualization */}
        <div className="bg-[#0e0e0e] border border-white/10 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="font-display text-2xl uppercase tracking-wide text-white flex items-center gap-3">
              <Compass className="w-6 h-6 text-[#F27D26]" />
              JOURNEY WAYPOINTS
            </h2>
            <span className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-white/40">
              SEQUENTIAL CORRIDOR
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {tripDistricts.map((d, index) => {
              if (!d) return null;
              return (
                <React.Fragment key={d.id}>
                  <div
                    onClick={() => openDistrictJournal(d.id)}
                    className="group bg-white/5 hover:bg-[#F27D26] p-4 border border-white/10 hover:border-[#F27D26] transition-all cursor-pointer flex items-center gap-3 text-white"
                  >
                    <div className="w-7 h-7 bg-white text-black group-hover:bg-black group-hover:text-white font-body font-black text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-display text-lg uppercase tracking-wide">
                        {d.name}
                      </h4>
                      <p className="font-body font-bold text-[9px] uppercase tracking-[0.2em] text-white/50 group-hover:text-white/80">
                        {d.division} DIVISION
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-transform ml-2" />
                  </div>

                  {index < tripDistricts.length - 1 && (
                    <span className="text-[#F27D26] font-display text-2xl hidden sm:inline">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Aggregated Photos from Trip */}
        {tripPhotos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl uppercase tracking-wide text-white flex items-center gap-2.5">
                <Camera className="w-6 h-6 text-[#F27D26]" />
                TRIP ARCHIVE ({tripPhotos.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {tripPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => openLightbox(tripPhotos, index, currentTrip.name)}
                  className="aspect-square overflow-hidden bg-[#161616] border border-white/10 cursor-pointer group relative"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Trip photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {photo.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="font-body text-[10px] text-white line-clamp-2 italic">
                        "{photo.caption}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Trips List View
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <span className="font-body font-black text-[9px] uppercase tracking-[0.3em] text-[#F27D26]">
            Expeditions & Itineraries
          </span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white mt-1">
            ROAD TRIPS
          </h1>
          <p className="font-body text-xs sm:text-sm text-stone-400 font-light mt-1 max-w-xl">
            Bundle adjacent districts into curated cross-country adventures.
          </p>
        </div>

        <button
          id="new-trip-btn"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-white text-black hover:bg-[#F27D26] hover:text-white font-body font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          CREATE TRIP
        </button>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-white/10 p-10 sm:p-14 text-center space-y-5 max-w-lg mx-auto mt-8">
          <div className="w-16 h-16 bg-white text-black flex items-center justify-center mx-auto">
            <Car className="w-8 h-8 stroke-[2.5]" />
          </div>
          <span className="font-body font-black text-[10px] uppercase tracking-[0.3em] text-[#F27D26] block">
            NO EXPEDITIONS LOGGED
          </span>
          <h3 className="font-display text-2xl uppercase tracking-wide text-white">
            CONNECT YOUR DISTRICT JOURNEYS
          </h3>
          <p className="font-body text-xs sm:text-sm text-stone-400 leading-relaxed font-light">
            Going on a multi-stop road trip across several districts (e.g. Cox's Bazar & Bandarban, or Sylhet & Sreemangal)? Group them into a journey!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3.5 bg-white text-black hover:bg-[#F27D26] hover:text-white font-body font-black text-xs uppercase tracking-[0.2em] inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            CREATE YOUR FIRST TRIP
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => {
            const tripDistricts = trip.districtIds
              .map((id) => getDistrictById(id))
              .filter(Boolean);

            const tripPhotos = visits
              .filter((v) => v.tripId === trip.id || trip.districtIds.includes(v.districtId))
              .flatMap((v) => v.photos || []);

            const coverPhoto = tripPhotos.find((p) => p.isCover)?.url || tripPhotos[0]?.url;

            return (
              <motion.div
                key={trip.id}
                whileHover={{ y: -3 }}
                onClick={() => openTripDetail(trip.id)}
                className="group bg-[#0e0e0e] border border-white/10 hover:border-white/25 transition-all cursor-pointer flex flex-col"
              >
                {/* Cover Image or Header */}
                <div className="relative h-44 w-full bg-[#181818] overflow-hidden border-b border-white/10">
                  {coverPhoto ? (
                    <img
                      src={coverPhoto}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1c120c] to-[#080808] flex items-center justify-center">
                      <Car className="w-14 h-14 text-[#F27D26]/30" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <span className="font-body font-black text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 bg-[#F27D26] text-white">
                      {tripDistricts.length} DISTRICTS CONNECTED
                    </span>
                    <h3 className="font-display text-2xl uppercase tracking-wide mt-1.5">{trip.name}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-2 font-body text-[10px] text-white/60 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-[#F27D26]" />
                    <span>
                      {new Date(trip.startDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      –{' '}
                      {new Date(trip.endDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Route tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tripDistricts.map((d) => (
                      <span
                        key={d?.id}
                        className="font-body text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white/5 text-stone-300 border border-white/10"
                      >
                        {d?.name}
                      </span>
                    ))}
                  </div>

                  {trip.notes && (
                    <p className="font-body text-xs text-stone-400 font-light italic line-clamp-2">
                      "{trip.notes}"
                    </p>
                  )}

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between font-body font-black text-[10px] uppercase tracking-[0.2em] text-[#F27D26]">
                    <span>VIEW ROAD TRIP ROUTE</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create New Trip Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e0e0e] border border-white/20 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="font-body font-black text-[9px] uppercase tracking-[0.25em] text-[#F27D26] block">
                    NEW EXPEDITION
                  </span>
                  <h3 className="font-display text-2xl uppercase tracking-wide text-white">
                    LOG ADVENTURE TRIP
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 bg-white/5 hover:bg-[#F27D26] text-white transition-colors"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              <form onSubmit={handleCreateTripSubmit} className="space-y-5">
                <div>
                  <label className="block font-body font-black text-[10px] uppercase tracking-[0.2em] text-white/70 mb-2">
                    TRIP TITLE
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. CHITTAGONG HILL TRACTS EXPEDITION"
                    value={newTripName}
                    onChange={(e) => setNewTripName(e.target.value)}
                    className="w-full px-4 py-3 text-xs font-body font-bold uppercase tracking-wider bg-white/5 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[#F27D26]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body font-black text-[10px] uppercase tracking-[0.2em] text-white/70 mb-2">
                      START DATE
                    </label>
                    <input
                      type="date"
                      required
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-body font-bold bg-white/5 border border-white/15 text-white focus:outline-none focus:border-[#F27D26]"
                    />
                  </div>
                  <div>
                    <label className="block font-body font-black text-[10px] uppercase tracking-[0.2em] text-white/70 mb-2">
                      END DATE
                    </label>
                    <input
                      type="date"
                      required
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-body font-bold bg-white/5 border border-white/15 text-white focus:outline-none focus:border-[#F27D26]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-body font-black text-[10px] uppercase tracking-[0.2em] text-white/70 mb-2">
                    EXPEDITION NOTES / SUMMARY
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Route highlights, highway checkpoints, travel partners..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs font-body bg-white/5 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[#F27D26]"
                  />
                </div>

                {/* District Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-body font-black text-[10px] uppercase tracking-[0.2em] text-white/70">
                      SELECT DISTRICTS ({selectedDistrictIds.length} SELECTED)
                    </label>
                  </div>

                  <div className="max-h-48 overflow-y-auto p-2 bg-white/5 border border-white/10 grid grid-cols-2 gap-1.5">
                    {DISTRICTS.map((d) => {
                      const isSelected = selectedDistrictIds.includes(d.id);
                      return (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => handleToggleDistrict(d.id)}
                          className={`p-2.5 text-left font-body text-[10px] font-bold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#F27D26] text-white'
                              : 'bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{d.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-3 font-body font-black text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 font-body font-black text-xs uppercase tracking-[0.2em] bg-white text-black hover:bg-[#F27D26] hover:text-white transition-colors cursor-pointer shadow-md"
                  >
                    CONFIRM TRIP
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
