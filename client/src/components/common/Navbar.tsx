import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { Store as StoreType } from '../../types';
import { StoreHubLogo } from '../StoreHubLogo';
import {
  Sun,
  Moon,
  Monitor,
  LogOut,
  Menu,
  X,
  Search,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Interactive Navbar Live Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StoreType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search against real backend API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/stores?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.data.success) {
          setSearchResults(res.data.data.stores);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'STORE_OWNER') return '/owner/dashboard';
    return '/user/dashboard';
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/user/stores', label: 'Explore Stores' },
    { to: '/categories', label: 'Categories' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/about', label: 'About Us' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-warm-950/90 backdrop-blur-md border-b border-surface-border dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle + StoreHub Logo */}
        <div className="flex items-center gap-3">
          {user && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-warm-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <StoreHubLogo size="sm" />
            <div className="flex items-baseline font-black text-xl tracking-tight">
              <span className="text-warm-900 dark:text-white">Store</span>
              <span className="text-brand-500">Hub</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50'
                      : 'text-surface-muted dark:text-slate-300 hover:text-warm-900 dark:hover:text-white hover:bg-warm-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center/Right: Interactive Live Search Bar */}
        <div className="flex-1 max-w-xs relative hidden sm:block" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              placeholder="Search stores..."
              className="w-full pl-9 pr-4 py-2 bg-warm-100 dark:bg-slate-800/80 border border-surface-border dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
          </div>

          {/* Live Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-warm-900 rounded-2xl shadow-soft-xl border border-surface-border dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              {isSearching ? (
                <div className="px-4 py-3 text-xs text-surface-muted font-medium text-center">
                  Searching stores...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-xs text-surface-muted font-medium text-center">
                  No matching stores found
                </div>
              ) : (
                searchResults.map((s) => (
                  <Link
                    key={s.id}
                    to={`/stores/${s.id}`}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-warm-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="w-8 h-8 rounded-lg object-cover border border-surface-border shrink-0"
                    />
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-warm-900 dark:text-white truncate">
                        {s.name}
                      </p>
                      <p className="text-[10px] text-surface-muted truncate">{s.category}</p>
                    </div>
                    <span className="text-xs font-extrabold text-amber-500">★ {s.ratingAvg.toFixed(1)}</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Nav Options */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsThemeOpen(!isThemeOpen);
                setIsProfileOpen(false);
              }}
              className="p-2 rounded-xl text-surface-muted dark:text-slate-300 hover:bg-warm-100 dark:hover:bg-slate-800 transition-colors border border-surface-border dark:border-slate-800"
              title="Theme settings"
            >
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'dark' && <Moon className="w-4 h-4 text-brand-400" />}
              {theme === 'system' && <Monitor className="w-4 h-4 text-surface-muted" />}
            </button>

            {isThemeOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-warm-900 rounded-xl shadow-soft-md border border-surface-border dark:border-slate-800 py-1 z-50">
                <button
                  onClick={() => {
                    setTheme('light');
                    setIsThemeOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                    theme === 'light'
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                      : 'text-surface-muted hover:bg-warm-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" /> Light
                </button>
                <button
                  onClick={() => {
                    setTheme('dark');
                    setIsThemeOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                    theme === 'dark'
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                      : 'text-surface-muted hover:bg-warm-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Moon className="w-4 h-4 text-brand-400" /> Dark
                </button>
                <button
                  onClick={() => {
                    setTheme('system');
                    setIsThemeOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                    theme === 'system'
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                      : 'text-surface-muted hover:bg-warm-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Monitor className="w-4 h-4 text-surface-muted" /> System
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-warm-100 dark:hover:bg-slate-800 border border-surface-border dark:border-slate-800 transition-colors"
            aria-label="Toggle Public Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsThemeOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-warm-100 dark:hover:bg-slate-800 transition-colors border border-surface-border dark:border-slate-800"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-500 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden md:inline text-xs font-bold text-warm-900 dark:text-white max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-surface-muted hidden md:inline" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-warm-900 rounded-2xl shadow-soft-xl border border-surface-border dark:border-slate-800 py-2 z-50">
                  <div className="px-4 py-2 border-b border-surface-border dark:border-slate-800">
                    <p className="text-xs font-bold text-warm-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-surface-muted truncate">{user.email}</p>
                    <span className="mt-1 inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full px-4 py-2 text-xs font-bold text-warm-900 dark:text-white hover:bg-warm-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-brand-500" /> Portal Dashboard
                  </Link>

                  <Link
                    to="/user/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full px-4 py-2 text-xs font-bold text-warm-900 dark:text-white hover:bg-warm-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/user/ratings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full px-4 py-2 text-xs font-bold text-warm-900 dark:text-white hover:bg-warm-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    My Ratings
                  </Link>

                  <Link
                    to="/user/favorites"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full px-4 py-2 text-xs font-bold text-warm-900 dark:text-white hover:bg-warm-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    My Favorites
                  </Link>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 mt-1 border-t border-surface-border dark:border-slate-800 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-warm-900 dark:text-slate-200 hover:text-brand-500 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-extrabold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md shadow-brand-500/15 transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-warm-900 border-b border-surface-border dark:border-slate-800 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-warm-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {!user && (
            <div className="pt-3 border-t border-surface-border dark:border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-slate-800 dark:text-slate-200 bg-warm-100 dark:bg-slate-800 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-extrabold text-white bg-brand-500 rounded-xl shadow-md"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
