import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex py-3 text-slate-500 dark:text-slate-400 text-sm font-medium" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center hover:text-primary transition-colors">
            <Home size={16} className="mr-2" />
            Home
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx}>
            <div className="flex items-center">
              <ChevronRight size={14} className="mx-1 text-slate-400" />
              {item.path ? (
                <Link to={item.path} className="hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.label}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
