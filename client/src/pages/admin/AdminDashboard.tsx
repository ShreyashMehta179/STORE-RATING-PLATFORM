import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import {
  Users,
  Store,
  Star,
  Building,
  TrendingUp,
  Award,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/admin?range=${timeRange}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const COLORS = ['#16803A', '#0F5F2D', '#F4B740', '#6366F1', '#F43F5E'];

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  const { stats, ratingDistribution, ratingTrends, roleDistribution, topRatedStores, mostRatedStores } =
    data || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-warm-900 dark:text-white tracking-tight">
            Platform Analytics & Overview
          </h1>
          <p className="text-xs text-surface-muted font-medium mt-1">
            Real-time aggregate insights from PostgreSQL database
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white dark:bg-warm-900 p-1.5 rounded-xl border border-surface-border dark:border-slate-800 shadow-soft-sm">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                timeRange === range
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-surface-muted hover:bg-warm-100 dark:hover:bg-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Customers"
          value={stats?.totalUsers || 0}
          icon={Users}
          description="Registered normal users"
          color="brand"
        />
        <StatCard
          title="Total Stores"
          value={stats?.totalStores || 0}
          icon={Store}
          description="Active listed stores"
          color="emerald"
        />
        <StatCard
          title="Store Owners"
          value={stats?.totalStoreOwners || 0}
          icon={Building}
          description="Registered store owners"
          color="indigo"
        />
        <StatCard
          title="Platform Ratings"
          value={stats?.totalRatings || 0}
          icon={Star}
          change={`${stats?.platformAvgRating || 0}★ Avg`}
          changeType="positive"
          description="Total customer reviews"
          color="amber"
        />
      </div>

      {/* Charts Grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Trends Line Chart */}
        <div className="lg:col-span-2 premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-warm-900 dark:text-white">
                Rating Submissions Over Time
              </h3>
              <p className="text-xs text-surface-muted font-medium">
                Volume of customer reviews received
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-500" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingTrends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" stroke="#5F6861" fontSize={11} />
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
                <Line
                  type="monotone"
                  dataKey="ratings"
                  name="Ratings Submitted"
                  stroke="#16803A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#16803A' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution Bar Chart */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-warm-900 dark:text-white">
                Rating Breakdown
              </h3>
              <p className="text-xs text-surface-muted font-medium">
                Distribution across 1 to 5 stars
              </p>
            </div>
            <Star className="w-5 h-5 text-amber-500" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" stroke="#5F6861" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#5F6861" fontSize={11} width={65} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151A17',
                    borderColor: '#E3E8E2',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Count" fill="#F4B740" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Rated Stores */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-warm-900 dark:text-white">
                Highest Rated Stores
              </h3>
              <p className="text-xs text-surface-muted font-medium">
                Top stores by customer average rating
              </p>
            </div>
            <Award className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-3">
            {topRatedStores?.map((store: any, idx: number) => (
              <div key={store.id} className="flex items-center justify-between p-3 rounded-xl bg-warm-100 dark:bg-slate-800/60 border border-surface-border">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 font-extrabold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-warm-900 dark:text-white line-clamp-1">
                      {store.name}
                    </h4>
                    <span className="text-[10px] text-surface-muted font-semibold">{store.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-accent-softGold text-amber-700 px-2 py-1 rounded-lg text-xs font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {store.ratingAvg.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Rated Stores */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-warm-900 dark:text-white">
                Most Reviewed Stores
              </h3>
              <p className="text-xs text-surface-muted font-medium">
                Stores with highest feedback volume
              </p>
            </div>
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostRatedStores}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#5F6861" fontSize={10} tickFormatter={(v) => v.split(' ')[0]} />
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
                <Bar dataKey="ratingCount" name="Reviews" fill="#16803A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Role Distribution */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-warm-900 dark:text-white">
                Platform Role Composition
              </h3>
              <p className="text-xs text-surface-muted font-medium">
                Admins vs Owners vs Customers
              </p>
            </div>
            <Users className="w-5 h-5 text-brand-500" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleDistribution?.map((entry: any, index: number) => (
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
      </div>
    </div>
  );
};
