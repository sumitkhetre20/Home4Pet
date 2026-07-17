import React, { useState, useEffect } from 'react';
import { favoriteService } from '../api/services';
import PetCard from '../components/PetCard';
import Loader from '../components/Loader';
import { Heart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await favoriteService.getFavorites(0, 50); // Fetch first 50 favorites
      if (res.success && res.data) {
        setPets(res.data.content || []);
      }
    } catch (err) {
      console.error("Failed to load favorites", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteChange = (petId, isFav) => {
    // If removed, filter out of local list immediately
    if (!isFav) {
      setPets(prev => prev.filter(p => p.id !== petId));
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[70vh]">
      <div className="pb-6 mb-8 border-b border-slate-200/50 dark:border-slate-800">
        <h1 className="text-3xl md:text-4xl font-display font-extrabold flex items-center gap-2">
          <Heart className="text-red-500 fill-current" size={28} />
          My Favorite Pets
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">Keep track of the pets you love and monitor their adoption availability.</p>
      </div>

      {pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[32px] shadow-sm py-20 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-3xl mb-4">
            💖
          </div>
          <h3 className="text-xl font-display font-bold">Your Favorites List is Empty</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2 font-medium">
            Explore adoptable pets and tap the heart icon on any pet card to save them here.
          </p>
          <Link
            to="/pets"
            className="mt-6 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-md shadow-primary/10 transition-all text-sm flex items-center gap-1.5"
          >
            <Search size={16} />
            Find Pets to Adopt
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <PetCard 
              key={pet.id} 
              pet={pet} 
              onFavoriteChange={handleFavoriteChange} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
