import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, MapPin, Tag, ShieldCheck, Mail, Calendar, User, 
  MessageSquare, Star, ArrowLeft, Send, Sparkles, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { petService, reviewService, adoptionService, favoriteService } from '../api/services';
import AnimatedModal from '../components/AnimatedModal';
import Loader from '../components/Loader';
import Breadcrumb from '../components/Breadcrumb';
import toast from 'react-hot-toast';
import { useSync } from '../context/SyncContext';
import { getPetPlaceholder } from '../utils/placeholderHelper';
import { formatAge, formatCurrency } from '../utils/formatHelper';

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { syncVersion, notifySync } = useSync();
  
  const [pet, setPet] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Adoption Request Modal
  const [adoptionModalOpen, setAdoptionModalOpen] = useState(false);
  const [adoptionMessage, setAdoptionMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Favorite states
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  const loadDetails = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const petRes = await petService.getPetById(id);
      if (petRes.success && petRes.data) {
        setPet(petRes.data);
        
        // Load favorites status
        if (isAuthenticated) {
          const favRes = await favoriteService.checkFavorite(id);
          if (favRes && typeof favRes.data === 'boolean') {
            setIsFavorite(favRes.data);
          }
        }

        // Load reviews
        const reviewRes = await reviewService.getPetReviews(id);
        if (reviewRes.success && reviewRes.data) {
          setReviews(reviewRes.data.content || []);
        }

        // Load recommendations (similar species)
        const recRes = await petService.getPets({ species: petRes.data.species, status: 'AVAILABLE', size: 3 });
        if (recRes.success && recRes.data && recRes.data.content) {
          setRecommendations(recRes.data.content.filter(p => p.id !== petRes.data.id));
        }
      } else {
        toast.error("Pet not found.");
        navigate('/pets');
      }
    } catch (err) {
      console.error("Error loading pet details", err);
      toast.error("Failed to load pet details.");
      navigate('/pets');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [id, isAuthenticated, navigate]);

  // Sync on mount/event; poll silently every 5s
  useEffect(() => {
    loadDetails(true);
  }, [loadDetails, syncVersion]);

  useEffect(() => {
    const interval = setInterval(() => loadDetails(false), 5000);
    return () => clearInterval(interval);
  }, [loadDetails]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save favorites.");
      return;
    }
    if (loadingFav) return;
    setLoadingFav(true);

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(id);
        setIsFavorite(false);
        toast.success("Removed from favorites.");
        notifySync();
      } else {
        await favoriteService.addFavorite(id);
        setIsFavorite(true);
        toast.success("Saved to favorites! 💖");
        notifySync();
      }
    } catch (err) {
      toast.error("Failed to update favorite status.");
    } finally {
      setLoadingFav(false);
    }
  };

  const handleAdoptionSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to submit adoption applications.");
      return;
    }
    setSubmittingRequest(true);

    try {
      const res = await adoptionService.createRequest({
        petId: id,
        message: adoptionMessage
      });
      if (res.success) {
        toast.success("Adoption request submitted successfully! The owner will review it.");
        setAdoptionModalOpen(false);
        setAdoptionMessage('');
        notifySync();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit adoption request.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to write a review.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Review comment cannot be empty.");
      return;
    }
    setSubmittingReview(true);

    try {
      const res = await reviewService.createReview({
        petId: id,
        rating,
        comment
      });
      if (res.success) {
        toast.success("Review posted successfully!");
        setComment('');
        notifySync();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await reviewService.deleteReview(reviewId);
        toast.success("Review deleted.");
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        notifySync();
      } catch (err) {
        toast.error("Failed to delete review.");
      }
    }
  };

  const getImageUrl = (image) => {
    if (!image?.url) return '';
    return image.url.startsWith('http') ? image.url : `http://localhost:8080/api/v1${image.url}`;
  };

  if (loading) return <Loader fullScreen />;
  if (!pet) return null;

  const imagesList = pet.images && pet.images.length > 0 ? pet.images : [];

  const isOwner = user && user.id === pet.ownerId;
  const isAdoptable = pet.status === 'AVAILABLE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation crumbs */}
      <Breadcrumb items={[
        { label: 'Browse Pets', path: '/pets' },
        { label: pet.name }
      ]} />

      {/* Back button link */}
      <button 
        onClick={() => navigate(-1)}
        className="mt-2 mb-6 inline-flex items-center gap-2 text-slate-500 hover:text-primary dark:text-slate-400 font-bold transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to browse
      </button>

      {/* Main Grid Details container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Images, description, owner bio, reviews */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Gallery Slider Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-sm overflow-hidden space-y-4">
            <div className="relative aspect-[16/10] bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              {imagesList.length > 0 ? (
                <img 
                  src={getImageUrl(imagesList[activeImage])} 
                  alt={pet.name} 
                  className="object-cover w-full h-full transition-all duration-500" 
                />
              ) : (
                <img 
                  src={getPetPlaceholder(pet.species)} 
                  alt={pet.name} 
                  className="object-cover w-full h-full transition-all duration-500" 
                />
              )}
              <button
                onClick={handleFavoriteToggle}
                className={`absolute top-4 right-4 p-3.5 rounded-full border shadow-md backdrop-blur-md transition-all duration-300 ${
                  isFavorite 
                    ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                    : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-800/80 text-slate-655 hover:text-red-500'
                }`}
              >
                <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {imagesList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-1">
                {imagesList.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${
                      idx === activeImage ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt={`${pet.name} gallery ${idx}`} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bio Description Details Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-extrabold">{pet.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm flex items-center gap-1 mt-1">
                  <span>{pet.breed || pet.species}</span>
                  <span>•</span>
                  <span>{pet.city ? `${pet.city}, ${pet.state || ''}` : 'Unknown Location'}</span>
                </p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                pet.status === 'AVAILABLE' ? 'bg-success/15 text-success' : 'bg-orange-500/15 text-orange-555'
              }`}>
                {pet.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Species', val: pet.species, icon: '🐾' },
                { label: 'Gender', val: pet.gender, icon: pet.gender === 'MALE' ? '♂️' : '♀️' },
                { label: 'Age', val: formatAge(pet.age, pet.ageUnit), icon: '⏳' },
                { label: 'Adoption Fee', val: formatCurrency(pet.adoptionFee), icon: '💵' }
              ].map((spec, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-center flex flex-col items-center">
                  <span className="text-2xl mb-1">{spec.icon}</span>
                  <span className="text-slate-450 text-[10px] uppercase font-bold tracking-wider">{spec.label}</span>
                  <span className="font-bold text-slate-800 dark:text-white mt-1 text-sm">{spec.val}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-display font-bold text-lg">About {pet.name}</h3>
              <p className="text-slate-655 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line font-medium">
                {pet.description || 'No detailed description provided.'}
              </p>
            </div>
          </div>

          {/* Owner Bio Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-lg shadow-inner shrink-0 uppercase">
              {pet.ownerName?.charAt(0) || 'S'}
            </div>
            <div className="text-center sm:text-left flex-grow space-y-1">
              <p className="text-xs uppercase font-bold text-slate-400">Pet Listed By</p>
              <h4 className="font-display font-bold text-lg">{pet.ownerName || 'Shelter Owner'}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Home4Pet host. Connects directly to assist the adoption flow.</p>
            </div>
            {isAuthenticated && !isOwner && (
              <Link
                to="/chat"
                className="px-5 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-105 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all active:scale-95"
              >
                Inquire via Chat
              </Link>
            )}
          </div>

          {/* Reviews List & Add Review Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
            <h3 className="font-display font-bold text-xl flex items-center gap-2">
              <MessageSquare className="text-primary" size={20} />
              Adopter Reviews ({reviews.length})
            </h3>

            {/* List Reviews */}
            {reviews.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm italic">No reviews submitted yet. Be the first to write a review about {pet.name}!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const isReviewOwner = user && user.id === rev.userId; // assuming userId or name matches
                  return (
                    <div key={rev.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850/80 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs uppercase text-slate-600 dark:text-slate-300">
                            {rev.userName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-850 dark:text-white">{rev.userName || 'Anonymous'}</h5>
                            <span className="text-[10px] text-slate-400">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < rev.rating ? 'text-amber-400 fill-current' : 'text-slate-300'} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-medium">
                        {rev.comment}
                      </p>
                      {(isReviewOwner || (user && user.roles?.includes('ADMIN'))) && (
                        <button
                          onClick={() => handleReviewDelete(rev.id)}
                          className="absolute right-4 bottom-4 text-xs font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Create Review Form */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="font-display font-bold text-base">Write a Review</h4>
                
                {/* Rating selection */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-amber-400 focus:outline-none hover:scale-110 transition-transform"
                      >
                        <Star size={20} className={star <= rating ? 'fill-current' : 'text-slate-300'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder={`Tell others about your experience or queries regarding ${pet.name}...`}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white placeholder-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-primary/10 text-xs transition-all flex items-center gap-1.5"
                >
                  <Send size={12} />
                  {submittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                <p className="text-xs text-slate-500 font-medium">Please <Link to="/login" className="text-primary font-bold hover:underline">Log In</Link> to write a review.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Sticky Adoption Checkout Panel */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-450 text-xs uppercase font-bold tracking-wider">Adoption Cost</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white font-display">
                {formatCurrency(pet.adoptionFee)}
              </span>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-450">
              <div className="flex justify-between">
                <span className="text-slate-400">Breed Type</span>
                <span className="text-slate-850 dark:text-white font-bold">{pet.breed || pet.species}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Availability</span>
                <span className="text-slate-850 dark:text-white font-bold uppercase">{pet.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">City Listing</span>
                <span className="text-slate-850 dark:text-white font-bold">{pet.city || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">State / Region</span>
                <span className="text-slate-850 dark:text-white font-bold">{pet.state || 'N/A'}</span>
              </div>
            </div>

            {/* Check role & availability for CTAs */}
            <div className="pt-2">
              {isOwner ? (
                <button
                  onClick={() => navigate(`/pets/${id}/edit`)}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-950 text-white rounded-2xl font-bold shadow-md transition-all text-sm"
                >
                  Edit Pet Listing
                </button>
              ) : isAdoptable ? (
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      setAdoptionModalOpen(true);
                    } else {
                      toast.error("Please login to apply for adoption!");
                      navigate('/login');
                    }
                  }}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Adopt {pet.name}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-4 bg-amber-500/10 text-orange-555 rounded-2xl border border-amber-500/20 text-xs font-bold uppercase tracking-wider text-center">
                  <AlertTriangle size={16} />
                  Adoption Status: {pet.status}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
              <ShieldCheck className="text-primary shrink-0" size={20} />
              <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                Verified Listings. Your adoption process is fully managed under secure verification.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Recommended Pets Carousel list */}
      {recommendations.length > 0 && (
        <section className="mt-16 pt-12 border-t border-slate-200/50 dark:border-slate-800">
          <h3 className="font-display font-extrabold text-2xl mb-8">Other Pets You Might Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map(p => (
              <div key={p.id} className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm relative group flex flex-col justify-between">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <img 
                    src={p.images && p.images.length > 0 ? getImageUrl(p.images[0]) : getPetPlaceholder(p.species)} 
                    alt={p.name} 
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-lg">{p.name}</h4>
                    <p className="text-xs text-slate-400">{p.breed || p.species}</p>
                  </div>
                  <Link to={`/pets/${p.id}`} className="text-xs font-bold text-primary hover:underline">View</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Adoption Request Dialog overlay */}
      <AnimatedModal
        isOpen={adoptionModalOpen}
        onClose={() => setAdoptionModalOpen(false)}
        title={`Apply to Adopt ${pet.name}`}
      >
        <form onSubmit={handleAdoptionSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Introduce yourself to the pet owner! Write a short message about why you want to adopt {pet.name}, your home environment, and your background in pet care.
          </p>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Personal message (optional)</label>
            <textarea
              rows={6}
              value={adoptionMessage}
              onChange={(e) => setAdoptionMessage(e.target.value)}
              placeholder={`Hi, I would love to adopt ${pet.name}. I have a large garden and a friendly environment...`}
              className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white placeholder-slate-400"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setAdoptionModalOpen(false)}
              className="px-5 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-450 rounded-xl font-bold hover:bg-slate-50 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRequest}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md shadow-primary/10 text-xs transition-all"
            >
              {submittingRequest ? 'Submitting Application...' : 'Send Adoption Application'}
            </button>
          </div>
        </form>
      </AnimatedModal>
    </div>
  );
};

export default PetDetails;
