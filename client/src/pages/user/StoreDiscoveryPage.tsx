import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Store, Pagination as PaginationType } from '../../types';
import { RatingStars } from '../../components/common/RatingStars';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'sonner';
import {
  Search,
  Star,
  Heart,
  MapPin,
  Grid,
  List,
  Compass,
  ArrowUpDown,
} from 'lucide-react';

export const StoreDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Discovery Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minRating, setMinRating] = useState('0');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  // Rate Modal State
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
        ...(search && { search }),
        ...(category && { category }),
        ...(minRating !== '0' && { minRating }),
        sortBy,
        order,
      });

      const res = await api.get(`/stores?${params.toString()}`);
      if (res.data.success) {
        setStores(res.data.data.stores);
        setCategories(res.data.data.categories);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to discover stores:', err);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const { socket } = useSocket();

  useEffect(() => {
    fetchStores();
  }, [page, search, category, minRating, sortBy, order]);

  // Real-time socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleStoreCreated = (newStore: Store) => {
      toast.info(`A new store has been listed: "${newStore.name}"`);
      fetchStores();
    };

    const handleStoreUpdated = () => fetchStores();
    const handleStoreDeleted = () => fetchStores();
    const handleRatingCreated = () => fetchStores();

    socket.on('store.created', handleStoreCreated);
    socket.on('store.updated', handleStoreUpdated);
    socket.on('store.deleted', handleStoreDeleted);
    socket.on('store.statusChanged', handleStoreUpdated);
    socket.on('rating.created', handleRatingCreated);

    return () => {
      socket.off('store.created', handleStoreCreated);
      socket.off('store.updated', handleStoreUpdated);
      socket.off('store.deleted', handleStoreDeleted);
      socket.off('store.statusChanged', handleStoreUpdated);
      socket.off('rating.created', handleRatingCreated);
    };
  }, [socket]);

  const handleToggleFavorite = async (storeId: string) => {
    if (!user) {
      toast.error('Please log in to save favorite stores.');
      return;
    }

    try {
      const res = await api.post(`/favorites/${storeId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setStores((prev) =>
          prev.map((s) =>
            s.id === storeId ? { ...s, isFavorite: res.data.isFavorite } : s
          )
        );
      }
    } catch (err) {
      toast.error('Failed to update favorite store');
    }
  };

  const openRatingModal = (store: Store) => {
    if (!user) {
      toast.error('Please log in to rate stores.');
      return;
    }
    setSelectedStore(store);
    setRatingScore(store.userRating || 5);
    setReviewText(store.userReview || '');
    setIsRateModalOpen(true);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;

    setSubmittingRating(true);
    try {
      let res;
      const ratingObj = selectedStore.ratings?.find((r) => r.userId === user?.id);
      const ratingId = selectedStore.userRatingId || ratingObj?.id;

      if (ratingId) {
        res = await api.put(`/ratings/${ratingId}`, {
          rating: ratingScore,
          review: reviewText,
        });
      } else {
        try {
          res = await api.post('/ratings', {
            storeId: selectedStore.id,
            rating: ratingScore,
            review: reviewText,
          });
        } catch (err: any) {
          if (err.response?.status === 409 && err.response?.data?.data?.existingRatingId) {
            const existingId = err.response.data.data.existingRatingId;
            res = await api.put(`/ratings/${existingId}`, {
              rating: ratingScore,
              review: reviewText,
            });
          } else {
            throw err;
          }
        }
      }

      if (res.data.success) {
        toast.success(ratingId ? 'Your rating has been updated.' : 'Your rating has been submitted.');
        setIsRateModalOpen(false);
        fetchStores();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-warm-900 dark:text-white tracking-tight">
            Explore Stores
          </h1>
          <p className="text-xs text-surface-muted font-medium mt-1">
            Find places people genuinely recommend.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-warm-900 p-1.5 rounded-xl border border-surface-border shadow-soft-sm self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-brand-500 text-white'
                : 'text-surface-muted hover:bg-warm-100'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-brand-500 text-white'
                : 'text-surface-muted hover:bg-warm-100'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="premium-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-surface-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search stores, categories, locations..."
              className="w-full pl-10 pr-4 py-2.5 bg-warm-100 dark:bg-slate-800/80 border border-surface-border dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-warm-100 dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-xl text-xs font-bold text-warm-900 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={minRating}
            onChange={(e) => {
              setMinRating(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-warm-100 dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-xl text-xs font-bold text-warm-900 dark:text-slate-200 focus:outline-none"
          >
            <option value="0">All Ratings</option>
            <option value="4.5">4.5+ Stars (Top Rated)</option>
            <option value="4.0">4.0+ Stars & Up</option>
            <option value="3.0">3.0+ Stars & Up</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-surface-border text-xs font-medium">
          <span className="text-surface-muted font-semibold">
            {pagination.total} stores found
          </span>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-surface-muted" />
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
                setPage(1);
              }}
              className="bg-transparent font-extrabold text-brand-600 dark:text-brand-400 focus:outline-none"
            >
              <option value="createdAt-desc">Newest Added</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="popularity-desc">Most Reviewed</option>
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Store Grid / List */}
      {loading ? (
        <SkeletonLoader count={6} />
      ) : stores.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No Stores Found"
          description="Try changing your search query or adjusting your filters."
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
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

                  <button
                    onClick={() => handleToggleFavorite(store.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-warm-950/60 backdrop-blur-md text-white hover:scale-110 transition-transform"
                    title={store.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        store.isFavorite ? 'fill-accent-coral text-accent-coral' : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-extrabold text-warm-900 dark:text-white line-clamp-1 mb-1">
                    {store.name}
                  </h3>

                  <p className="text-xs text-surface-muted flex items-center gap-1 mb-3 truncate font-medium">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {store.address}
                  </p>

                  <p className="text-xs text-surface-muted line-clamp-2 mb-4 font-medium">
                    {store.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-center justify-between py-3 border-t border-surface-border mb-4">
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

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/stores/${store.id}`}
                    className="py-2.5 bg-warm-100 dark:bg-slate-800 hover:bg-warm-200 dark:hover:bg-slate-700 text-warm-900 dark:text-slate-200 text-xs font-bold rounded-xl text-center transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => openRatingModal(store)}
                    className="py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    {store.userRating ? 'Edit Rating' : 'Rate Store'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="premium-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={store.imageUrl}
                  alt={store.name}
                  className="w-20 h-20 rounded-xl object-cover border border-surface-border shrink-0"
                />
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-brand-600">
                    {store.category}
                  </span>
                  <h3 className="text-base font-extrabold text-warm-900 dark:text-white">
                    {store.name}
                  </h3>
                  <p className="text-xs text-surface-muted flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {store.address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-surface-border">
                <div className="text-left sm:text-right">
                  <div className="flex items-center gap-1">
                    <RatingStars value={Math.round(store.ratingAvg)} readOnly size="sm" />
                    <span className="text-xs font-bold">{store.ratingAvg.toFixed(1)}</span>
                  </div>
                  <span className="text-[11px] text-surface-muted font-medium">
                    {store.ratingCount} rating{store.ratingCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFavorite(store.id)}
                    className="p-2.5 rounded-xl border border-surface-border text-surface-muted hover:text-accent-coral"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        store.isFavorite ? 'fill-accent-coral text-accent-coral' : ''
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => openRatingModal(store)}
                    className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl"
                  >
                    {store.userRating ? 'Edit Rating' : 'Rate'}
                  </button>

                  <Link
                    to={`/stores/${store.id}`}
                    className="px-4 py-2.5 bg-warm-100 dark:bg-slate-800 text-warm-900 dark:text-slate-200 text-xs font-bold rounded-xl"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="premium-card overflow-hidden">
        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Rate Modal */}
      <Modal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        title={
          selectedStore?.userRating
            ? `Update Rating for ${selectedStore?.name}`
            : `Rate ${selectedStore?.name}`
        }
        maxWidth="md"
      >
        <form onSubmit={handleSubmitRating} className="space-y-6">
          <div className="text-center py-2">
            <p className="text-xs text-surface-muted mb-3 font-medium">
              {selectedStore?.userRating
                ? 'Your current rating:'
                : 'Share your experience with this store. Select 1 to 5 stars:'}
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
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-surface-muted">
                Review Comment (Optional)
              </label>
              <span className="text-[10px] font-mono text-surface-muted">
                {reviewText.length} / 500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share details of your experience..."
              className="w-full px-3.5 py-2.5 bg-warm-100 dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setIsRateModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-surface-muted bg-warm-100 dark:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRating}
              className="px-6 py-2 text-xs font-extrabold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md cursor-pointer"
            >
              {submittingRating
                ? selectedStore?.userRating
                  ? 'Updating...'
                  : 'Submitting...'
                : selectedStore?.userRating
                ? 'Update Rating'
                : 'Submit Rating'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
