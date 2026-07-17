import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary', // primary, secondary, accent, outline, text
  disabled = false,
  className = '',
  icon
}) => {
  const [ripples, setRipples] = useState([]);

  const createRipple = (event) => {
    if (disabled) return;
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
      size,
    };
    
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(event);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary/50';
      case 'accent':
        return 'bg-accent text-white hover:bg-accent-dark focus:ring-accent/50';
      case 'outline':
        return 'border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-300';
      case 'text':
        return 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light focus:ring-transparent px-2 py-1';
      case 'gradient':
        return 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/30';
      case 'primary':
      default:
        return 'bg-primary text-white hover:bg-primary-dark focus:ring-primary/50';
    }
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={createRipple}
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`
        relative overflow-hidden inline-flex items-center justify-center px-6 py-3 
        rounded-2xl font-semibold transition-colors duration-200 focus:outline-none 
        focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantStyles()} ${className}
      `}
    >
      {/* Ripple elements */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            width: ripple.size,
            height: ripple.size,
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
      
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
};

export default AnimatedButton;
