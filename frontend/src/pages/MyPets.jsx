import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { petService } from '../api/services';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { Plus, Edit2, Trash2, Tag, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSync } from '../context/SyncContext';
import { getPetPlaceholder } from '../utils/placeholderHelper';
import { formatCurrency } from '../utils/formatHelper';

const MyPets = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { syncVersion, notifySync } = useSync();

  const fetchMyPets = async () => {
    try {
      const res = await petService.getMyPets(0, 100);
      if (res.success && res.data) {
        setPets(res.data.content || []);
      }
    } catch (err) {
      toast.error("Failed to load listed pets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPets();
    const interval = setInterval(fetchMyPets, 4000);
    return () => clearInterval(interval);
  }, [syncVersion]); // re-fetch on sync events and poll every 4s

  const handleDelete = async (petId, name) => {
    if (window.confirm(`Are you sure you want to permanently delete the listing for "${name}"?`)) {
      try {
        const res = await petService.deletePet(petId);
        if (res.success) {
          toast.success(`Successfully deleted "${name}" listing.`);
          setPets(prev => prev.filter(p => p.id !== petId));
          notifySync();
        }
      } catch (err) {
        toast.error("Failed to delete listing.");
      }
    }
  };

  const getImageUrl = (pet) => {
    if (!pet.images || pet.images.length === 0) {
      return getPetPlaceholder(pet.species);
    }
    const primary = pet.images.find(img => img.primaryImage) || pet.images[0];
    return primary.url.startsWith('http') ? primary.url : `http://localhost:8080/api/v1${primary.url}`;
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <Sidebar />

        {/* Content Box */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold">My Listed Pets</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">Manage pet listings, check statuses, and review details.</p>
            </div>
            <Link
              to="/pets/new"
              className="px-5 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-md shadow-primary/10 transition-all text-xs flex items-center gap-1.5 self-start"
            >
              <Plus size={16} />
              List New Pet
            </Link>
          </div>

          {pets.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-950 rounded-2xl py-16">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center text-2xl mb-4">
                🐾
              </div>
              <h3 className="text-lg font-display font-bold">No listed pets yet</h3>
              <p className="text-slate-550 dark:text-slate-450 text-xs max-w-sm mt-1 font-medium">
                You haven't listed any pets for adoption yet. Start connecting with adopters by listing a pet now.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-4 px-3">Pet</th>
                    <th className="py-4 px-3">Species/Breed</th>
                    <th className="py-4 px-3">Adoption Fee</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {pets.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="py-4 px-3 flex items-center gap-3">
                        <img 
                          src={getImageUrl(p)} 
                          alt={p.name} 
                          className="w-12 h-12 rounded-xl object-cover shadow-inner" 
                        />
                        <div>
                          <h4 className="font-bold text-slate-850 dark:text-white">{p.name}</h4>
                          <span className="text-[10px] text-slate-450">{p.city}, {p.state}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <p className="font-semibold">{p.species}</p>
                        <p className="text-xs text-slate-450">{p.breed || 'Unknown'}</p>
                      </td>
                      <td className="py-4 px-3 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.adoptionFee)}
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          p.status === 'AVAILABLE' ? 'bg-success/15 text-success' : 'bg-orange-500/15 text-orange-555'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/pets/${p.id}`}
                            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-350 rounded-xl transition-colors"
                            title="Preview Public View"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={() => navigate(`/pets/${p.id}/edit`)}
                            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-primary/5 hover:text-primary dark:hover:bg-slate-800 text-slate-500 dark:text-slate-350 rounded-xl transition-colors"
                            title="Edit Listing"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-550 rounded-xl transition-colors"
                            title="Delete Listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyPets;
