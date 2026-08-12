import React from 'react';
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StoreHubLogo } from '../StoreHubLogo';
import {
  LayoutDashboard,
  Users,
  Store,
  Star,
  History,
  Heart,
  Compass,
  LogOut,
  X,
  Building2,
  UserCheck,
  User as UserIcon,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/stores', label: 'Store Management', icon: Store },
    { to: '/admin/ratings', label: 'Platform Ratings', icon: Star },
    { to: '/admin/activity', label: 'Activity Audit Log', icon: History },
  ];

  const userLinks = [
    { to: '/user/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/user/stores', label: 'Explore Stores', icon: Compass },
    { to: '/user/favorites', label: 'My Favorites', icon: Heart },
    { to: '/user/ratings', label: 'Rating History', icon: History },
    { to: '/user/profile', label: 'My Profile', icon: UserIcon },
  ];

  const ownerLinks = [
    { to: '/owner/dashboard', label: 'Store Dashboard', icon: LayoutDashboard },
    { to: '/owner/store', label: 'Store Profile', icon: Building2 },
    { to: '/owner/customers', label: 'Customer Reviews', icon: UserCheck },
  ];

  let links = userLinks;
  if (user.role === 'ADMIN') links = adminLinks;
  if (user.role === 'STORE_OWNER') links = ownerLinks;

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-warm-900 border-r border-surface-border dark:border-slate-800 w-64 p-4">
      {/* Sidebar Brand Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-surface-border dark:border-slate-800">
        <Link to="/" className="flex items-center gap-2.5 group">
          <StoreHubLogo size="sm" />
          <div className="flex items-baseline font-black text-lg tracking-tight">
            <span className="text-warm-900 dark:text-white">Store</span>
            <span className="text-brand-500">Hub</span>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-surface-muted hover:bg-warm-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6 px-3 py-3 rounded-2xl bg-warm-100 dark:bg-slate-800/80 border border-surface-border dark:border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm shrink-0">
          {user.name.charAt(0)}
        </div>
        <div className="flex flex-col truncate">
          <span className="text-xs font-bold text-warm-900 dark:text-white truncate">
            {user.name}
          </span>
          <span className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            {user.role}
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 shadow-sm'
                    : 'text-surface-muted dark:text-slate-400 hover:bg-warm-100 dark:hover:bg-slate-800/80 hover:text-warm-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-4 mt-auto border-t border-surface-border dark:border-slate-800">
        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-accent-coral hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30">
        {content}
      </aside>

      {/* Mobile Overlay Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-warm-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 max-w-xs w-full animate-in slide-in-from-left duration-300">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
