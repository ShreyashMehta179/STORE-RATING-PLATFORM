import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';
import { StoreHubLogo } from '../../components/StoreHubLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Star,
  BarChart3,
  Store,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import heroStoreImage from '../../assets/login-store.png';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [submittingForgot, setSubmittingForgot] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  const liveReviews = [
    {
      id: 1,
      name: 'Aarav Mehta',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      rating: 5,
      comment: 'Great service and delicious filter coffee! ☕',
      badge: '★★★★★ 4.9',
    },
    {
      id: 2,
      name: 'Ananya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      rating: 5,
      comment: 'Beautiful ambience and amazing Maharashtrian thali!',
      badge: '★★★★★ 5.0',
    },
    {
      id: 3,
      name: 'Rohan Patil',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      rating: 4.5,
      comment: 'Excellent service and a great family experience.',
      badge: '★★★★☆ 4.5',
    },
    {
      id: 4,
      name: 'Priya Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
      rating: 4.9,
      comment: 'One of my favourite places in Pune! ★★★★★',
      badge: '★★★★★ 4.9',
    },
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % liveReviews.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);
        toast.success(`Welcome back, ${user.name}!`);

        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (user.role === 'STORE_OWNER') {
          navigate('/owner/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Invalid email or password credentials.';
      setErrorMsg(message);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setSubmittingForgot(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success(res.data.message || 'Password reset link sent to your email.');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setSubmittingForgot(false);
    }
  };

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
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const currentReview = liveReviews[activeReviewIndex];

  return (
    <div className="min-h-screen h-[100dvh] lg:h-[100dvh] lg:overflow-hidden overflow-y-auto bg-[#FCFBF7] dark:bg-warm-950 text-[#151A17] dark:text-white flex flex-col justify-between relative selection:bg-brand-500 selection:text-white">
      {/* Background Decorative Pattern & Soft Glow */}
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.06] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Navigation */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3.5 pb-1 relative z-10 shrink-0">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-xl p-1"
          >
            <StoreHubLogo size="sm" />
            <span className="text-lg font-extrabold tracking-tight">
              Store<span className="text-brand-500">Hub</span>
            </span>
          </Link>
        </motion.div>
      </header>

      {/* Main Grid Container — Viewport Constrained on Desktop */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 lg:py-3 relative z-10 my-auto flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* ================= LEFT SIDE: BRAND & TRUST EXPERIENCE ================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6 flex flex-col justify-between h-full min-h-0 py-1"
        >
          <div className="space-y-2.5 sm:space-y-3 shrink-0">
            {/* Trust Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100/80 dark:bg-brand-950/70 border border-brand-200/80 dark:border-brand-900/60 text-brand-700 dark:text-brand-300 text-[11px] font-bold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                <span>Trusted by 10,000+ users</span>
              </div>
            </motion.div>

            {/* Welcome Heading */}
            <motion.div variants={itemVariants} className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#151A17] dark:text-white tracking-tight leading-[1.18]">
                Welcome Back! <br />
                Let's continue{' '}
                <span className="text-brand-500 font-extrabold underline decoration-brand-200 dark:decoration-brand-900 underline-offset-4">
                  your journey
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#5F6861] dark:text-slate-300 max-w-md leading-relaxed font-normal">
                Sign in to discover amazing stores, share experiences, and help others make better, more informed choices.
              </p>
            </motion.div>

            {/* 3 Compact Feature Rows */}
            <motion.div variants={itemVariants} className="space-y-2 pt-1">
              {/* Feature 1 */}
              <motion.div
                whileHover={{ x: 3, y: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/70 dark:bg-warm-900/50 border border-[#E3E8E2]/70 dark:border-slate-800/60 backdrop-blur-sm shadow-soft-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EC] dark:bg-brand-950/80 text-brand-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#151A17] dark:text-white">Discover trusted stores</h2>
                  <p className="text-[11px] text-[#5F6861] dark:text-slate-400 font-medium">Find top-rated local stores and businesses near you</p>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                whileHover={{ x: 3, y: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/70 dark:bg-warm-900/50 border border-[#E3E8E2]/70 dark:border-slate-800/60 backdrop-blur-sm shadow-soft-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EC] dark:bg-brand-950/80 text-brand-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Star className="w-4 h-4 fill-brand-500/30 text-brand-500" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#151A17] dark:text-white">Rate & share experiences</h2>
                  <p className="text-[11px] text-[#5F6861] dark:text-slate-400 font-medium">Your honest reviews help the community make great decisions</p>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                whileHover={{ x: 3, y: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/70 dark:bg-warm-900/50 border border-[#E3E8E2]/70 dark:border-slate-800/60 backdrop-blur-sm shadow-soft-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EAF6EC] dark:bg-brand-950/80 text-brand-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#151A17] dark:text-white">Store analytics dashboard</h2>
                  <p className="text-[11px] text-[#5F6861] dark:text-slate-400 font-medium">Store owners can track feedback, ratings, and grow business</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Flexible Hero Image Container — Interactive Live Ratings System */}
          <motion.div
            variants={itemVariants}
            className="mt-3 flex-1 min-h-[150px] max-h-[250px] lg:max-h-[290px] relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-soft-md border border-[#E3E8E2] dark:border-slate-800 hidden sm:block group"
          >
            <img
              src={heroStoreImage}
              alt="StoreHub Community Store"
              className="w-full h-full object-cover object-center group-hover:scale-[1.015] group-hover:brightness-[1.02] transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* FLOATING STAR PARTICLE ACCENTS */}
            <motion.span
              animate={{ opacity: [0.3, 0.9, 0.3], y: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-4 left-6 text-amber-300 font-mono text-xs pointer-events-none drop-shadow-sm"
            >
              ✦
            </motion.span>
            <motion.span
              animate={{ opacity: [0.2, 0.8, 0.2], y: [2, -3, 2] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1, ease: 'easeInOut' }}
              className="absolute top-10 right-10 text-amber-400 font-mono text-sm pointer-events-none drop-shadow-sm"
            >
              ★
            </motion.span>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4], y: [-3, 1, -3] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
              className="absolute bottom-16 left-8 text-amber-200 font-mono text-[10px] pointer-events-none drop-shadow-sm"
            >
              ✧
            </motion.span>

            {/* FLOATING TOP RATING BADGE (TOP RIGHT) */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-3.5 right-3.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-warm-900/90 backdrop-blur-md border border-amber-200/80 dark:border-amber-900/60 shadow-soft-sm text-amber-600 dark:text-amber-400 text-[11px] font-extrabold flex items-center gap-1.5 pointer-events-none"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{currentReview.badge}</span>
            </motion.div>

            {/* DYNAMIC SEQUENTIAL REVIEW NOTIFICATION CARD (ANIMATED FLOATING FLOW) */}
            <div className="absolute top-3 left-3.5 max-w-[240px] pointer-events-none z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white/95 dark:bg-warm-900/95 backdrop-blur-md p-2.5 rounded-xl border border-brand-200/80 dark:border-brand-900/60 shadow-soft-md flex items-center gap-2.5"
                >
                  <img
                    src={currentReview.avatar}
                    alt={currentReview.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-[#151A17] dark:text-white truncate">
                        {currentReview.name}
                      </span>
                      <div className="flex items-center text-amber-400">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                      </div>
                    </div>
                    <p className="text-[10px] text-[#5F6861] dark:text-slate-300 font-medium truncate leading-tight mt-0.5">
                      "{currentReview.comment}"
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating Community Card pinned inside bottom image bounds */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ y: -2 }}
              className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-white/95 dark:bg-warm-900/95 backdrop-blur-md p-2.5 rounded-xl border border-[#E3E8E2] dark:border-slate-800 shadow-soft-md flex items-center gap-2.5 transition-all"
            >
              <div className="flex -space-x-2 shrink-0">
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-warm-900 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar 1"
                />
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-warm-900 object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar 2"
                />
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-warm-900 object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar 3"
                />
                <div className="w-7 h-7 rounded-full bg-brand-500 text-white font-extrabold text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-warm-900">
                  10K+
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#151A17] dark:text-white leading-tight">
                  Join 10,000+ happy users
                </p>
                <p className="text-[10px] text-[#5F6861] dark:text-slate-400 font-medium">
                  active on StoreHub this month
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>


        {/* ================= RIGHT SIDE: COMPACT PREMIUM LOGIN CARD ================= */}
        <div className="lg:col-span-6 flex items-center justify-center lg:justify-end h-full min-h-0 py-1">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full max-w-[520px] bg-white dark:bg-warm-900 border border-[#E3E8E2] dark:border-slate-800 rounded-2xl lg:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-soft-xl flex flex-col justify-center ${
              isShaking ? 'animate-shake' : ''
            }`}
          >
            {/* Top Store Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="mb-3"
            >
              <StoreHubLogo size="lg" />
            </motion.div>

            {/* Header Title */}
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#151A17] dark:text-white tracking-tight">
                Sign In to <span className="text-brand-500">StoreHub</span>
              </h2>
              <p className="text-xs text-[#5F6861] dark:text-slate-400 mt-0.5 font-medium">
                Single login for Administrators, Store Owners & Customers
              </p>
            </div>

            {/* Inline Error Alert */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 14 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6861] dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5F6861] dark:text-slate-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FCFBF7] dark:bg-slate-800/90 border border-[#E3E8E2] dark:border-slate-700 hover:border-brand-400 dark:hover:border-slate-600 rounded-xl text-xs font-medium text-[#151A17] dark:text-white placeholder-[#5F6861]/60 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6861] dark:text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5F6861] dark:text-slate-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FCFBF7] dark:bg-slate-800/90 border border-[#E3E8E2] dark:border-slate-700 hover:border-brand-400 dark:hover:border-slate-600 rounded-xl text-xs font-medium text-[#151A17] dark:text-white placeholder-[#5F6861]/60 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F6861] hover:text-[#151A17] dark:text-slate-400 dark:hover:text-white p-1 rounded-md transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#E3E8E2] text-brand-500 focus:ring-brand-500 accent-brand-500 cursor-pointer"
                  />
                  <span className="font-semibold text-[#5F6861] dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:underline transition-colors focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Sign In Button */}
              <motion.button
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider Line */}
            <div className="my-5 border-t border-[#E3E8E2] dark:border-slate-800" />

            {/* Register Link */}
            <div className="text-center text-xs text-[#5F6861] dark:text-slate-400 font-medium">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 underline decoration-brand-500/30 hover:decoration-brand-500 transition-all"
              >
                Register here
              </Link>
            </div>
          </motion.div>
        </div>

      </main>

      {/* Footer Security Notice */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-2 relative z-10 text-center shrink-0">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5F6861] dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          <span>Your account is protected with secure authentication.</span>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-warm-900 border border-[#E3E8E2] dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-soft-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-500 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#151A17] dark:text-white mb-1">Reset Your Password</h3>
              <p className="text-xs text-[#5F6861] dark:text-slate-300 leading-relaxed mb-4">
                Enter your email address below and we'll dispatch password recovery instructions to your inbox.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6861] dark:text-slate-400 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. user@domain.com"
                    className="w-full px-3.5 py-2.5 bg-[#FCFBF7] dark:bg-slate-800 border border-[#E3E8E2] dark:border-slate-700 rounded-xl text-xs font-medium text-[#151A17] dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E3E8E2] dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-bold text-[#5F6861] bg-[#FCFBF7] dark:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingForgot}
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    {submittingForgot ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
