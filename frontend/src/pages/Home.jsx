import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { 
  Search, MapPin, Sparkles, ArrowRight, PawPrint
} from 'lucide-react';
import { petService } from '../api/services';
import PetCard from '../components/PetCard';
import Loader from '../components/Loader';

const Home = () => {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSpecies, setSearchSpecies] = useState('');
  const [searchCity, setSearchCity] = useState('');

  // Mouse Parallax values for Hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), springConfig);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };


  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await petService.getPets({ status: 'AVAILABLE', page: 0, size: 6 });
        if (res.success && res.data?.content) {
          setPets(res.data.content);
        }
      } catch (err) {
        console.warn('Could not load featured pets.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/pets?search=${searchQuery}&species=${searchSpecies}&city=${searchCity}`);
  };

  const categories = [
    { label: 'Dogs', emoji: '🐕', value: 'DOG' },
    { label: 'Cats', emoji: '🐈', value: 'CAT' },
    { label: 'Birds', emoji: '🦜', value: 'BIRD' },
    { label: 'Rabbits', emoji: '🐇', value: 'RABBIT' },
    { label: 'Fish', emoji: '🐟', value: 'FISH' },
    { label: 'Others', emoji: '🐾', value: 'OTHER' },
  ];

  return (
    <div className="relative overflow-hidden w-full">
      {/* Background blobs for premium feel */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-blob-1 pointer-events-none" />
      <div className="absolute top-80 right-1/4 w-[450px] h-[450px] rounded-full bg-blob-2 pointer-events-none" />
      <div className="absolute top-[800px] left-10 w-[300px] h-[300px] rounded-full bg-blob-3 pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section 
        onMouseMove={handleMouseMove} 
        onMouseLeave={handleMouseLeave}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-24 pb-20 flex flex-col items-center justify-center text-center z-10"
      >
        <motion.div
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-semibold text-xs tracking-wider uppercase mb-6"
        >
          <Sparkles size={14} className="animate-spin-slow" />
          Reimagining Pet Adoption
        </motion.div>

        {/* Dynamic hero text */}
        <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight max-w-4xl leading-tight">
          Find Your New{' '}
          <span className="relative inline-block gradient-text">
            Best Friend
            <span className="absolute bottom-1.5 left-0 w-full h-[6px] rounded-full bg-primary/20 -z-10" />
          </span>{' '}
          Today.
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-655 dark:text-slate-400 max-w-2xl font-medium">
          Home4Pet matches happy families with shelter, NGO, and individual pets looking for a second chance. Fully verified profiles, secure process, and AI-powered care guides.
        </p>

        {/* Search Panel */}
        <motion.form 
          onSubmit={handleSearchSubmit}
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduce ? 0 : 0.1, duration: 0.3, ease: "easeOut" }}
          className="mt-12 w-full max-w-4xl p-3 glass-card rounded-[32px] shadow-2xl flex flex-col md:flex-row gap-2 border border-white/30"
        >
          <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/80">
            <Search className="text-slate-400 mr-3 shrink-0" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pet by name, breed..."
              className="bg-transparent w-full text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none text-sm font-medium"
            />
          </div>

          <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/80">
            <span className="text-slate-400 mr-3 text-lg font-bold">🐾</span>
            <select
              value={searchSpecies}
              onChange={(e) => setSearchSpecies(e.target.value)}
              className="bg-transparent w-full text-slate-600 dark:text-slate-300 focus:outline-none text-sm font-medium cursor-pointer"
            >
              <option value="" className="dark:bg-slate-900">All Species</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value} className="dark:bg-slate-900">{c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex items-center px-4 py-2">
            <MapPin className="text-slate-400 mr-3 shrink-0" size={18} />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="City, State (e.g. Mumbai)"
              className="bg-transparent w-full text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            className="md:px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
          >
            Find Pet
            <ArrowRight size={16} />
          </button>
        </motion.form>

        {/* Floating parallax illustration widget */}
        <motion.div 
          style={shouldReduce ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="mt-16 relative w-full max-w-4xl aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800 group"
        >
          <img 
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200" 
            alt="Pets playing" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/20 mix-blend-multiply" />
        </motion.div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold">Popular Categories</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Find your favorite species category instantly</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-10">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/pets?species=${cat.value}`}
              className="flex flex-col items-center justify-center p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
            >
              <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
              <span className="mt-4 font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors text-sm">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PETS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-10">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold">Meet Our Featured Friends</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">These adorable pets are available for adoption right now</p>
          </div>
          <Link 
            to="/pets" 
            className="hidden sm:inline-flex items-center gap-1.5 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-2xl text-slate-700 dark:text-slate-200 text-sm transition-all active:scale-[0.98]"
          >
            Browse All Pets
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : pets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pets.slice(0, 4).map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <PawPrint size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No pets listed yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold">How Adoption Works</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Simple 4-step path to bringing home your furry friend</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="absolute top-12 left-[12%] right-[12%] h-0.5 border-t border-dashed border-slate-200 dark:border-slate-800 hidden md:block -z-10" />

          {[
            { step: '01', title: 'Find Your Pet', desc: 'Browse verified profiles by species, location, breed, age, and owner description.', icon: '🔍' },
            { step: '02', title: 'Connect & Inquire', desc: 'Chat with owners directly or ask the AI assistant for tips. Submit request.', icon: '💬' },
            { step: '03', title: 'Meet & Greet', desc: 'Schedule physical meetups, complete verification, and pay adoption fees securely.', icon: '🤝' },
            { step: '04', title: 'Bring Them Home', desc: 'Seal the papers and officially welcome your new family member home!', icon: '🏡' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
              whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: shouldReduce ? 0 : idx * 0.06, duration: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center text-2xl font-bold font-display shadow-inner relative">
                {item.icon}
                <span className="absolute -top-2 -right-2 text-[10px] bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-1.5 py-0.5 rounded-full font-extrabold">{item.step}</span>
              </div>
              <h4 className="mt-6 font-display font-bold text-lg text-slate-800 dark:text-white">{item.title}</h4>
              <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
