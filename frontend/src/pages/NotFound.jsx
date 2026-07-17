import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PawPrint, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-blob-3 pointer-events-none opacity-60" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-blob-2 pointer-events-none opacity-60" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-md relative z-10"
      >
        <div className="text-9xl font-display font-black text-slate-200 dark:text-slate-800 relative select-none">
          404
          <div className="absolute inset-0 flex items-center justify-center text-primary text-5xl">
            🐾
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-display font-extrabold">Whoops! You're Lost</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold max-w-xs mx-auto leading-relaxed">
            The page you are looking for has wandered off, or maybe it chased a squirrel. Let's get you back.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-sm active:scale-95"
        >
          <ArrowLeft size={16} />
          Back to Homepage
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
