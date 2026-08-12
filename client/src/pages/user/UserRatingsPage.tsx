import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Rating, Pagination as PaginationType } from '../../types';
import { RatingStars } from '../../components/common/RatingStars';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { toast } from 'sonner';
import { Star, Edit2, Trash2, History } from 'lucide-react';

export const UserRatingsPage: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Edit / Delete Modal State
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserRatings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ratings/user?page=${page}&limit=10`);
      if (res.data.success) {
        setRatings(res.data.data.ratings);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load user ratings history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRatings();
  }, [page]);

  const openEditModal = (rating: Rating) => {
    setSelectedRating(rating);
    setRatingScore(rating.rating);
    setReviewText(rating.review || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating) return;
    setIsSubmitting(true);

    try {
      const res = await api.put(`/ratings/${selectedRating.id}`, {
        rating: ratingScore,
        review: reviewText,
      });

      if (res.data.success) {
        toast.success('Rating updated successfully!');
        setIsEditModalOpen(false);
        setSelectedRating(null);
        fetchUserRatings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!selectedRating) return;
    setIsSubmitting(true);
    try {
      const res = await api.delete(`/ratings/${selectedRating.id}`);
      if (res.data.success) {
        toast.success('Rating deleted successfully.');
        setIsDeleteModalOpen(false);
        setSelectedRating(null);
        fetchUserRatings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          My Submitted Rating History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Review, edit, or delete feedback submitted across stores
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={4} />
      ) : ratings.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Ratings Submitted Yet"
          description="Explore registered stores and share your ratings to build community trust."
          actionLabel="Discover Stores"
          onAction={() => (window.location.href = '/user/stores')}
        />
      ) : (
        <div className="glass-card rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Store</th>
                  <th className="py-3.5 px-4">Your Score</th>
                  <th className="py-3.5 px-4">Review Comment</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {ratings.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.store?.imageUrl}
                          alt={r.store?.name}
                          className="w-9 h-9 rounded-xl object-cover border shrink-0"
                        />
                        <div>
                          <Link
                            to={`/stores/${r.storeId}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-brand-600"
                          >
                            {r.store?.name}
                          </Link>
                          <p className="text-[10px] text-slate-400">{r.store?.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <RatingStars value={r.rating} readOnly size="sm" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-300 font-medium">
                      {r.review ? `"${r.review}"` : <span className="italic text-slate-400">No review text</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(r.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Rating"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRating(r);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Rating"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Edit Rating Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Rating for ${selectedRating?.store?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdateRating} className="space-y-6">
          <div className="text-center py-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
              Update rating score (1-5 stars):
            </p>
            <div className="flex justify-center">
              <RatingStars
                value={ratingScore}
                onChange={(val) => setRatingScore(val)}
                size="xl"
                showLabel
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Review Comment
            </label>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 rounded-xl shadow-md"
            >
              {isSubmitting ? 'Saving...' : 'Update Rating'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRating}
        title="Delete Rating"
        message={`Are you sure you want to delete your rating for "${selectedRating?.store?.name}"?`}
        confirmLabel="Delete Rating"
        isLoading={isSubmitting}
      />
    </motion.div>
  );
};
