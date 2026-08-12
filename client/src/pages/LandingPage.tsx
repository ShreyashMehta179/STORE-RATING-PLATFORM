import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  ShieldCheck,
  Search,
  TrendingUp,
  Award,
  Users,
  Store as StoreIcon,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Heart,
  CheckCircle2,
  BarChart3,
  MessageSquare,
  Building,
} from 'lucide-react';
import api from '../services/api';
import { Store } from '../types';
import { RatingStars } from '../components/common/RatingStars';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const LandingPage: React.FC = () => {
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);
  const [stats, setStats] = useState({
    totalStores: 12,
    totalRatings: 72,
    platformAvgRating: 4.8,
    totalUsers: 14,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesRes, statsRes] = await Promise.all([
          api.get('/stores?limit=6&sortBy=rating&order=desc'),
          api.get('/analytics/public'),
        ]);

        if (storesRes.data.success) {
          setFeaturedStores(storesRes.data.data.stores);
        }

        if (statsRes.data.success && statsRes.data.data) {
          const statsData = statsRes.data.data.stats || statsRes.data.data;
          setStats({
            totalStores: statsData.totalStores || 12,
            totalRatings: statsData.totalRatings || 72,
            platformAvgRating: statsData.platformAvgRating || 4.8,
            totalUsers: (statsData.totalUsers || 10) + 4,
          });
        }
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-white font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-xs font-bold shadow-soft-sm"
            >
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>Trusted by thousands of shoppers</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-warm-900 dark:text-white"
            >
              Find. Rate. Share. <br />
              <span className="text-brand-500">Build Better Choices.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-surface-muted dark:text-slate-300 font-medium leading-relaxed max-w-xl"
            >
              Discover amazing local stores, share your genuine experiences, and help others make informed decisions with community-verified rating analytics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-2 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/user/stores"
                className="px-7 py-3.5 text-xs font-extrabold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md shadow-brand-500/20 transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                Explore Stores <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#how-it-works"
                className="px-7 py-3.5 text-xs font-extrabold text-warm-900 dark:text-slate-200 bg-white dark:bg-warm-900 border border-surface-border dark:border-slate-800 hover:bg-warm-100 dark:hover:bg-slate-800 rounded-xl shadow-soft-sm transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                How It Works ○
              </a>
            </motion.div>

            {/* User Avatars Social Proof */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-6 flex items-center gap-4 border-t border-surface-border dark:border-slate-800"
            >
              <div className="flex -space-x-2">
                {['aarav', 'ananya', 'rohan', 'priya'].map((name, i) => (
                  <div
                    key={name}
                    className="w-9 h-9 rounded-full border-2 border-white dark:border-warm-950 bg-brand-500 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm"
                  >
                    {name.charAt(0)}
                  </div>
                ))}
              </div>
              <div className="text-xs">
                <p className="font-bold text-warm-900 dark:text-white">Join 10,000+ happy users</p>
                <p className="text-surface-muted font-medium">rating local businesses this month</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column Editorial Image with Overlay Card & Floating Reviews */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-soft-xl border border-surface-border bg-white p-3">
              <img
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop"
                alt="Artisan Store Environment"
                className="w-full h-[420px] sm:h-[480px] object-cover rounded-2xl"
              />

              {/* Overlay Featured Store Badge Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className="absolute bottom-8 left-8 right-8 bg-white/95 dark:bg-warm-900/95 backdrop-blur-md p-5 rounded-2xl border border-surface-border shadow-soft-md flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
                    Featured Partner
                  </span>
                  <h3 className="text-base font-extrabold text-warm-900 dark:text-white">
                    Deccan Brew House
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars value={5} readOnly size="sm" />
                    <span className="text-xs font-bold text-warm-900 dark:text-white">4.8</span>
                    <span className="text-[11px] text-surface-muted">(248 ratings)</span>
                  </div>
                </div>

                <Link
                  to="/user/stores"
                  className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1"
                >
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>

              {/* Floating Animated Review Bubbles */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-8 left-6 bg-white dark:bg-warm-900 text-warm-900 dark:text-white px-4 py-2.5 rounded-2xl shadow-soft-md border border-surface-border text-xs font-bold flex items-center gap-2"
              >
                <span className="text-amber-500 font-extrabold">5.0 ★</span> "Great ambience!"
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-24 right-6 bg-white dark:bg-warm-900 text-warm-900 dark:text-white px-4 py-2.5 rounded-2xl shadow-soft-md border border-surface-border text-xs font-bold flex items-center gap-2"
              >
                <span className="text-brand-500 font-extrabold">✓</span> "Excellent service!"
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-28 left-6 bg-white dark:bg-warm-900 text-warm-900 dark:text-white px-4 py-2.5 rounded-2xl shadow-soft-md border border-surface-border text-xs font-bold flex items-center gap-2"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> "Loved the coffee!"
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Horizontal Platform Stats Section */}
      <section className="border-y border-surface-border dark:border-slate-800 bg-white/70 dark:bg-warm-900/70 backdrop-blur-md py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-warm-900 dark:text-white">{stats.totalUsers}+</p>
            <p className="text-xs font-bold uppercase tracking-wider text-surface-muted mt-1">Active Users</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-warm-900 dark:text-white">{stats.totalStores}+</p>
            <p className="text-xs font-bold uppercase tracking-wider text-surface-muted mt-1">Verified Stores</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-warm-900 dark:text-white">{stats.platformAvgRating}★</p>
            <p className="text-xs font-bold uppercase tracking-wider text-surface-muted mt-1">Average Rating</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-warm-900 dark:text-white">{stats.totalRatings}+</p>
            <p className="text-xs font-bold uppercase tracking-wider text-surface-muted mt-1">Community Reviews</p>
          </div>
        </div>
      </section>

      {/* Featured Top-Rated Stores */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">
              Community Top Picks
            </span>
            <h2 className="text-3xl font-extrabold text-warm-900 dark:text-white tracking-tight mt-1">
              Explore Top-Rated Stores
            </h2>
            <p className="text-xs text-surface-muted font-medium mt-1">
              Discover highly rated businesses trusted by the community.
            </p>
          </div>
          <Link
            to="/user/stores"
            className="mt-4 sm:mt-0 text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
          >
            View All Stores <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStores.map((store) => (
            <motion.div
              key={store.id}
              whileHover={{ y: -4 }}
              className="premium-card overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={store.imageUrl}
                    alt={store.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-warm-950/80 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    {store.category}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-base font-extrabold text-warm-900 dark:text-white line-clamp-1 mb-1">
                    {store.name}
                  </h3>
                  <p className="text-xs text-surface-muted truncate mb-3">
                    {store.address}
                  </p>
                  <p className="text-xs text-surface-muted line-clamp-2 mb-4 font-medium">
                    {store.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="flex items-center justify-between pt-4 border-t border-surface-border dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-1.5">
                    <RatingStars value={Math.round(store.ratingAvg)} readOnly size="sm" />
                    <span className="text-xs font-extrabold text-warm-900 dark:text-white">
                      {store.ratingAvg.toFixed(1)}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-surface-muted">
                    {store.ratingCount} rating{store.ratingCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <Link
                  to={`/stores/${store.id}`}
                  className="w-full py-2.5 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-500 hover:text-white text-brand-600 dark:text-brand-300 text-xs font-extrabold rounded-xl text-center block transition-all"
                >
                  View Store
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How StoreHub Works */}
      <section id="how-it-works" className="py-20 bg-warm-100/60 dark:bg-warm-900/40 border-y border-surface-border dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">
              Simple Step-by-Step Process
            </span>
            <h2 className="text-3xl font-extrabold text-warm-900 dark:text-white tracking-tight mt-1">
              How StoreHub Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="premium-card p-8 text-center relative z-10">
              <span className="text-4xl font-black text-brand-500/20 block mb-2">01</span>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold mb-2">Discover Stores</h3>
              <p className="text-xs text-surface-muted font-medium leading-relaxed">
                Browse verified local stores and businesses by category, location, and customer ratings.
              </p>
            </div>

            <div className="premium-card p-8 text-center relative z-10">
              <span className="text-4xl font-black text-brand-500/20 block mb-2">02</span>
              <div className="w-12 h-12 rounded-2xl bg-accent-softGold text-amber-600 mx-auto flex items-center justify-center mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold mb-2">Rate & Review</h3>
              <p className="text-xs text-surface-muted font-medium leading-relaxed">
                Share your authentic 1–5 star experiences and reviews stored securely in PostgreSQL.
              </p>
            </div>

            <div className="premium-card p-8 text-center relative z-10">
              <span className="text-4xl font-black text-brand-500/20 block mb-2">03</span>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold mb-2">Help Others Choose</h3>
              <p className="text-xs text-surface-muted font-medium leading-relaxed">
                Your genuine reviews empower community members to make informed purchasing decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why StoreHub */}
      <section id="why-storehub" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">
            Platform Benefits
          </span>
          <h2 className="text-3xl font-extrabold text-warm-900 dark:text-white tracking-tight mt-1">
            Why Choose StoreHub
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start gap-4 p-6 rounded-2xl border border-surface-border bg-white dark:bg-warm-900">
            <div className="p-3 rounded-xl bg-brand-50 text-brand-600 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold mb-1">Verified Community Ratings</h3>
              <p className="text-xs text-surface-muted font-medium leading-relaxed">
                Ratings are submitted by registered users with database uniqueness constraints preventing fake duplicate reviews.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl border border-surface-border bg-white dark:bg-warm-900">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold mb-1">Real Customer Experiences</h3>
              <p className="text-xs text-surface-muted font-medium leading-relaxed">
                Detailed customer feedback helps you discover hidden gems and top-rated local dining, shopping, and services.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl border border-surface-border bg-white dark:bg-warm-900">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold mb-1">Smart Store Discovery</h3>
              <p className="text-xs text-surface-muted font-medium leading-relaxed">
                Real-time search, multi-category filters, and flexible sorting options make finding stores fast and effortless.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl border border-surface-border bg-white dark:bg-warm-900">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold mb-1">Store Owner Analytics</h3>
              <p className="text-xs text-surface-muted font-medium leading-relaxed">
                Store owners receive real-time analytics graphs, customer feedback lists, and monthly improvement metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Store Owner Analytics Highlight Section */}
      <section className="py-20 bg-brand-700 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-200 bg-white/10 px-3.5 py-1.5 rounded-full">
                For Store Owners
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Turn Customer Feedback Into Better Business.
              </h2>
              <p className="text-xs sm:text-sm text-brand-100 font-medium leading-relaxed">
                Monitor your store's average rating, track customer feedback distribution, and identify growth opportunities with live dashboard analytics.
              </p>
              <Link
                to="/login"
                className="px-6 py-3.5 bg-white text-brand-700 hover:bg-warm-100 font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-2 transition-all hover:scale-105"
              >
                Manage Your Store →
              </Link>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white text-warm-900 p-6 rounded-3xl shadow-soft-xl border border-surface-border">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-border">
                  <div>
                    <span className="text-xs font-extrabold text-brand-600 uppercase">Dashboard Preview</span>
                    <h3 className="text-lg font-extrabold">Deccan Brew House Analytics</h3>
                  </div>
                  <span className="px-3 py-1 bg-brand-50 text-brand-600 text-xs font-extrabold rounded-full">
                    +8.5% Improvement
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-warm-100 border border-surface-border text-center">
                    <p className="text-2xl font-black text-warm-900">4.9★</p>
                    <p className="text-[10px] font-bold text-surface-muted uppercase">Avg Rating</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-warm-100 border border-surface-border text-center">
                    <p className="text-2xl font-black text-warm-900">248</p>
                    <p className="text-[10px] font-bold text-surface-muted uppercase">Total Reviews</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-warm-100 border border-surface-border text-center">
                    <p className="text-2xl font-black text-warm-900">94%</p>
                    <p className="text-[10px] font-bold text-surface-muted uppercase">5-Star Feedback</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-surface-border flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-500" />
                    <span>Aarav Mehta: "Best filter coffee in Pune! Friendly staff."</span>
                  </div>
                  <span className="text-amber-500 font-extrabold">★★★★★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="bg-brand-50 dark:bg-brand-950/60 p-12 rounded-3xl border border-brand-200 dark:border-brand-900 max-w-4xl mx-auto shadow-soft-md">
          <h2 className="text-3xl font-extrabold text-warm-900 dark:text-white tracking-tight mb-3">
            Ready to discover better stores?
          </h2>
          <p className="text-xs text-surface-muted dark:text-slate-300 max-w-md mx-auto mb-8 font-medium">
            Join thousands of shoppers and store owners on StoreHub today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/user/stores"
              className="px-7 py-3.5 text-xs font-extrabold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md transition-all hover:scale-105"
            >
              Explore Stores
            </Link>
            <Link
              to="/register"
              className="px-7 py-3.5 text-xs font-extrabold text-warm-900 dark:text-slate-200 bg-white dark:bg-warm-900 border border-surface-border hover:bg-warm-100 rounded-xl shadow-soft-sm transition-all hover:scale-105"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
};
