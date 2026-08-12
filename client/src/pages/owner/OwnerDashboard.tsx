import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { RatingStars } from '../../components/common/RatingStars';
import {
  Star,
  Building,
  TrendingUp,
  Award,
  Users,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'sonner';

export const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchOwnerAnalytics = async () => {
    try {
      const res = await api.get('/analytics/owner');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load owner analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerAnalytics();
  }, []);

  // Socket listener for real-time customer review feedback
  useEffect(() => {
    if (!socket) return;

    const handleNewRating = (ratingData: any) => {
      toast.success(`New ${ratingData.rating}★ rating received for your store!`);
      fetchOwnerAnalytics();
    };

    socket.on('owner.ratingNew', handleNewRating);
    socket.on('rating.created', handleNewRating);

    return () => {
      socket.off('owner.ratingNew', handleNewRating);
      socket.off('rating.created', handleNewRating);
    };
  }, [socket]);

  const COLORS = ['#F4B740', '#16803A', '#0F5F2D', '#6366F1', '#F43F5E'];

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  if (!data?.hasStore) {
    return (
      <div className="premium-card p-12 text-center max-w-lg mx-auto">
        <Building className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-warm-900 dark:text-white">No Store Assigned Yet</h2>
        <p className="text-xs text-surface-muted mt-2 font-medium">
          Please contact system administrator to link your store owner account to a store listing.
        </p>
      </div>
    );
  }

  const { store, stats, ratingDistribution, monthlyTrends, recentActivity } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="premium-card p-8 bg-gradient-to-r from-brand-700 to-brand-600 text-white relative overflow-hidden shadow-soft-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-100 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              Store Owner Portal
            </span>
            <h1 className="text-3xl font-black tracking-tight mt-3">{store?.name}</h1>
            <p className="text-xs text-brand-100 mt-1 font-medium">{store?.category} • {store?.address}</p>
          </div>

          {stats?.ratingImprovementPct !== 0 && (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-100 block">
                Monthly Performance Summary
              </span>
              <p className="text-lg font-black text-white mt-0.5">
                {stats?.ratingImprovementPct >= 0 ? '+' : ''}
                {stats?.ratingImprovementPct}% Rating Improvement
              </p>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Average Store Rating"
          value={`${stats?.avgRating || 0}★`}
          icon={Star}
          change={`${stats?.ratingImprovementPct >= 0 ? '+' : ''}${stats?.ratingImprovementPct}% vs last mo`}
          changeType={stats?.ratingImprovementPct >= 0 ? 'positive' : 'negative'}
          description="Calculated from real customer feedback"
          color="amber"
        />
        <StatCard
          title="Total Ratings"
          value={stats?.totalRatings || 0}
          icon={Users}
          description="Cumulative reviews received"
          color="brand"
        />
        <StatCard
          title="5-Star Ratings"
          value={stats?.fiveStarCount || 0}
          icon={Award}
          description="Top tier customer scores"
          color="emerald"
        />
        <StatCard
          title="Ratings This Month"
          value={stats?.ratingsThisMonth || 0}
          icon={Calendar}
          description="Recent feedback activity"
          color="indigo"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Breakdown Donut Chart */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-warm-900 dark:text-white">
                Rating Distribution
              </h3>
              <p className="text-xs text-surface-muted font-medium">
                Customer star score distribution
              </p>
            </div>
            <Star className="w-5 h-5 text-amber-500" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratingDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ratingDistribution?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151A17',
                    borderColor: '#E3E8E2',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Ratings Bar Chart */}
        <div className="lg:col-span-2 premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-warm-900 dark:text-white">
                Monthly Rating Volume & Average
              </h3>
              <p className="text-xs text-surface-muted font-medium">
                Historical ratings trend over past 6 months
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#5F6861" fontSize={11} />
                <YAxis stroke="#5F6861" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151A17',
                    borderColor: '#E3E8E2',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="ratings" name="Total Ratings" fill="#16803A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Customer Feedback */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-warm-900 dark:text-white">
              Recent Customer Ratings & Reviews
            </h3>
            <p className="text-xs text-surface-muted font-medium">
              Latest feedback submitted for {store?.name}
            </p>
          </div>

          <Link
            to="/owner/customers"
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            View All Customer Feedback →
          </Link>
        </div>

        <div className="space-y-3">
          {recentActivity?.map((act: any) => (
            <div
              key={act.id}
              className="p-4 rounded-xl bg-warm-100 dark:bg-slate-800/50 border border-surface-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-xs">
                  {act.userName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-warm-900 dark:text-white">{act.userName}</p>
                    <span className="text-[10px] text-surface-muted font-semibold">({act.userEmail})</span>
                  </div>
                  {act.review ? (
                    <p className="text-xs text-surface-muted font-medium italic mt-0.5">
                      "{act.review}"
                    </p>
                  ) : (
                    <span className="text-[11px] text-surface-muted italic">No review text</span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <RatingStars value={act.rating} readOnly size="sm" />
                <span className="text-[10px] text-surface-muted font-semibold mt-1 block">
                  {new Date(act.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
