import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Store, Rating } from '../../types';
import { RatingStars } from '../../components/common/RatingStars';
import { Modal } from '../../components/common/Modal';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'sonner';
import {
  Star,
  Heart,
  MapPin,
  Phone,
  Globe,
  Mail,
  Building,
  UserCheck,
  ChevronLeft,
  MessageSquare,
} from 'lucide-react';

export const StoreDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState<number>(0);

  // Rating modal
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchStoreDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/stores/${id}`);
      if (res.data.success) {
        setStore(res.data.data);
        if (res.data.data.userRating) {
          setRatingScore(res.data.data.userRating);
        }
        if (res.data.data.userReview) {
          setReviewText(res.data.data.userReview);
        }
      }
    } catch (err) {
      console.error('Failed to load store details:', err);
      toast.error('Store not found.');
    } finally {
      setLoading(false);
    }
  };

  const { socket } = useSocket();

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  // Socket listener for real-time rating updates
  useEffect(() => {
    if (!socket || !id) return;

    const handleRatingEvent = (data: any) => {
      if (data.storeId === id) {
        fetchStoreDetails();
      }
    };

    socket.on('rating.created', handleRatingEvent);
    socket.on('rating.updated', handleRatingEvent);
    socket.on('rating.deleted', handleRatingEvent);
    socket.on('store.updated', handleRatingEvent);

    return () => {
      socket.off('rating.created', handleRatingEvent);
      socket.off('rating.updated', handleRatingEvent);
      socket.off('rating.deleted', handleRatingEvent);
      socket.off('store.updated', handleRatingEvent);
    };
  }, [socket, id]);

  const handleToggleFavorite = async () => {
    if (!user || !store) {
      toast.error('Please log in to save favorite stores.');
      return;
    }

    try {
      const res = await api.post(`/favorites/${store.id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setStore((prev) => (prev ? { ...prev, isFavorite: res.data.isFavorite } : null));
      }
    } catch (err) {
      toast.error('Failed to update favorite store');
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !user) return;

    setSubmittingRating(true);
    try {
      let res;
      if (store.userRatingId) {
        // Edit existing rating directly
        res = await api.put(`/ratings/${store.userRatingId}`, {
          rating: ratingScore,
          review: reviewText,
        });
      } else {
        // Submit new rating
        try {
          res = await api.post('/ratings', {
            storeId: store.id,
            rating: ratingScore,
            review: reviewText,
          });
        } catch (err: any) {
          // If duplicate rating exists (409 Conflict), update the existing rating automatically
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
        toast.success(store.userRatingId ? 'Your rating has been updated.' : 'Your rating has been submitted.');
        setIsRateModalOpen(false);
        fetchStoreDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  if (!store) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Store Not Found</h2>
        <Link to="/user/stores" className="text-xs font-bold text-brand-600 hover:underline mt-2 inline-block">
          ← Back to Store Discovery
        </Link>
      </div>
    );
  }

  const distribution = store.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalReviews = store.ratingCount;

  return (
    <div className="space-y-8 pb-12">
      {/* Back Link */}
      <Link
        to="/user/stores"
        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to All Stores
      </Link>

      {/* Hero Banner */}
      <div className="glass-card rounded-3xl overflow-hidden border shadow-xl">
        <div className="relative h-64 sm:h-80 bg-slate-900">
          <img
            src={store.imageUrl}
            alt={store.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider">
            {store.category}
          </span>

          <button
            onClick={handleToggleFavorite}
            className="absolute top-4 right-4 p-3 rounded-full bg-slate-950/60 backdrop-blur-md text-white hover:scale-110 transition-transform"
            title={store.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-5 h-5 ${
                store.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{store.name}</h1>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-2 font-medium">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                {store.address}
              </p>
            </div>

            {user && user.id === store.ownerId ? (
              <div className="px-4 py-2 bg-slate-800/80 text-amber-400 font-bold text-xs rounded-xl border border-slate-700">
                Store Owner (Self-rating disabled)
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!user) {
                    toast.error('Please sign in to submit a rating.');
                    return;
                  }
                  setIsRateModalOpen(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-brand-500/25 transition-all hover:scale-105 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <Star className="w-4 h-4 fill-white" />
                {store.userRating ? 'Edit Your Rating' : 'Submit Rating'}
              </button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-200 dark:border-slate-800">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">About the Store</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {store.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4 text-brand-500" />
                <span>{store.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-brand-500" />
                <span>{store.email}</span>
              </div>
              {store.website && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Globe className="w-4 h-4 text-brand-500" />
                  <a href={store.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline truncate">
                    {store.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Rating Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {store.ratingAvg.toFixed(1)}
              </span>
              <div className="flex justify-center mt-1">
                <RatingStars value={Math.round(store.ratingAvg)} readOnly size="md" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
                Based on {totalReviews} customer rating{totalReviews !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Distribution bars */}
            <div className="space-y-1.5 pt-4">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[stars as keyof typeof distribution] || 0;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                const isSelected = starFilter === stars;
                return (
                  <div
                    key={stars}
                    onClick={() => setStarFilter(isSelected ? 0 : stars)}
                    className={`flex items-center gap-2 text-[11px] font-semibold cursor-pointer p-1 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-12 text-right">{stars} ★</span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-slate-400 font-mono text-[10px]">{count}</span>
                  </div>
                );
              })}
              {starFilter > 0 && (
                <button
                  onClick={() => setStarFilter(0)}
                  className="w-full text-center text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline pt-2"
                >
                  Clear Star Filter (Showing {starFilter}★ Reviews)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="glass-card p-6 rounded-2xl border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Customer Reviews ({starFilter > 0 ? store.ratings?.filter((r) => r.rating === starFilter).length : store.ratings?.length || 0})
            </h3>
          </div>
        </div>

        {store.ratings?.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8 font-medium">
            No reviews yet. Be the first customer to leave feedback!
          </p>
        ) : (
          <div className="space-y-4">
            {store.ratings
              ?.filter((r) => starFilter === 0 || r.rating === starFilter)
              .map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xs">
                        {r.user?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {r.user?.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <RatingStars value={r.rating} readOnly size="sm" />
                  </div>

                  {r.review && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pl-10">
                      "{r.review}"
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <Modal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        title={store.userRating ? `Update Rating for ${store.name}` : `Rate ${store.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitRating} className="space-y-6">
          <div className="text-center py-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
              {store.userRating
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Review Comment (Optional)
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {reviewText.length} / 500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share details of your experience..."
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRateModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRating}
              className="px-6 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 rounded-xl shadow-md cursor-pointer"
            >
              {submittingRating
                ? store.userRating
                  ? 'Updating...'
                  : 'Submitting...'
                : store.userRating
                ? 'Update Rating'
                : 'Submit Rating'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
