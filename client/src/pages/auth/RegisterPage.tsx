import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';
import { StoreHubLogo } from '../../components/StoreHubLogo';
import {
  Store,
  Mail,
  Lock,
  User as UserIcon,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { Role } from '../../types';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<Role>('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (name.length < 20 || name.length > 60) {
      errs.name = 'Name must be between 20 and 60 characters long';
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errs.email = 'Please enter a valid email address';
    }

    if (password.length < 8 || password.length > 16) {
      errs.password = 'Password must be 8–16 characters long';
    } else if (!/[A-Z]/.test(password)) {
      errs.password = 'Password must contain at least one uppercase letter';
    } else if (!/[^a-zA-Z0-9]/.test(password)) {
      errs.password = 'Password must contain at least one special character';
    }

    if (!address || address.length > 400) {
      errs.address = 'Address is required and must not exceed 400 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        address,
        role,
      });

      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);
        toast.success('Registration successful! Welcome to StoreHub.');

        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (user.role === 'STORE_OWNER') {
          navigate('/owner/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      if (err.response?.data?.errors) {
        const serverErrs: { [key: string]: string } = {};
        err.response.data.errors.forEach((e: any) => {
          if (e.path && e.path[0]) {
            serverErrs[e.path[0]] = e.message;
          }
        });
        setErrors(serverErrs);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-white py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg premium-card p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <StoreHubLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Create StoreHub Account</h1>
          <p className="text-xs text-surface-muted mt-1 font-medium">
            Join StoreHub as a Customer or Store Owner
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Role */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-surface-muted mb-1.5">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'USER'
                    ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'border-surface-border text-surface-muted hover:bg-warm-100'
                }`}
              >
                <UserIcon className="w-4 h-4" /> Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('STORE_OWNER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'STORE_OWNER'
                    ? 'bg-accent-softGold border-amber-500 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'border-surface-border text-surface-muted hover:bg-warm-100'
                }`}
              >
                <Store className="w-4 h-4" /> Store Owner
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-surface-muted">
                Full Name (20–60 Chars)
              </label>
              <span className="text-[10px] text-surface-muted font-semibold">{name.length}/60</span>
            </div>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-surface-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Aarav Mehta - Valued Customer"
                className={`w-full pl-10 pr-4 py-2.5 bg-warm-100 dark:bg-slate-800/80 border ${
                  errors.name ? 'border-rose-500' : 'border-surface-border dark:border-slate-700'
                } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors`}
              />
            </div>
            {errors.name && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-surface-muted mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-surface-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-warm-100 dark:bg-slate-800/80 border ${
                  errors.email ? 'border-rose-500' : 'border-surface-border dark:border-slate-700'
                } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors`}
              />
            </div>
            {errors.email && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.email}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-surface-muted mb-1">
              Address (Max 400 Chars)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-surface-muted absolute left-3.5 top-3" />
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rajarampuri, Kolhapur, Maharashtra 416008"
                className={`w-full pl-10 pr-4 py-2 bg-warm-100 dark:bg-slate-800/80 border ${
                  errors.address ? 'border-rose-500' : 'border-surface-border dark:border-slate-700'
                } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors`}
              />
            </div>
            {errors.address && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.address}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-surface-muted mb-1">
              Password (8–16 Chars, 1 Uppercase, 1 Special Char)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-surface-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g., Password123!"
                className={`w-full pl-10 pr-10 py-2.5 bg-warm-100 dark:bg-slate-800/80 border ${
                  errors.password ? 'border-rose-500' : 'border-surface-border dark:border-slate-700'
                } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-muted hover:text-warm-900"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Registration'}{' '}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-surface-muted font-medium">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Sign In here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
