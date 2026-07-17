import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCard = ({ 
  children, 
  className = '', 
  delay = 0,
  hoverEffect = true 
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // Custom cubic bezier for high-end feel
        delay: delay
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      whileHover={hoverEffect ? { 
        y: -6, 
        scale: 1.01,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      } : {}}
      className={`
        rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 
        p-6 shadow-md transition-all duration-300 ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
