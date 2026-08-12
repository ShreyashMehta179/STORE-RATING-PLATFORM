import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Store, Pagination as PaginationType } from '../../types';
import { RatingStars } from '../../components/common/RatingStars';
import { Pagination } from '../../components/common/Pagination';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { toast } from 'sonner';
import { Heart, MapPin, Compass } from 'lucide-react';

export const UserFavoritesPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/favorites?page=${page}&limit=9`);
      if (res.data.success) {
        setStores(res.data.data.stores);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [page]);

  const handleRemoveFavorite = async (storeId: string) => {
    try {
      const res = await api.post(`/favorites/${storeId}`);
      if (res.data.success) {
        toast.success('Removed from favorites');
        fetchFavorites();
      }
    } catch (err) {
      toast.error('Failed to update favorites');
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
          My Saved Favorite Stores ❤️
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Quickly access your bookmarked stores for repeat visits and ratings
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={3} />
      ) : stores.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No Favorite Stores Saved Yet"
          description="Click the heart icon on any store card to save it to your personal favorites list."
          actionLabel="Explore Stores Now"
          onAction={() => (window.location.href = '/user/stores')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <motion.div
              key={store.id}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl overflow-hidden border flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={store.imageUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFavorite(store.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/60 backdrop-blur-md text-rose-500 hover:scale-110 transition-transform"
                    title="Remove from favorites"
                  >
                    <Heart className="w-4 h-4 fill-rose-500" />
                  </button>
                </div>

                <div className="p-5">
                  <span className="text-[10px] font-extrabold uppercase text-brand-600 dark:text-brand-400">
                    {store.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                    {store.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {store.address}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-1">
                    <RatingStars value={Math.round(store.ratingAvg)} readOnly size="sm" />
                    <span className="text-xs font-bold">{store.ratingAvg.toFixed(1)}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    ({store.ratingCount})
                  </span>
                </div>

                <Link
                  to={`/stores/${store.id}`}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl text-center block shadow-md"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {stores.length > 0 && (
        <div className="glass-card rounded-2xl border overflow-hidden">
          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </motion.div>
  );
};
