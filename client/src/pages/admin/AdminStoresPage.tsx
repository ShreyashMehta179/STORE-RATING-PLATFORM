import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Store, User, Pagination as PaginationType } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { RatingStars } from '../../components/common/RatingStars';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'sonner';
import {
  Store as StoreIcon,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  Building,
  Globe,
  Phone,
} from 'lucide-react';

export const AdminStoresPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await api.get(`/stores?${params.toString()}`);
      if (res.data.success) {
        setStores(res.data.data.stores);
        setCategories(res.data.data.categories);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
      toast.error('Failed to fetch stores list');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await api.get('/users?role=STORE_OWNER&limit=100');
      if (res.data.success) {
        setOwners(res.data.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch store owners:', err);
    }
  };

  const { socket } = useSocket();

  useEffect(() => {
    fetchStores();
    fetchOwners();
  }, [page, search, categoryFilter, statusFilter]);

  // Real-time socket event listeners for Admin Store Management
  useEffect(() => {
    if (!socket) return;

    const handleEvent = () => fetchStores();

    socket.on('store.created', handleEvent);
    socket.on('store.updated', handleEvent);
    socket.on('store.deleted', handleEvent);
    socket.on('store.statusChanged', handleEvent);
    socket.on('rating.created', handleEvent);

    return () => {
      socket.off('store.created', handleEvent);
      socket.off('store.updated', handleEvent);
      socket.off('store.deleted', handleEvent);
      socket.off('store.statusChanged', handleEvent);
      socket.off('rating.created', handleEvent);
    };
  }, [socket]);

  const formatOwnerOption = (user: User) => {
    const cleanName = user.name.replace(/\s*[\-–—]\s*Store Owner$/i, '').trim();
    return `${cleanName} – Store Owner`;
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const res = await api.post('/stores', {
        name,
        email,
        address,
        ownerId,
        description,
        category,
        phone,
        website: website || undefined,
        imageUrl: imageUrl || undefined,
        isActive,
      });

      if (res.data.success) {
        toast.success('Store created successfully!');
        setIsAddModalOpen(false);
        resetForm();
        fetchStores();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;
    setFormSubmitting(true);

    try {
      const res = await api.put(`/stores/${selectedStore.id}`, {
        name,
        email,
        address,
        ownerId,
        description,
        category,
        phone,
        website,
        imageUrl,
      });

      if (res.data.success) {
        toast.success('Store updated successfully!');
        setIsEditModalOpen(false);
        setSelectedStore(null);
        resetForm();
        fetchStores();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update store');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (store: Store) => {
    try {
      const res = await api.patch(`/stores/${store.id}/status`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchStores();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteStore = async () => {
    if (!selectedStore) return;
    setFormSubmitting(true);
    try {
      const res = await api.delete(`/stores/${selectedStore.id}`);
      if (res.data.success) {
        toast.success('Store deleted successfully!');
        setIsDeleteModalOpen(false);
        setSelectedStore(null);
        fetchStores();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete store');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openEditModal = (store: Store) => {
    fetchOwners();
    setSelectedStore(store);
    setName(store.name);
    setEmail(store.email);
    setAddress(store.address);
    setOwnerId(store.ownerId);
    setDescription(store.description);
    setCategory(store.category);
    setPhone(store.phone);
    setWebsite(store.website || '');
    setImageUrl(store.imageUrl || '');
    setIsActive(store.isActive);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setAddress('');
    setOwnerId(owners.length > 0 ? owners[0].id : '');
    setDescription('');
    setCategory('Restaurants & Dining');
    setPhone('');
    setWebsite('');
    setImageUrl('');
    setIsActive(true);
  };

  const handleExportCSV = () => {
    window.open('/api/stores/export/csv', '_blank');
    toast.success('Downloading Stores CSV...');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Store Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Create, configure, and assign store owners across platform listings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={() => {
              fetchOwners();
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white text-xs font-extrabold rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Store
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
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
            placeholder="Search store name, category, or address..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Disabled Only</option>
          </select>
        </div>
      </div>

      {/* Stores Table */}
      <div className="glass-card rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader count={5} />
          </div>
        ) : stores.length === 0 ? (
          <EmptyState
            icon={StoreIcon}
            title="No Stores Found"
            description="No stores match the current filter criteria."
          />
        ) : (
          <div className="w-full">
            {/* Desktop CSS Grid Header (>= 768px) */}
            <div
              className="hidden md:grid gap-4 xl:gap-5 py-4 px-5 sm:px-6 bg-slate-100/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs tracking-wider uppercase items-center"
              style={{ gridTemplateColumns: '2.4fr 1.15fr 1.45fr 1.15fr 100px 85px' }}
            >
              <div>STORE</div>
              <div>CATEGORY</div>
              <div>ASSIGNED OWNER</div>
              <div>RATING SUMMARY</div>
              <div className="text-center">STATUS</div>
              <div className="text-center">ACTIONS</div>
            </div>

            {/* Desktop Data Rows (>= 768px) */}
            <div className="hidden md:block divide-y divide-slate-100 dark:divide-slate-800/80">
              {stores.map((store) => {
                const ownerName = store.owner?.name
                  ? store.owner.name.replace(/\s*[\-–—]\s*Store Owner$/i, '').trim()
                  : 'Unassigned';

                return (
                  <div
                    key={store.id}
                    className="grid gap-4 xl:gap-5 py-4 px-5 sm:px-6 items-center hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors text-xs min-h-[76px]"
                    style={{ gridTemplateColumns: '2.4fr 1.15fr 1.45fr 1.15fr 100px 85px' }}
                  >
                    {/* STORE */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={store.imageUrl}
                        alt={store.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 shadow-2xs"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 leading-[20px]" title={store.name}>
                          {store.name}
                        </p>
                        <p className="text-[12px] text-slate-400 dark:text-slate-500 truncate leading-[18px] mt-0.5" title={store.address}>
                          {store.address}
                        </p>
                      </div>
                    </div>

                    {/* CATEGORY */}
                    <div className="min-w-0">
                      <span
                        className="inline-block px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-[9px] text-[11px] truncate max-w-full"
                        title={store.category}
                      >
                        {store.category}
                      </span>
                    </div>

                    {/* ASSIGNED OWNER */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Building className="w-[18px] h-[18px] text-amber-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate leading-[20px]" title={ownerName}>
                          {ownerName}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-[18px]" title={store.owner?.email || ''}>
                          {store.owner?.email || ''}
                        </p>
                      </div>
                    </div>

                    {/* RATING SUMMARY */}
                    <div className="flex items-center gap-2 min-w-0">
                      <RatingStars value={Math.round(store.ratingAvg)} readOnly size="sm" />
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs ml-0.5 shrink-0">
                        {store.ratingAvg.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold shrink-0">
                        ({store.ratingCount})
                      </span>
                    </div>

                    {/* STATUS */}
                    <div className="flex items-center justify-center min-w-0">
                      <button
                        onClick={() => handleToggleStatus(store)}
                        className={`inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                          store.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title="Toggle store active status"
                      >
                        {store.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {store.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-center gap-3 shrink-0">
                      <button
                        onClick={() => openEditModal(store)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title="Edit Store"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStore(store);
                          setIsDeleteModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Delete Store"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile View (< 768px) */}
            <div className="block md:hidden space-y-3 p-3">
              {stores.map((store) => {
                const ownerName = store.owner?.name
                  ? store.owner.name.replace(/\s*[\-–—]\s*Store Owner$/i, '').trim()
                  : 'Unassigned';

                return (
                  <div
                    key={store.id}
                    className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={store.imageUrl}
                          alt={store.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight">
                            {store.name}
                          </h3>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-md text-[10px]">
                            {store.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(store)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Store"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStore(store);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Store"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 text-xs border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <Building className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{ownerName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{store.owner?.email || ''}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleStatus(store)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          store.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {store.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {store.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <RatingStars value={Math.round(store.ratingAvg)} readOnly size="sm" />
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {store.ratingAvg.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">({store.ratingCount})</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate pt-0.5" title={store.address}>
                      {store.address}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Add Store Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Store Listing" maxWidth="lg">
        <form onSubmit={handleCreateStore} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Store Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Deccan Brew House"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Cafes & Beverages, Restaurants & Dining"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Store Contact Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@storehub.com"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>

          {/* Full-Width Assign Store Owner Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Assign Store Owner
            </label>
            <select
              required
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-xs"
            >
              <option value="">Select Store Owner...</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {formatOwnerOption(o)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Store Physical Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="FC Road, Shivajinagar, Pune, Maharashtra 411004"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Authentic local cafe serving freshly brewed filter coffee, masala chai, and fresh snacks..."
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.in"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md cursor-pointer"
            >
              {formSubmitting ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Store Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Store Profile" maxWidth="lg">
        <form onSubmit={handleUpdateStore} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Store Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Store Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>

          {/* Full-Width Store Owner Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Assign Store Owner
            </label>
            <select
              required
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-xs"
            >
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {formatOwnerOption(o)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Phone
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-[#E3E8E2] dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>
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
              disabled={formSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md cursor-pointer"
            >
              {formSubmitting ? 'Saving...' : 'Update Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Store Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteStore}
        title="Delete Store Listing"
        message={`Are you sure you want to permanently delete "${selectedStore?.name}"? All associated rating history will be removed.`}
        confirmLabel="Delete Store"
        isLoading={formSubmitting}
      />
    </div>
  );
};

