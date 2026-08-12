import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Store as StoreType } from '../types';
import { RatingStars } from '../components/common/RatingStars';
import {
  Search,
  X,
  UtensilsCrossed,
  Sparkles,
  Home,
  Cake,
  BookOpen,
  Dumbbell,
  ShoppingBag,
  Shirt,
  Laptop,
  Coffee,
  Plane,
  Briefcase,
  Store,
  ArrowRight,
  TrendingUp,
  Star,
  Layers,
} from 'lucide-react';

interface CategoryStat {
  category: string;
  storeCount: number;
  averageRating: number;
  reviewCount: number;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Restaurants & Dining': UtensilsCrossed,
  'Beauty & Personal Care': Sparkles,
  'Home & Garden': Home,
  'Bakery & Sweets': Cake,
  'Bookstores & Stationery': BookOpen,
  'Health & Fitness': Dumbbell,
  'Grocery & Supermarket': ShoppingBag,
  'Fashion & Apparel': Shirt,
  'Electronics & Technology': Laptop,
  'Cafes & Beverages': Coffee,
  'Travel & Hospitality': Plane,
  Services: Briefcase,
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Restaurants & Dining': 'Discover highly rated restaurants, pizzerias, bistros, and local eateries.',
  'Beauty & Personal Care': 'Find luxury spas, hair salons, skincare clinics, and wellness studios.',
  'Home & Garden': 'Explore plant nurseries, interior decor stores, and home improvement hubs.',
  'Bakery & Sweets': 'Indulge in artisanal bakeries, pastry shops, and custom cake studios.',
  'Bookstores & Stationery': 'Browse independent bookstores, craft supplies, and stationery boutiques.',
  'Health & Fitness': 'Join top-rated gyms, yoga centers, and personal training facilities.',
  'Grocery & Supermarket': 'Shop organic produce markets, gourmet pantries, and fresh groceries.',
  'Fashion & Apparel': 'Explore trendy fashion boutiques, apparel stores, and accessories.',
  'Electronics & Technology': 'Find trusted gadget stores, computer repair centers, and tech hubs.',
  'Cafes & Beverages': 'Enjoy specialty coffee roasters, tea lounges, and cozy neighborhood cafes.',
  'Travel & Hospitality': 'Book boutique hotels, travel agencies, and local tour services.',
  Services: 'Connect with reliable professional services, repair centers, and consultants.',
};

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'stores' | 'rating' | 'reviews'>('stores');
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewStores, setPreviewStores] = useState<StoreType[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load real category statistics from backend
  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/stores/categories/stats');
        if (res.data.success) {
          const fetched: CategoryStat[] = res.data.data.categories;
          // Ensure all supported categories exist even if storeCount is 0
          const supportedCats = Object.keys(CATEGORY_ICONS);
          const fullList: CategoryStat[] = supportedCats.map((catName) => {
            const found = fetched.find((f) => f.category === catName);
            return (
              found || {
                category: catName,
                storeCount: 0,
                averageRating: 4.5,
                reviewCount: 0,
              }
            );
          });
          setCategories(fullList);
          if (fullList.length > 0) {
            setSelectedCategory(fullList[0].category);
          }
        }
      } catch (err) {
        console.error('Failed to load category stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryStats();
  }, []);

  // Load store previews when selectedCategory changes
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchPreviewStores = async () => {
      try {
        setLoadingPreview(true);
        const res = await api.get(`/stores?category=${encodeURIComponent(selectedCategory)}&limit=3`);
        if (res.data.success) {
          setPreviewStores(res.data.data.stores || []);
        }
      } catch (err) {
        console.error('Failed to load preview stores:', err);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreviewStores();
  }, [selectedCategory]);

  // Filter categories by search
  const filteredCategories = categories.filter((c) =>
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (CATEGORY_DESCRIPTIONS[c.category] || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort categories by activeTab
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (activeTab === 'stores') return b.storeCount - a.storeCount;
    if (activeTab === 'rating') return b.averageRating - a.averageRating;
    return b.reviewCount - a.reviewCount;
  });

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-950 to-warm-950 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold uppercase tracking-wider"
          >
            <Layers className="w-4 h-4 text-amber-400" /> StoreHub Directory
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
          >
            Explore Stores by <span className="text-brand-400">Category</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium"
          >
            Discover trusted local businesses, explore popular categories, and find top-rated places recommended by the StoreHub community.
          </motion.p>

          {/* Premium Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-xl mx-auto pt-2"
          >
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories or store types..."
                className="w-full pl-12 pr-10 py-3.5 bg-white/10 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800 rounded-2xl text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white dark:bg-warm-900 p-2 rounded-2xl shadow-soft-lg border border-surface-border dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'stores'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Most Stores
            </button>
            <button
              onClick={() => setActiveTab('rating')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'rating'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Highest Rated
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Most Reviewed
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-500 px-3">
            Showing <strong className="text-brand-600 dark:text-brand-400">{sortedCategories.length}</strong> Categories
          </span>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCategories.map((c, index) => {
              const IconComponent = CATEGORY_ICONS[c.category] || Store;
              const isSelected = selectedCategory === c.category;

              return (
                <motion.div
                  key={c.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  onClick={() => setSelectedCategory(c.category)}
                  className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/40 dark:bg-brand-950/20 shadow-soft-xl'
                      : 'border-surface-border dark:border-slate-800 hover:border-brand-400 hover:-translate-y-1 hover:shadow-soft-lg'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-xs">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                        {c.storeCount} {c.storeCount === 1 ? 'store' : 'stores'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {c.category}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug font-medium">
                        {CATEGORY_DESCRIPTIONS[c.category] || 'Explore top-rated local listings.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {c.averageRating.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">({c.reviewCount})</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/stores?category=${encodeURIComponent(c.category)}`);
                      }}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                    >
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Selected Category Store Preview Section */}
      {selectedCategory && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-surface-border dark:border-slate-800 shadow-soft-lg space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Featured Listings
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Top Rated in {selectedCategory}
                </h2>
              </div>

              <Link
                to={`/user/stores?category=${encodeURIComponent(selectedCategory)}`}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all hover:scale-105"
              >
                View All {selectedCategory} Stores <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loadingPreview ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : previewStores.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-medium">
                No stores currently listed in this category. Be the first store owner to join!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {previewStores.map((store) => (
                  <div
                    key={store.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 hover:shadow-soft-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={store.imageUrl}
                        alt={store.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {store.name}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{store.address}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <RatingStars value={Math.round(store.ratingAvg)} readOnly size="sm" />
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {store.ratingAvg.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/stores/${store.id}`}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl text-center transition-colors"
                    >
                      View Details & Reviews
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight relative z-10">
            Can't find what you're looking for?
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto relative z-10 font-medium">
            Explore all stores on our interactive discovery map or register your own business today.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap relative z-10 pt-2">
            <Link
              to="/user/stores"
              className="px-6 py-3 bg-white text-brand-700 hover:bg-brand-50 rounded-2xl font-extrabold text-xs shadow-lg transition-all hover:scale-105"
            >
              Explore All Stores
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-brand-900/60 hover:bg-brand-900 text-white border border-brand-400/40 rounded-2xl font-extrabold text-xs transition-all"
            >
              List Your Store
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
