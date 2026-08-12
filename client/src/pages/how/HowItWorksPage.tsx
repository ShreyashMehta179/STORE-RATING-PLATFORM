import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Star,
  Share2,
  Building,
  TrendingUp,
  MessageSquare,
  Award,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Users,
  Store,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const CUSTOMER_STEPS = [
  {
    number: '01',
    id: 'discover',
    title: 'Discover',
    icon: Search,
    subtitle: 'Find trusted local businesses near you',
    description:
      'Search stores by category, location, or name. View real rating averages and verified community feedback before visiting.',
    details: [
      'Filter by category, active status, or keyword search',
      'View interactive store location addresses',
      'Compare high-rated stores side by side',
    ],
  },
  {
    number: '02',
    id: 'compare',
    title: 'Compare',
    icon: SlidersHorizontal,
    subtitle: 'Analyze transparent rating distributions',
    description:
      'Inspect detailed rating breakdowns (5-star down to 1-star), customer feedback comments, and operating details.',
    details: [
      'Transparent 1-5 star score averages',
      'Read authentic customer experience reviews',
      'Check store contact & website links',
    ],
  },
  {
    number: '03',
    id: 'rate',
    title: 'Rate',
    icon: Star,
    subtitle: 'Share your genuine customer experience',
    description:
      'Submit a 1 to 5 star rating along with optional feedback text to inform fellow community members.',
    details: [
      'Instant real-time score updates',
      'Simple interactive 1–5 star rating picker',
      'Authentic community accountability',
    ],
  },
  {
    number: '04',
    id: 'share',
    title: 'Share',
    icon: Share2,
    subtitle: 'Help local businesses continuously improve',
    description:
      'Your feedback directly assists store owners in identifying service gaps and upgrading customer satisfaction.',
    details: [
      'Save favorite stores to your dashboard',
      'Track your past ratings and reviews',
      'Guide others toward quality local places',
    ],
  },
];

const OWNER_STEPS = [
  {
    number: '01',
    id: 'claim',
    title: 'Claim & Manage',
    icon: Building,
    subtitle: 'Set up your official store listing',
    description:
      'Update store details, phone numbers, addresses, and banner images from your dedicated Store Owner portal.',
  },
  {
    number: '02',
    id: 'understand',
    title: 'Understand Customers',
    icon: MessageSquare,
    subtitle: 'Gather authentic feedback insights',
    description:
      'Read what customers love and identify areas that need attention to elevate customer retention.',
  },
  {
    number: '03',
    id: 'monitor',
    title: 'Monitor Analytics',
    icon: TrendingUp,
    subtitle: 'Track rating trends over time',
    description:
      'View monthly rating averages, 5-star ratio counts, and ratings growth percentage on visual charts.',
  },
  {
    number: '04',
    id: 'grow',
    title: 'Grow Your Business',
    icon: Award,
    subtitle: 'Turn ratings into reputation',
    description:
      'High rating averages boost store visibility on StoreHub, attracting more customers to your business.',
  },
];

const DEMO_CHART_DATA = [
  { month: 'Jan', average: 3.8, ratings: 12 },
  { month: 'Feb', average: 4.0, ratings: 18 },
  { month: 'Mar', average: 4.2, ratings: 25 },
  { month: 'Apr', average: 4.5, ratings: 34 },
  { month: 'May', average: 4.7, ratings: 48 },
  { month: 'Jun', average: 4.9, ratings: 62 },
];

export const HowItWorksPage: React.FC = () => {
  const [activeCustomerStep, setActiveCustomerStep] = useState(0);
  const [activeOwnerStep, setActiveOwnerStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'customer' | 'owner'>('customer');

  const currentStep = CUSTOMER_STEPS[activeCustomerStep];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-slate-900 to-warm-950 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold uppercase tracking-wider"
          >
            <Zap className="w-4 h-4 text-amber-400" /> Transparent Community Discovery
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
          >
            How <span className="text-brand-400">StoreHub</span> Works
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Discover trusted stores, share real customer experiences, and help local businesses grow through authentic, transparent feedback.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 flex-wrap pt-2"
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
              Create Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Role Toggle Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="max-w-md mx-auto bg-white dark:bg-warm-900 p-1.5 rounded-2xl shadow-soft-lg border border-surface-border dark:border-slate-800 flex items-center">
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'customer'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> For Customers
          </button>
          <button
            onClick={() => setActiveTab('owner')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'owner'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Store className="w-4 h-4" /> For Store Owners
          </button>
        </div>
      </section>

      {/* Customer Journey Section */}
      {activeTab === 'customer' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              The Customer Experience
            </h2>
          </div>

          {/* Interactive Step Switcher Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CUSTOMER_STEPS.map((step, idx) => {
              const isActive = activeCustomerStep === idx;
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveCustomerStep(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-brand-500 text-white border-brand-500 shadow-soft-lg scale-[1.02]'
                      : 'glass-card border-surface-border dark:border-slate-800 hover:border-brand-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black uppercase tracking-wider ${
                        isActive ? 'text-brand-100' : 'text-slate-400'
                      }`}
                    >
                      Step {step.number}
                    </span>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brand-500'}`} />
                  </div>
                  <h3 className={`font-black text-base ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {step.title}
                  </h3>
                </button>
              );
            })}
          </div>

          {/* Animated Step Detail Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-6 sm:p-10 rounded-3xl border border-surface-border dark:border-slate-800 shadow-soft-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 font-bold text-xs">
                  <StepIcon className="w-4 h-4" /> {currentStep.subtitle}
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {currentStep.number}. {currentStep.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {currentStep.description}
                </p>

                <div className="space-y-2.5 pt-2">
                  {currentStep.details.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <CheckCircle className="w-4 h-4 text-brand-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    to="/user/stores"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
                  >
                    Try It Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Visual Demo Card */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Interactive Preview</span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Store className="w-8 h-8 text-brand-400 p-1.5 bg-slate-900 rounded-lg" />
                      <div>
                        <p className="font-bold text-xs">Deccan Brew House</p>
                        <p className="text-[10px] text-slate-400">Cafes & Beverages • Pune</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-amber-400">★ 4.9 (48)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-brand-950/60 border border-brand-800/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-300">Submit Your Rating</span>
                      <div className="flex text-amber-400 gap-1">★ ★ ★ ★ ★</div>
                    </div>
                    <p className="text-[11px] text-slate-300 italic">"Best filter coffee and authentic bun maska in Pune! Exceptional service."</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      )}

      {/* Store Owner Journey Section */}
      {activeTab === 'owner' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              For Business Growth
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              The Store Owner Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {OWNER_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className="glass-card p-6 rounded-3xl border border-surface-border dark:border-slate-800 space-y-4 hover:-translate-y-1 transition-transform"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Step {step.number}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Interactive Recharts Analytics Preview */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-surface-border dark:border-slate-800 shadow-soft-xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Demonstration Dashboard
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                  Owner Analytics & Rating Trends
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200">
                  <TrendingUp className="w-3 h-3" /> +18.4% Rating Growth
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEMO_CHART_DATA}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16803A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16803A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="average" stroke="#16803A" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Why Rating Matters Before/After Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-surface-border dark:border-slate-800 shadow-soft-xl space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Proven Impact
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Why Rating Transparency Matters
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Transparent feedback loops empower businesses to make targeted service improvements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Before Customer Feedback
                </span>
                <span className="text-lg font-black text-rose-700 dark:text-rose-400">3.2 ★</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Unresolved service delays, hidden customer complaints, and unmonitored review channels lead to declining walk-ins.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  After StoreHub Analytics
                </span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">4.6 ★</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Addressing customer feedback promptly, showcasing verified ratings, and optimizing staff response elevates community trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight relative z-10">
            Ready to discover your next favorite place?
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
