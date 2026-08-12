import React from 'react';
import { Link } from 'react-router-dom';
import { StoreHubLogo } from '../StoreHubLogo';
import { ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <StoreHubLogo size="sm" />
              <div className="flex items-baseline font-black text-2xl tracking-tight">
                <span className="text-white">Store</span>
                <span className="text-brand-500">Hub</span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Connecting customers with trusted local businesses through transparent 1–5 star ratings, authentic community experiences, and powerful analytics for store owners.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 bg-brand-950/60 px-3 py-1.5 rounded-lg border border-brand-800/50 w-fit">
              <ShieldCheck className="w-4 h-4" /> Trusted Local Rating Platform
            </div>
          </div>

          {/* Col 2: Discover Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Discover</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/user/stores" className="hover:text-brand-400 transition-colors flex items-center gap-1">
                  Explore Stores <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-brand-400 transition-colors flex items-center gap-1">
                  Categories <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-brand-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Access */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Portals</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Customer Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-400 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Store Owner Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Support & Legal</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#privacy" className="hover:text-brand-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-brand-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#guidelines" className="hover:text-brand-400 transition-colors">
                  Rating Guidelines
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-brand-400 transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} StoreHub Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for community discovery
          </p>
        </div>
      </div>
    </footer>
  );
};
