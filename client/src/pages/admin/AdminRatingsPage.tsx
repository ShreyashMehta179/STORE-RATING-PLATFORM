import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Rating, Pagination as PaginationType } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { RatingStars } from '../../components/common/RatingStars';
import { toast } from 'sonner';
import { Star, Search, Download, Trash2, ShieldAlert } from 'lucide-react';

export const AdminRatingsPage: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [page, setPage] = useState(1);

  // Deletion Modal
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(ratingFilter && { rating: ratingFilter }),
      });

      const res = await api.get(`/ratings?${params.toString()}`);
      if (res.data.success) {
        setRatings(res.data.data.ratings);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load ratings:', err);
      toast.error('Failed to fetch ratings list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [page, search, ratingFilter]);

  const handleDeleteRating = async () => {
    if (!selectedRating) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/ratings/${selectedRating.id}`);
      if (res.data.success) {
        toast.success('Rating removed & logged into Activity Audit history.');
        setIsDeleteModalOpen(false);
        setSelectedRating(null);
        fetchRatings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete rating');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/ratings/export/csv', '_blank');
    toast.success('Downloading Ratings CSV...');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Platform Rating Moderation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Inspect, filter, and moderate ratings submitted across all registered stores
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search review text, customer, or store..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none w-full md:w-auto"
        >
          <option value="">All Ratings (1-5 Stars)</option>
          <option value="5">5 Stars Only</option>
          <option value="4">4 Stars Only</option>
          <option value="3">3 Stars Only</option>
          <option value="2">2 Stars Only</option>
          <option value="1">1 Star Only</option>
        </select>
      </div>

      {/* Ratings Table */}
      <div className="glass-card rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader count={5} />
          </div>
        ) : ratings.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No Ratings Found"
            description="No ratings match the selected search or star filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Store</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Review Comment</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {ratings.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{r.user?.name}</p>
                        <p className="text-[10px] text-slate-400">{r.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-600 dark:text-brand-400">
                      {r.store?.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <RatingStars value={r.rating} readOnly size="sm" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-300 font-medium">
                      {r.review ? `"${r.review}"` : <span className="italic text-slate-400">No review text</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRating(r);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors inline-flex items-center gap-1 font-bold text-[11px]"
                        title="Delete Rating"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRating}
        title="Moderate & Delete Rating"
        message={`Are you sure you want to remove this ${selectedRating?.rating}-star rating for "${selectedRating?.store?.name}"? The store average will be recalculated.`}
        confirmLabel="Remove Rating"
        isLoading={isDeleting}
      />
    </div>
  );
};
