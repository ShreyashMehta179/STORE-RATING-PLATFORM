import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { resetPasswordApi } from '../../services/api';
import { StoreHubLogo } from '../../components/StoreHubLogo';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password criteria check
  const hasMinLen = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  useEffect(() => {
    if (!token) {
      setErrorMessage('Password reset link is missing a valid token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('This password reset link is invalid or missing token.');
      return;
    }

    if (!hasMinLen || !hasUppercase || !hasSpecial) {
      setErrorMessage(
        'Password must be 8-16 characters long, contain at least 1 uppercase letter and 1 special character.'
      );
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resetPasswordApi(token, password);
      if (res.success) {
        setIsSuccess(true);
        toast.success('Password reset successfully! You can now log in.');
      } else {
        setErrorMessage(res.message || 'Password reset failed. Please request a new reset link.');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'This password reset link is invalid or has expired.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white relative overflow-hidden px-4 sm:px-6 lg:px-8 py-12">
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <StoreHubLogo className="h-10 w-auto text-blue-500" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Reset your password
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Create a strong new password for your StoreHub account.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-2xl rounded-2xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-6"
              >
                <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Password Reset Successfully</h3>
                  <p className="text-sm text-slate-300">
                    Your password has been updated. You can now log in with your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm"
                >
                  Go to Login
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : !token ? (
              <motion.div
                key="invalid-token"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4 space-y-6"
              >
                <div className="mx-auto w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Invalid Reset Link</h3>
                  <p className="text-sm text-slate-400">
                    This password reset link is missing a valid security token.
                  </p>
                </div>
                <Link
                  to="/forgot-password"
                  className="inline-flex w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/25 items-center justify-center gap-2"
                >
                  Request New Reset Link
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="reset-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span>{errorMessage}</span>
                      {errorMessage.includes('invalid') || errorMessage.includes('expired') ? (
                        <div className="mt-2">
                          <Link
                            to="/forgot-password"
                            className="text-xs text-blue-400 underline hover:text-blue-300 font-semibold"
                          >
                            Request New Reset Link
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}

                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements List */}
                <div className="p-3.5 bg-slate-950/50 border border-slate-800/80 rounded-xl space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Password Requirements:
                  </div>
                  <div className={`flex items-center gap-2 ${hasMinLen ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className="text-xs">{hasMinLen ? '✓' : '•'}</span> 8 - 16 characters long
                  </div>
                  <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className="text-xs">{hasUppercase ? '✓' : '•'}</span> At least one uppercase letter (A-Z)
                  </div>
                  <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className="text-xs">{hasSpecial ? '✓' : '•'}</span> At least one special character (!@#$%^&*)
                  </div>
                  {confirmPassword.length > 0 && (
                    <div className={`flex items-center gap-2 ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span className="text-xs">{passwordsMatch ? '✓' : '✕'}</span> Passwords match
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
