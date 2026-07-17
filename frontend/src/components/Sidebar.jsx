import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  User, PawPrint, Landmark, CreditCard, ShieldAlert, KeyRound, 
  ChevronRight, Users, CheckSquare, BellRing
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isAdmin = false }) => {
  const { hasRole } = useAuth();

  const userLinks = [
    { to: '/profile', label: 'My Profile', icon: <User size={18} /> },
    { to: '/change-password', label: 'Change Password', icon: <KeyRound size={18} /> },
    { to: '/my-pets', label: 'Manage Listed Pets', icon: <PawPrint size={18} />, roles: ['OWNER', 'SHELTER', 'NGO', 'ADMIN'] },
    { to: '/adoptions', label: 'Adoption Requests', icon: <Landmark size={18} /> },
    { to: '/payments', label: 'Payments History', icon: <CreditCard size={18} /> },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: <ShieldAlert size={18} /> },
    { to: '/admin/users', label: 'Manage Users', icon: <Users size={18} /> },
    { to: '/admin/adoptions', label: 'Adoption Actions', icon: <CheckSquare size={18} /> },
    { to: '/admin/payments', label: 'Payment Ledgers', icon: <CreditCard size={18} /> },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const activeStyle = "bg-primary/10 text-primary border-r-4 border-primary font-bold dark:bg-primary/20 dark:text-primary-light";
  const inactiveStyle = "text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800/80 font-medium";

  return (
    <aside className="w-full md:w-64 shrink-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-4 shadow-sm h-fit">
      <div className="mb-6 px-3 py-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white uppercase tracking-wider text-xs">
          {isAdmin ? 'System Admin Tools' : 'Account Navigation'}
        </h3>
      </div>
      
      <nav className="flex flex-col space-y-1.5">
        {links.map((link) => {
          // Check role restrictions
          if (link.roles && !link.roles.some(r => hasRole(r))) {
            return null;
          }

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ active }) => `
                flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 
                ${active ? activeStyle : inactiveStyle}
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="shrink-0">{link.icon}</span>
                <span className="text-sm">{link.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-50" />
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
