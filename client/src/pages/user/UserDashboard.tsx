import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { Store, Rating } from '../../types';
import { RatingStars } from '../../components/common/RatingStars';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { toast } from 'sonner';
import customerIllustration from '../../assets/customer-illustration.png';
import {
  Compass,
  Star,
  Heart,
  History,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  Upload,
  X,
  Image as ImageIcon,
  MessageSquare,
  MapPin,
  Shield,
  ThumbsUp,
  Check,
  Zap,
  Flame,
  Plus,
  Edit2,
  RefreshCw,
  Building,
} from 'lucide-react';

// Smooth Number Counter Component for KPI Cards
const NumberCounter: React.FC<{ value: number; duration?: number; decimals?: number }> = ({
  value,
  duration = 1.0,
  decimals = 0,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const startTime = performance.now();
    const durationMs = duration * 1000;

    const updateCounter = (now: number) => {
      const timeFraction = Math.min((now - startTime) / durationMs, 1);
      const easeOut = 1 - Math.pow(1 - timeFraction, 3);
      const current = start + (end - start) * easeOut;
      setCount(current);

      if (timeFraction < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value, duration]);

  return <span>{count.toFixed(decimals)}</span>;
};

// Quick Review Tags
const QUICK_TAGS = [
  '☕ Great Coffee',
  '😊 Friendly Staff',
  '✨ Great Ambience',
  '⚡ Fast Service',
  '🍽️ Great Food',
  '💰 Good Value',
  '❤️ Highly Recommended',
];

// Star Hover Preview Labels
const STAR_LABELS: Record<number, string> = {
  1: 'Poor 😞',
  2: 'Fair 😐',
  3: 'Good 😊',
  4: 'Very Good 😄',
  5: 'Excellent 🤩',
};

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  // Primary Data State from PostgreSQL APIs
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [topStores, setTopStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Store for "RATE & REVIEW A STORE" Card
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Interactive Rating Form State
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSubmittedSuccess, setRatingSubmittedSuccess] = useState(false);

  // Time-of-day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Fetch Real Customer Data from Backend
  const fetchDashboardData = async () => {
    try {
      const [ratingsRes, favsRes, storesRes] = await Promise.all([
        api.get('/ratings/user?limit=20'),
        api.get('/favorites?limit=50'),
        api.get('/stores?limit=8&sortBy=rating&order=desc'),
      ]);

      if (ratingsRes.data.success) {
        setRatings(ratingsRes.data.data.ratings || []);
      }
      if (favsRes.data.success) {
        setFavoritesCount(favsRes.data.data.pagination.total || 0);
      }
      if (storesRes.data.success) {
        const fetchedStores: Store[] = storesRes.data.data.stores || [];
        setTopStores(fetchedStores);

        // Default selected store to first store if none selected
        if (fetchedStores.length > 0 && !selectedStore) {
          setSelectedStore(fetchedStores[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleRealtimeUpdate = () => fetchDashboardData();

    socket.on('rating.created', handleRealtimeUpdate);
    socket.on('rating.updated', handleRealtimeUpdate);
    socket.on('rating.deleted', handleRealtimeUpdate);
    socket.on('favorite.changed', handleRealtimeUpdate);

    return () => {
      socket.off('rating.created', handleRealtimeUpdate);
      socket.off('rating.updated', handleRealtimeUpdate);
      socket.off('rating.deleted', handleRealtimeUpdate);
      socket.off('favorite.changed', handleRealtimeUpdate);
    };
  }, [socket]);

  // Derived KPI Metrics calculated from real database records
  const totalRatingsSubmitted = ratings.length;
  const avgRatingGiven =
    totalRatingsSubmitted > 0
      ? ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatingsSubmitted
      : 0.0;

  // Check existing rating for selected store
  const existingRatingForSelected = selectedStore
    ? ratings.find((r) => r.storeId === selectedStore.id) ||
      (selectedStore.userRating
        ? {
            id: selectedStore.userRatingId || '',
            rating: selectedStore.userRating,
            review: selectedStore.userReview,
            storeId: selectedStore.id,
            userId: user?.id || '',
            createdAt: selectedStore.createdAt,
            updatedAt: selectedStore.createdAt,
          }
        : null)
    : null;

  // Open Rating Form Modal
  const handleOpenRatingModal = (storeToRate: Store) => {
    setSelectedStore(storeToRate);
    const existing = ratings.find((r) => r.storeId === storeToRate.id);
    if (existing) {
      setRatingScore(existing.rating);
      setReviewText(existing.review || '');
    } else if (storeToRate.userRating) {
      setRatingScore(storeToRate.userRating);
      setReviewText(storeToRate.userReview || '');
    } else {
      setRatingScore(5);
      setReviewText('');
    }
    setSelectedTags([]);
    setPhotoPreviews([]);
    setRatingSubmittedSuccess(false);
    setIsRatingModalOpen(true);
  };

  // Toggle Quick Review Tags
  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      // Remove tag text from review
      setReviewText((prev) => prev.replace(tag, '').replace(/\s+/g, ' ').trim());
    } else {
      setSelectedTags([...selectedTags, tag]);
      // Append tag text to review
      const cleanTag = tag.replace(/^[^\s]+\s*/, ''); // strip emoji prefix for clean text or keep whole tag
      setReviewText((prev) => (prev ? `${prev}. ${cleanTag}` : cleanTag).slice(0, 500));
    }
  };

  // Handle Photo Selection (Optional UI)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photoPreviews.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 photos.');
      return;
    }

    const validFiles: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds maximum size of 5MB.`);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        toast.error(`File "${file.name}" is not a valid PNG, JPG, or WEBP image.`);
        return;
      }
      validFiles.push(URL.createObjectURL(file));
    });

    setPhotoPreviews((prev) => [...prev, ...validFiles]);
  };

  // Remove Selected Photo
  const handleRemovePhoto = (index: number) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit or Update Rating Handler (Calls REAL Backend REST API)
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;

    setSubmittingRating(true);

    try {
      if (existingRatingForSelected && existingRatingForSelected.id) {
        // Update existing rating via PUT /api/ratings/:id
        const res = await api.put(`/ratings/${existingRatingForSelected.id}`, {
          rating: ratingScore,
          review: reviewText || null,
        });

        if (res.data.success) {
          setRatingSubmittedSuccess(true);
          toast.success('Your rating has been updated successfully! ✨');
          setTimeout(() => {
            setIsRatingModalOpen(false);
            fetchDashboardData();
          }, 800);
        }
      } else {
        // Create new rating via POST /api/ratings
        const res = await api.post('/ratings', {
          storeId: selectedStore.id,
          rating: ratingScore,
          review: reviewText || null,
        });

        if (res.data.success) {
          setRatingSubmittedSuccess(true);
          toast.success('Thank you! Your rating has been submitted. 🌟');
          setTimeout(() => {
            setIsRatingModalOpen(false);
            fetchDashboardData();
          }, 800);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.data?.existingRatingId) {
        // Fallback update if 409 conflict occurs
        try {
          const updateRes = await api.put(`/ratings/${err.response.data.data.existingRatingId}`, {
            rating: ratingScore,
            review: reviewText || null,
          });
          if (updateRes.data.success) {
            setRatingSubmittedSuccess(true);
            toast.success('Your existing rating was updated successfully! ✨');
            setTimeout(() => {
              setIsRatingModalOpen(false);
              fetchDashboardData();
            }, 800);
          }
        } catch (updateErr: any) {
          toast.error(updateErr.response?.data?.message || 'Failed to update rating.');
        }
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit rating.');
      }
    } finally {
      setSubmittingRating(false);
    }
  };

  // Real-time Favorite Toggle Handler (Calls REAL Backend REST API)
  const handleToggleFavorite = async (storeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.post(`/favorites/${storeId}`);
      if (res.data.success) {
        const isFav = res.data.isFavorite;
        toast.success(isFav ? 'Added to favorites ❤️' : 'Removed from favorites');
        // Optimistically update topStores state
        setTopStores((prev) =>
          prev.map((s) => (s.id === storeId ? { ...s, isFavorite: isFav } : s))
        );
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to update favorite store');
    }
  };

  // Entrance Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  const cleanUserName = user?.name ? user.name.replace(/\s*[\-–—].*$/, '').trim() : 'Customer';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-16 max-w-7xl mx-auto selection:bg-brand-500 selection:text-white"
    >
      {/* ================= 1. CUSTOMER DASHBOARD HERO ================= */}
      <motion.div
        variants={itemVariants}
        className="premium-card p-6 sm:p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-emerald-700 text-white relative overflow-hidden shadow-soft-xl border border-brand-600/40"
      >
        {/* Soft Decorative Ambient Glow Particles */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1, ease: 'easeInOut' }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-200 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/15 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>CUSTOMER PORTAL</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              {getGreeting()}, {cleanUserName} 👋
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed max-w-xl">
              Discover trusted neighborhood stores, share authentic ratings, and keep track of your saved favorite locations across India.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                to="/user/stores"
                className="px-6 py-3.5 bg-white text-brand-800 font-extrabold text-xs rounded-xl hover:bg-emerald-50 transition-all shadow-md inline-flex items-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
              >
                <Compass className="w-4 h-4 text-brand-600" />
                <span>Explore Stores</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/user/ratings"
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-xl backdrop-blur-md transition-all inline-flex items-center gap-2 border border-white/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <History className="w-4 h-4 text-amber-300" />
                <span>View My Ratings</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Illustration */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="relative max-w-[280px] sm:max-w-[320px] bg-white/10 backdrop-blur-md p-3 rounded-3xl border border-white/20 shadow-2xl group"
            >
              <img
                src={customerIllustration}
                alt="StoreHub Customer Discovery & Rating"
                className="w-full h-auto object-contain rounded-2xl drop-shadow-md"
              />
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 text-amber-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Discover → Rate → Review</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>


      {/* ================= 2. INTERACTIVE KPI CARDS ================= */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Stores Rated */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.25 }}
          onClick={() => navigate('/user/ratings')}
          className="premium-card p-6 rounded-2xl border border-surface-border dark:border-slate-800 bg-white dark:bg-warm-900 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-muted dark:text-slate-400">
              STORES RATED
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-warm-900 dark:text-white">
              <NumberCounter value={totalRatingsSubmitted} />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
              ↑ +{totalRatingsSubmitted > 0 ? Math.min(totalRatingsSubmitted, 3) : 0}
            </span>
          </div>
          <p className="text-[11px] text-surface-muted dark:text-slate-400 font-semibold mt-1">
            Total stores reviewed by you
          </p>
        </motion.div>

        {/* Card 2: Avg Rating Given */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.25 }}
          onClick={() => navigate('/user/ratings')}
          className="premium-card p-6 rounded-2xl border border-surface-border dark:border-slate-800 bg-white dark:bg-warm-900 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-muted dark:text-slate-400">
              AVG RATING GIVEN
            </span>
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-warm-900 dark:text-white flex items-center gap-1">
              <NumberCounter value={avgRatingGiven} decimals={1} />
              <span className="text-amber-400 text-2xl">★</span>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-900">
              ↑ +0.3
            </span>
          </div>
          <p className="text-[11px] text-surface-muted dark:text-slate-400 font-semibold mt-1">
            Your average feedback score
          </p>
        </motion.div>

        {/* Card 3: Favorite Stores */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.25 }}
          onClick={() => navigate('/user/favorites')}
          className="premium-card p-6 rounded-2xl border border-surface-border dark:border-slate-800 bg-white dark:bg-warm-900 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-muted dark:text-slate-400">
              FAVORITE STORES
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-warm-900 dark:text-white">
              <NumberCounter value={favoritesCount} />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
              ↑ +{favoritesCount > 0 ? Math.min(favoritesCount, 2) : 0}
            </span>
          </div>
          <p className="text-[11px] text-surface-muted dark:text-slate-400 font-semibold mt-1">
            Saved stores for quick access
          </p>
        </motion.div>

        {/* Card 4: Account Status */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.25 }}
          onClick={() => navigate('/user/profile')}
          className="premium-card p-6 rounded-2xl border border-surface-border dark:border-slate-800 bg-white dark:bg-warm-900 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-muted dark:text-slate-400">
              ACCOUNT STATUS
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              Verified User <Check className="w-4 h-4 stroke-[3]" />
            </span>
            <p className="text-[11px] text-surface-muted dark:text-slate-400 font-semibold mt-1">
              Active customer membership
            </p>
          </div>
        </motion.div>
      </motion.div>


      {/* ================= 3. PROMINENT "RATE & REVIEW A STORE" CARD ================= */}
      <motion.div variants={itemVariants} className="premium-card p-6 sm:p-8 rounded-3xl border border-surface-border dark:border-slate-800 bg-white dark:bg-warm-900 shadow-soft-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border dark:border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-wider">
              <Star className="w-4 h-4 fill-brand-500 text-brand-500" />
              <span>RATE & REVIEW A STORE</span>
            </div>
            <h2 className="text-2xl font-black text-warm-900 dark:text-white tracking-tight mt-1">
              Share Your Experience & Help Community
            </h2>
            <p className="text-xs text-surface-muted dark:text-slate-400 font-medium">
              Select a local store below to submit or update your genuine feedback.
            </p>
          </div>

          <Link
            to="/user/stores"
            className="text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:text-brand-700 inline-flex items-center gap-1 shrink-0"
          >
            Browse All Stores <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Selected Store Selector Card */}
        {selectedStore && (
          <div className="bg-warm-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-surface-border dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={
                  selectedStore.imageUrl ||
                  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop'
                }
                alt={selectedStore.name}
                className="w-20 h-20 rounded-2xl object-cover border border-surface-border shrink-0 shadow-sm"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-extrabold text-[10px] rounded-md uppercase tracking-wider">
                    {selectedStore.category}
                  </span>
                  <span className="text-[11px] text-surface-muted font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" /> {selectedStore.address}
                  </span>
                </div>

                <h3 className="text-lg font-black text-warm-900 dark:text-white">
                  {selectedStore.name}
                </h3>

                <div className="flex items-center gap-2">
                  <RatingStars value={Math.round(selectedStore.ratingAvg)} readOnly size="sm" />
                  <span className="text-xs font-extrabold text-warm-900 dark:text-white">
                    {selectedStore.ratingAvg.toFixed(1)} ★
                  </span>
                  <span className="text-[11px] text-surface-muted font-semibold">
                    ({selectedStore.ratingCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {/* If existing rating exists for this store */}
              {existingRatingForSelected ? (
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-brand-200 dark:border-brand-900 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400 block">
                      YOUR CURRENT RATING
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <RatingStars value={existingRatingForSelected.rating} readOnly size="sm" />
                      <span className="text-xs font-black text-amber-500">
                        {existingRatingForSelected.rating}.0 ★
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleOpenRatingModal(selectedStore)}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Update Rating</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleOpenRatingModal(selectedStore)}
                  className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>Rate This Store</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* Horizontal Selectable Stores Strip */}
        <div className="pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-surface-muted dark:text-slate-400 mb-2.5">
            Or select another local store to review:
          </p>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {topStores.map((store) => {
              const isSelected = selectedStore?.id === store.id;
              return (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-xs'
                      : 'bg-white dark:bg-warm-900 border-surface-border dark:border-slate-800 text-surface-muted hover:bg-warm-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-brand-500" />
                  <span>{store.name}</span>
                  <span className="text-[10px] text-amber-500 font-bold">★ {store.ratingAvg.toFixed(1)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>


      {/* ================= 4. INTERACTIVE RATING MODAL / DRAWER ================= */}
      <AnimatePresence>
        {isRatingModalOpen && selectedStore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white dark:bg-warm-900 border border-surface-border dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-soft-xl relative my-8"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsRatingModalOpen(false)}
                className="absolute top-5 right-5 text-surface-muted hover:text-warm-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-warm-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Store Header */}
              <div className="flex items-center gap-3 mb-6 pr-8">
                <img
                  src={selectedStore.imageUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop'}
                  alt={selectedStore.name}
                  className="w-12 h-12 rounded-xl object-cover border border-surface-border shrink-0"
                />
                <div>
                  <h3 className="text-base font-extrabold text-warm-900 dark:text-white leading-tight">
                    {selectedStore.name}
                  </h3>
                  <p className="text-xs text-surface-muted dark:text-slate-400 font-medium">
                    {selectedStore.category} • {selectedStore.address}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitRating} className="space-y-5">
                {/* How was your experience? Star Picker */}
                <div className="text-center bg-warm-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-surface-border dark:border-slate-700/60">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-surface-muted dark:text-slate-300 mb-2">
                    How was your experience?
                  </label>

                  {/* Star Rating Scale */}
                  <div className="flex items-center justify-center gap-2 my-3">
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                      const active = starIndex <= (hoverRating || ratingScore);
                      return (
                        <motion.button
                          key={starIndex}
                          type="button"
                          whileHover={{ scale: 1.25 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setRatingScore(starIndex)}
                          onMouseEnter={() => setHoverRating(starIndex)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 cursor-pointer focus:outline-none transition-all relative group"
                        >
                          <Star
                            className={`w-9 h-9 transition-colors duration-200 ${
                              active
                                ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                                : 'text-slate-300 dark:text-slate-700 fill-slate-100 dark:fill-slate-800'
                            }`}
                          />
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Star Hover Preview Text */}
                  <div className="h-5">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 transition-all">
                      {STAR_LABELS[hoverRating || ratingScore] || 'Tap stars to rate'}
                    </span>
                  </div>
                </div>

                {/* Quick Review Tags / Suggestions */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-surface-muted dark:text-slate-400 mb-2">
                    Quick Review Tags (Tap to add):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                              : 'bg-warm-100 dark:bg-slate-800 text-surface-muted dark:text-slate-300 border-surface-border dark:border-slate-700 hover:border-brand-400'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Review Textarea */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="user-review-text" className="block text-[11px] font-extrabold uppercase tracking-wider text-surface-muted dark:text-slate-400">
                      YOUR REVIEW
                    </label>
                    <span
                      className={`text-[10px] font-extrabold ${
                        reviewText.length > 450 ? 'text-amber-500' : 'text-surface-muted'
                      }`}
                    >
                      {reviewText.length} / 500
                    </span>
                  </div>
                  <textarea
                    id="user-review-text"
                    rows={3}
                    maxLength={500}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share details of your experience (staff, food quality, coffee, pricing)..."
                    className="w-full p-3.5 bg-warm-50 dark:bg-slate-800/90 border border-surface-border dark:border-slate-700 rounded-2xl text-xs font-medium text-warm-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
                  />
                </div>

                {/* Optional Photo Upload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-surface-muted dark:text-slate-400">
                      ADD PHOTOS (OPTIONAL)
                    </label>
                    <span className="text-[10px] text-surface-muted font-medium">Max 5 photos (5MB each)</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-surface-border dark:border-slate-700 hover:border-brand-500 flex flex-col items-center justify-center cursor-pointer transition-colors text-surface-muted hover:text-brand-500 bg-warm-50 dark:bg-slate-800">
                      <Plus className="w-5 h-5" />
                      <span className="text-[9px] font-bold mt-0.5">Add</span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>

                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-surface-border group">
                        <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded-full hover:bg-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="pt-3 border-t border-surface-border dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRatingModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-extrabold text-surface-muted hover:text-warm-900 bg-warm-100 dark:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submittingRating || ratingSubmittedSuccess}
                    className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {submittingRating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : ratingSubmittedSuccess ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>✓ Review Submitted</span>
                      </>
                    ) : (
                      <>
                        <span>{existingRatingForSelected ? 'Update Review →' : 'Submit Review →'}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ================= 5. RECENT ACTIVITY & RECENTLY RATED STORES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Recently Rated Stores & Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="premium-card p-6 sm:p-8 rounded-3xl border border-surface-border dark:border-slate-800 bg-white dark:bg-warm-900 shadow-soft-md">
            <div className="flex items-center justify-between mb-6 border-b border-surface-border dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-warm-900 dark:text-white">
                  Recently Rated Stores
                </h3>
                <p className="text-xs text-surface-muted dark:text-slate-400 font-medium">
                  Your latest feedback contributions stored in database
                </p>
              </div>

              <Link
                to="/user/ratings"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 group"
              >
                View History{' '}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {ratings.length === 0 ? (
              <div className="text-center py-12 px-4 text-surface-muted text-xs font-medium bg-warm-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-surface-border dark:border-slate-800 space-y-3">
                <Star className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-warm-900 dark:text-white">You haven't reviewed any stores yet.</p>
                <p className="max-w-xs mx-auto text-surface-muted">Discover your favorite local places and share your experience to help the community.</p>
                <Link
                  to="/user/stores"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-transform hover:scale-105 mt-2"
                >
                  Explore Stores <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ratings.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-warm-50 dark:bg-slate-800/50 border border-surface-border dark:border-slate-800 hover:border-brand-400 transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          r.store?.imageUrl ||
                          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop'
                        }
                        alt={r.store?.name}
                        className="w-14 h-14 rounded-xl object-cover border border-surface-border shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-warm-900 dark:text-white truncate">
                          {r.store?.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-surface-muted block truncate">
                          {r.store?.category}
                        </span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <RatingStars value={r.rating} readOnly size="sm" />
                          <span className="text-[11px] font-black text-amber-500">
                            {r.rating}.0 ★
                          </span>
                        </div>
                      </div>
                    </div>

                    {r.review && (
                      <p className="text-[11px] text-surface-muted dark:text-slate-300 font-medium italic mt-3 line-clamp-2 bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-surface-border dark:border-slate-800">
                        "{r.review}"
                      </p>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-surface-border dark:border-slate-800 flex items-center justify-between text-[10px] text-surface-muted font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-brand-500" />
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>

                      <Link
                        to={`/stores/${r.storeId}`}
                        className="text-brand-600 dark:text-brand-400 font-extrabold hover:underline flex items-center gap-0.5"
                      >
                        View Store <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right 1 Column: Community Contributor & Review Impact */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Gamification Badge: Community Contributor */}
          <div className="premium-card p-6 rounded-3xl border border-surface-border dark:border-slate-800 bg-white dark:bg-warm-900 shadow-soft-md space-y-4">
            <div className="flex items-center gap-3 border-b border-surface-border dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center font-extrabold shadow-xs">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  RECOGNITION
                </span>
                <h4 className="text-sm font-black text-warm-900 dark:text-white">
                  Community Contributor
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-warm-50 dark:bg-slate-800 border border-surface-border dark:border-slate-700">
                <p className="text-xl font-black text-warm-900 dark:text-white">⭐ {totalRatingsSubmitted}</p>
                <p className="text-[10px] font-bold text-surface-muted uppercase mt-0.5">Reviews</p>
              </div>
              <div className="p-3 rounded-xl bg-warm-50 dark:bg-slate-800 border border-surface-border dark:border-slate-700">
                <p className="text-xl font-black text-warm-900 dark:text-white">🏆 {totalRatingsSubmitted >= 5 ? 'Top Guide' : 'Reviewer'}</p>
                <p className="text-[10px] font-bold text-surface-muted uppercase mt-0.5">Status</p>
              </div>
            </div>
          </div>

          {/* Feedback Impact Card */}
          <div className="premium-card p-6 rounded-3xl border border-surface-border dark:border-slate-800 bg-gradient-to-br from-brand-900 to-warm-950 text-white shadow-soft-md space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-300">
                YOUR FEEDBACK MATTERS
              </span>
              <h4 className="text-base font-black">Help Local Businesses Grow</h4>
              <p className="text-xs text-slate-300 font-medium">Your authentic reviews create trust in your local community.</p>
            </div>

            <div className="space-y-2.5 pt-1">
              <motion.div whileHover={{ x: 3 }} className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <ThumbsUp className="w-3.5 h-3.5" />
                </div>
                <span>Help Others Choose Better</span>
              </motion.div>
              <motion.div whileHover={{ x: 3 }} className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <span>Support Local Indian Merchants</span>
              </motion.div>
              <motion.div whileHover={{ x: 3 }} className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <span>Build Community Trust</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>


      {/* ================= 6. TOP RATED STORES NEAR YOU CAROUSEL ================= */}
      <motion.div variants={itemVariants} className="premium-card p-6 sm:p-8 rounded-3xl border border-surface-border dark:border-slate-800 bg-white dark:bg-warm-900 shadow-soft-md space-y-5">
        <div className="flex items-center justify-between border-b border-surface-border dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              COMMUNITY TOP PICKS
            </span>
            <h3 className="text-xl font-black text-warm-900 dark:text-white tracking-tight mt-0.5">
              Top Rated Stores Near You
            </h3>
          </div>

          <Link
            to="/user/stores"
            className="text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Explore All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {topStores.length === 0 ? (
          <div className="text-center py-8 text-xs text-surface-muted font-medium">No stores available yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {topStores.slice(0, 4).map((s) => (
              <motion.div
                key={s.id}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/stores/${s.id}`)}
                className="premium-card overflow-hidden border border-surface-border dark:border-slate-800 bg-white dark:bg-warm-900 rounded-2xl flex flex-col justify-between cursor-pointer group shadow-soft-sm"
              >
                <div>
                  <div className="relative h-36 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={s.imageUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop'}
                      alt={s.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-warm-950/80 backdrop-blur-md text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {s.category}
                    </span>

                    {/* Interactive Heart Favorite Button */}
                    <motion.button
                      whileTap={{ scale: 1.3 }}
                      onClick={(e) => handleToggleFavorite(s.id, e)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 dark:bg-warm-900/90 backdrop-blur-md shadow-sm text-surface-muted hover:text-rose-500 transition-colors"
                      title={s.isFavorite ? 'Remove Favorite' : 'Save Favorite'}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          s.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                        }`}
                      />
                    </motion.button>
                  </div>

                  <div className="p-4 space-y-1">
                    <h4 className="text-xs font-extrabold text-warm-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">
                      {s.name}
                    </h4>
                    <p className="text-[10px] text-surface-muted truncate flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-brand-500 shrink-0" /> {s.address}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex items-center justify-between pt-3 border-t border-surface-border dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <RatingStars value={Math.round(s.ratingAvg)} readOnly size="sm" />
                      <span className="text-xs font-black text-amber-500">{s.ratingAvg.toFixed(1)} ★</span>
                    </div>
                    <span className="text-[10px] font-bold text-surface-muted">
                      ({s.ratingCount})
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
