import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false }) => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const bubbleVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Dog/Cat Paw SVG or elegant dots */}
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex space-x-2"
      >
        <motion.span variants={bubbleVariants} className="w-4 h-4 rounded-full bg-primary block" />
        <motion.span variants={bubbleVariants} className="w-4 h-4 rounded-full bg-secondary block" />
        <motion.span variants={bubbleVariants} className="w-4 h-4 rounded-full bg-accent block" />
      </motion.div>
      <motion.p 
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase font-display"
      >
        Loading Joy...
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
        <div className="p-8 rounded-3xl glass-card border border-white/10 shadow-2xl max-w-xs w-full flex justify-center">
          {spinner}
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

export default Loader;
