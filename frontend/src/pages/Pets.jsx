import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, MapPin, X, RotateCcw,
  AlertTriangle, Filter, ChevronDown, Check
} from 'lucide-react';
import { petService } from '../api/services';
import PetCard from '../components/PetCard';
import Pagination from '../components/Pagination';
import Skeleton from '../components/Skeleton';
import Breadcrumb from '../components/Breadcrumb';

const Pets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Read search parameters from URL
  const querySearch = searchParams.get('search') || '';
  const querySpecies = searchParams.get('species') || '';
  const queryStatus = searchParams.get('status') || 'AVAILABLE'; // default available
  const queryCity = searchParams.get('city') || '';
  const queryPage = parseInt(searchParams.get('page') || '0', 10);
  const querySize = parseInt(searchParams.get('size') || '8', 10);

  // Local Form state values initialized from URL
  const [searchVal, setSearchVal] = useState(querySearch);
  const [speciesVal, setSpeciesVal] = useState(querySpecies);
  const [statusVal, setStatusVal] = useState(queryStatus);
  const [cityVal, setCityVal] = useState(queryCity);

  // Sync inputs with URL changes
  useEffect(() => {
    setSearchVal(querySearch);
    setSpeciesVal(querySpecies);
    setStatusVal(queryStatus);
    setCityVal(queryCity);
  }, [querySearch, querySpecies, queryStatus, queryCity]);

  // Load Pets based on URL filters and poll every 4s in the background
  useEffect(() => {
    let active = true;
    const fetchPets = async (showSkeleton = false) => {
      if (showSkeleton) setLoading(true);
      try {
        const params = {
          page: queryPage,
          size: querySize,
          status: queryStatus,
        };
        if (querySpecies) params.species = querySpecies;
        if (queryCity) params.city = queryCity;
        if (querySearch) params.search = querySearch;

        const res = await petService.getPets(params);
        if (active && res.success && res.data) {
          setPets(res.data.content || []);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to load pets', err);
      } finally {
        if (showSkeleton && active) setLoading(false);
      }
    };

    fetchPets(true);

    const interval = setInterval(() => {
      fetchPets(false);
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [querySearch, querySpecies, queryStatus, queryCity, queryPage, querySize]);

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    
    const params = { page: '0', size: String(querySize) }; // reset to page 0 on filter apply
    if (searchVal) params.search = searchVal;
    if (speciesVal) params.species = speciesVal;
    if (statusVal) params.status = statusVal;
    if (cityVal) params.city = cityVal;
    
    setSearchParams(params);
    setShowMobileFilters(false);
  };

  const handleReset = () => {
    setSearchVal('');
    setSpeciesVal('');
    setStatusVal('AVAILABLE');
    setCityVal('');
    setSearchParams({ page: '0', size: String(querySize), status: 'AVAILABLE' });
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPage) => {
    const params = Object.fromEntries(searchParams.entries());
    params.page = String(newPage);
    setSearchParams(params);
  };

  const speciesOptions = [
    { label: 'Dogs', value: 'DOG' },
    { label: 'Cats', value: 'CAT' },
    { label: 'Birds', value: 'BIRD' },
    { label: 'Rabbits', value: 'RABBIT' },
    { label: 'Fish', value: 'FISH' },
    { label: 'Others', value: 'OTHER' },
  ];

  const statusOptions = [
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'Adoption Pending', value: 'PENDING' },
    { label: 'Adopted', value: 'ADOPTED' },
    { label: 'Unavailable', value: 'UNAVAILABLE' },
  ];

  const filterFormContent = (
    <form onSubmit={applyFilters} className="space-y-6">
      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Search Keywords</label>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Name, breed..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
          />
        </div>
      </div>

      {/* Species Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Species</label>
        <select
          value={speciesVal}
          onChange={(e) => setSpeciesVal(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-700 dark:text-slate-350 cursor-pointer"
        >
          <option value="">All Species</option>
          {speciesOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Status Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Adoption Status</label>
        <select
          value={statusVal}
          onChange={(e) => setStatusVal(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-700 dark:text-slate-350 cursor-pointer"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* City Location */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Location City</label>
        <div className="relative">
          <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={cityVal}
            onChange={(e) => setCityVal(e.target.value)}
            placeholder="e.g. Mumbai"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex flex-col gap-2">
        <button
          type="submit"
          className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-md shadow-primary/15 transition-all text-sm"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-sm flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={14} />
          Reset Filters
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb path */}
      <Breadcrumb items={[{ label: 'Browse Pets' }]} />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">Adoptable Pets</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">Browse verified listings of pets searching for a loving family.</p>
        </div>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-sm transition-all shadow-sm"
        >
          <SlidersHorizontal size={16} />
          Filters & Search
        </button>
      </div>

      {/* Primary Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm sticky top-28">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-base">
              <Filter size={16} className="text-primary" />
              Filter Options
            </h3>
          </div>
          {filterFormContent}
        </aside>

        {/* Pet listings grid area */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col min-h-[60vh]">
          {loading ? (
            <Skeleton type="card" count={6} />
          ) : pets.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[32px] shadow-sm flex-grow"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-3xl mb-4">
                🐾
              </div>
              <h3 className="text-xl font-display font-bold">No Pets Match Your Criteria</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2 font-medium">
                Try widening your search terms, changing the species category, or clearing filters.
              </p>
              <button
                onClick={handleReset}
                className="mt-6 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-md shadow-primary/10 transition-all text-sm flex items-center gap-1.5"
              >
                <RotateCcw size={16} />
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <>
              {/* Grid Wrapper */}
              <motion.div 
                layout 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {pets.map((pet) => (
                    <PetCard key={pet.id} pet={pet} />
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {/* Pagination controls */}
              <Pagination 
                currentPage={queryPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer Slide-out overlay */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex justify-end md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xs h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-2xl z-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-display font-bold text-lg">Filters & Sorting</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              {filterFormContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pets;
