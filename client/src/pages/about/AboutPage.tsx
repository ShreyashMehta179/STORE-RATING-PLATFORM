import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import {
  ShieldCheck,
  Heart,
  Target,
  Eye,
  Award,
  Users,
  Store,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Lock,
} from 'lucide-react';
import loginHeroImg from '../../assets/login-store.png';

interface PublicStats {
  totalStores: number;
  totalRatings: number;
  totalUsers: number;
  platformAvgRating: number;
}

const CORE_VALUES = [
  {
    icon: ShieldCheck,
    title: 'Transparency',
    description: 'Ratings should be 100% authentic to empower customers to make informed everyday decisions.',
  },
  {
    icon: Heart,
    title: 'Authenticity',
    description: 'Real community experiences create reliable, trustworthy recommendations for local neighborhood places.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Customers and local store owners thrive through transparent, respectful feedback channels.',
  },
  {
    icon: TrendingUp,
    title: 'Continuous Improvement',
    description: 'Constructive customer reviews give businesses actionable insights to continuously upgrade service.',
  },
];

const TRUST_FEATURES = [
  'Transparent 1-5 star ratings',
  'Real community feedback',
  'Easy category discovery',
  'Store owner analytics',
  'Secure JWT authentication',
  'Role-based access control',
];

export const AboutPage: React.FC = () => {
  const [stats, setStats] = useState<PublicStats>({
    totalStores: 12,
    totalRatings: 72,
    totalUsers: 18,
    platformAvgRating: 4.8,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch real database analytics from GET /api/analytics/public
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const res = await api.get('/analytics/public');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load public analytics:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-slate-900 to-warm-950 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> About StoreHub
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
            >
              Making Better Local Choices, <span className="text-brand-400">Together.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              StoreHub connects everyday customers with trusted businesses through transparent ratings, authentic experiences, and meaningful feedback loops.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center lg:justify-start gap-4 flex-wrap pt-2"
            >
              <Link
                to="/user/stores"
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-extrabold text-xs shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
              >
                Explore Stores
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-extrabold text-xs transition-all"
              >
                Join Our Community
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src={loginHeroImg}
                alt="StoreHub Community"
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-sm">Trusted Community Discovery</p>
                  <p className="text-xs text-slate-300">Empowering local neighborhood commerce</p>
                </div>
                <div className="flex text-amber-400 gap-1 text-sm">★ ★ ★ ★ ★</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Real Platform Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white dark:bg-warm-900 p-6 sm:p-8 rounded-3xl shadow-soft-xl border border-surface-border dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center mb-2">
              <Store className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {loadingStats ? '...' : stats.totalStores}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Listed Stores</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {loadingStats ? '...' : stats.totalRatings}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Submitted Ratings</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-brand-500" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {loadingStats ? '...' : stats.totalUsers}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Members</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {loadingStats ? '...' : `${stats.platformAvgRating} ★`}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Average</p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-3xl border border-surface-border dark:border-slate-800 space-y-4 shadow-soft-lg">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Our Mission</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              StoreHub exists to make discovering local businesses easier, more transparent, and community-driven. Customers deserve better information before choosing where to shop, eat, or spend, while store owners deserve meaningful feedback to grow.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-surface-border dark:border-slate-800 space-y-4 shadow-soft-lg">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Our Vision</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              To create a trusted, vibrant ecosystem where every genuine customer experience empowers someone to make a better decision, and every store owner learns from their customers to build a thriving business.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Core Beliefs
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            What We Believe
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map((val, idx) => {
            const Icon = val.icon;
            return (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 rounded-3xl border border-surface-border dark:border-slate-800 space-y-3 hover:-translate-y-1 transition-transform"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {val.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {val.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Why People Choose StoreHub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-surface-border dark:border-slate-800 shadow-soft-xl space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Built on Trust
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Why People Choose StoreHub
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {TRUST_FEATURES.map((feat) => (
              <div
                key={feat}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight relative z-10">
            Discover Better. Share Better. Choose Better.
          </h2>
          <div className="flex items-center justify-center gap-4 flex-wrap relative z-10 pt-2">
            <Link
              to="/user/stores"
              className="px-6 py-3 bg-white text-brand-700 hover:bg-brand-50 rounded-2xl font-extrabold text-xs shadow-lg transition-all hover:scale-105"
            >
              Explore Stores
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-brand-900/60 hover:bg-brand-900 text-white border border-brand-400/40 rounded-2xl font-extrabold text-xs transition-all"
            >
              Join StoreHub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
