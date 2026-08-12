import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { RatingStars } from '../../components/common/RatingStars';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { UserCheck, Star, Search, MessageSquare } from 'lucide-react';

export const OwnerCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await api.get('/analytics/owner');
        if (res.data.success && res.data.data.customers) {
          setCustomers(res.data.data.customers);
        }
      } catch (err) {
        console.error('Failed to load customers feedback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.userName.toLowerCase().includes(search.toLowerCase()) ||
      c.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      (c.review && c.review.toLowerCase().includes(search.toLowerCase()));

    const matchesRating = ratingFilter ? c.rating.toString() === ratingFilter : true;

    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Customer Feedback & Ratings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Detailed list of customers who submitted reviews and ratings for your store
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name, email, or review text..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none w-full md:w-auto"
        >
          <option value="">All Ratings (1-5 Stars)</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader count={5} />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No Customer Ratings Found"
            description="No customer ratings match the current search or rating score filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Rating Given</th>
                  <th className="py-3.5 px-4">Review Text</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 font-bold flex items-center justify-center text-xs">
                          {c.userName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{c.userName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{c.userEmail}</td>
                    <td className="py-3.5 px-4">
                      <RatingStars value={c.rating} readOnly size="sm" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-300 font-medium">
                      {c.review ? `"${c.review}"` : <span className="italic text-slate-400">No review comment</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {new Date(c.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
