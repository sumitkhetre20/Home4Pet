import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Heart, Mail } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Simulate subscription
    alert("Thank you for subscribing to our newsletter! 🐾");
    e.target.reset();
  };

  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-slate-950 transition-colors border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-primary text-white">
                <PawPrint size={22} className="transform -rotate-12" />
              </div>
              <span className="font-display font-extrabold text-xl text-white tracking-tight">
                Home<span className="text-primary font-black">4</span>Pet
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              We connect loving adopters with shelter, NGO, and individual pet owners to find forever homes for pets in need. Experience a premium, smooth, and heartwarming adoption journey.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-slate-800 hover:bg-primary hover:text-white transition-colors" aria-label="Facebook">
                <FaFacebookF size={16} />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-800 hover:bg-primary hover:text-white transition-colors" aria-label="Twitter">
                <FaTwitter size={16} />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-800 hover:bg-primary hover:text-white transition-colors" aria-label="Instagram">
                <FaInstagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-white text-base mb-6 tracking-wide uppercase text-sm">
              Discover
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link to="/pets" className="hover:text-primary transition-colors">Browse Pets</Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-primary transition-colors">AI Care Assistant</Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-primary transition-colors">Favorites List</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-white text-base mb-6 tracking-wide uppercase text-sm">
              Get in Touch
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center space-x-3 text-slate-400">
                <Mail size={18} className="text-primary shrink-0" />
                <span>support@home4pet.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="space-y-6">
            <h4 className="font-display font-bold text-white text-base tracking-wide uppercase text-sm">
              Stay Updated
            </h4>
            <p className="text-sm text-slate-400">
              Subscribe to receive updates on newly listed pets, adoption tips, and success stories.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-3">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 p-2 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all"
                  aria-label="Subscribe"
                >
                  <Mail size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="mt-16 pt-8 border-t border-slate-850 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-medium">
          <p>&copy; {currentYear} Home4Pet Inc. All rights reserved.</p>
          <p className="flex items-center mt-4 md:mt-0">
            Made with <Heart size={12} className="text-red-500 mx-1 fill-current animate-pulse" /> for pets everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
