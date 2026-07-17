import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Pagination = ({ 
  currentPage = 0, 
  totalPages = 1, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const startPage = Math.max(0, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-8 py-4">
      {/* Prev button */}
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Start dots check */}
      {startPage > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            className={`w-11 h-11 rounded-full font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
              currentPage === 0 ? 'bg-primary text-white hover:bg-primary-dark shadow-md' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            1
          </button>
          {startPage > 1 && <span className="text-slate-400 px-1 font-bold">...</span>}
        </>
      )}

      {/* Pages list */}
      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <motion.button
            key={p}
            onClick={() => onPageChange(p)}
            whileHover={{ scale: isActive ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-11 h-11 rounded-full font-semibold transition-all duration-250 flex items-center justify-center
              ${isActive 
                ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }
            `}
          >
            {p + 1}
          </motion.button>
        );
      })}

      {/* End dots check */}
      {endPage < totalPages - 1 && (
        <>
          {endPage < totalPages - 2 && <span className="text-slate-400 px-1 font-bold">...</span>}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            className={`w-11 h-11 rounded-full font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
              currentPage === totalPages - 1 ? 'bg-primary text-white hover:bg-primary-dark shadow-md' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next button */}
      <button
        disabled={currentPage === totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
