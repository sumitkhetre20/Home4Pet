import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Heart, MapPin, Tag, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { favoriteService } from '../api/services';
import toast from 'react-hot-toast';
import { useSync } from '../context/SyncContext';
import { getPetPlaceholder } from '../utils/placeholderHelper';
import { formatAge, formatCurrency } from '../utils/formatHelper';

const PetCard = ({ pet, onFavoriteChange }) => {
  const { isAuthenticated } = useAuth();
  const { notifySync } = useSync();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const shouldReduce = useReducedMotion();

  // Check if this pet is favorited by the logged in user
  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      if (isAuthenticated && pet?.id) {
        try {
          const res = await favoriteService.checkFavorite(pet.id);
          // Assuming api returns { success: true, data: boolean }
          if (active && res && typeof res.data === 'boolean') {
            setIsFavorite(res.data);
          }
        } catch (err) {
          console.warn("Could not check favorite status for pet ID:", pet.id);
        }
      }
    };
    checkStatus();
    return () => { active = false; };
  }, [isAuthenticated, pet?.id]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to save favorites!');
      return;
    }

    if (loadingFav) return;
    setLoadingFav(true);

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(pet.id);
        setIsFavorite(false);
        toast.success(`${pet.name} removed from favorites.`);
        notifySync();
      } else {
        await favoriteService.addFavorite(pet.id);
        setIsFavorite(true);
        setIsBursting(true);
        setTimeout(() => setIsBursting(false), 500);
        toast.success(`${pet.name} added to favorites! 💖`);
        notifySync();
      }
      
      if (onFavoriteChange) {
        onFavoriteChange(pet.id, !isFavorite);
      }
    } catch (err) {
      toast.error('Failed to update favorite status.');
    } finally {
      setLoadingFav(false);
    }
  };

  const getImageUrl = () => {
    if (!pet?.images || pet.images.length === 0) {
      return getPetPlaceholder(pet?.species);
    }
    const primaryImg = pet.images.find(img => img.primaryImage) || pet.images[0];
    const url = primaryImg.url;
    return url.startsWith('http') ? url : `http://localhost:8080/api/v1${url}`;
  };

  const getSpeciesEmoji = (species) => {
    switch (species?.toUpperCase()) {
      case 'DOG': return '🐕';
      case 'CAT': return '🐈';
      case 'BIRD': return '🦜';
      case 'RABBIT': return '🐇';
      case 'FISH': return '🐟';
      default: return '🐾';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE': return 'bg-success text-white';
      case 'PENDING': return 'bg-accent text-white';
      case 'ADOPTED': return 'bg-blue-600 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <motion.div
      layout={shouldReduce ? false : "position"}
      whileHover={shouldReduce ? {} : { y: -4, scale: 1.015 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl hover:border-slate-200/80 dark:hover:border-slate-700 transition-all duration-200"
    >
      {/* Image Gallery Wrapper */}
      <div className="relative aspect-[4/5] overflow-hidden w-full bg-slate-100 dark:bg-slate-950">
        <img
          src={getImageUrl()}
          alt={pet.name}
          loading="lazy"
          className="object-cover w-full h-full transform group-hover:scale-[1.02] transition-transform duration-500 ease-out"
        />

        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-955/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`
            absolute top-4 right-4 z-10 p-3 rounded-full backdrop-blur-md shadow-md border transition-all duration-350
            ${isFavorite 
              ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' 
              : 'bg-white/70 dark:bg-slate-900/70 border-white/20 dark:border-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white hover:text-red-500'
            }
          `}
        >
          <Heart 
            size={18} 
            className={`transition-transform duration-250 ${isFavorite ? 'fill-current' : ''} ${isBursting ? 'animate-heart-burst' : ''}`} 
          />
        </button>

        {/* Status Badge */}
        <span className={`absolute top-4 left-4 z-10 px-3 py-1 text-xs font-bold tracking-wider rounded-full shadow-sm uppercase ${getStatusColor(pet.status)}`}>
          {pet.status}
        </span>

        {/* Breed and Fee Overlay details */}
        <div className="absolute bottom-4 left-4 right-4 text-white z-10 flex flex-col">
          <span className="text-xs uppercase tracking-wider text-white/80 font-medium flex items-center gap-1">
            <span>{getSpeciesEmoji(pet.species)}</span>
            <span>{pet.breed || pet.species}</span>
          </span>
          <h4 className="text-2xl font-bold font-display mt-1 drop-shadow-sm flex items-center justify-between">
            {pet.name}
            <span className="text-lg font-semibold bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-xl border border-white/10 flex items-center">
              {formatCurrency(pet.adoptionFee)}
            </span>
          </h4>
        </div>
      </div>

      {/* Info Card Body */}
      <div className="p-5 flex flex-col flex-grow bg-white dark:bg-slate-900 justify-between">
        <div className="space-y-2">
          {/* Location and Age details */}
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span className="flex items-center gap-1 max-w-[65%] truncate">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{pet.city ? `${pet.city}, ${pet.state || ''}` : 'Unknown Location'}</span>
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-650 dark:text-slate-350">
              {formatAge(pet.age, pet.ageUnit)} • {pet.gender?.toLowerCase()}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
            {pet.description || 'No description provided.'}
          </p>
        </div>

        {/* View Details link */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Listed by: <span className="font-semibold text-slate-600 dark:text-slate-350">{pet.ownerName || 'Shelter'}</span>
          </span>
          <Link 
            to={`/pets/${pet.id}`}
            className="flex items-center text-xs font-bold text-primary dark:text-primary-light hover:underline gap-0.5 group/btn"
          >
            Meet Me
            <ChevronRight size={14} className="transform group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PetCard;
