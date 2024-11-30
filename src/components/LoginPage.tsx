import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, registerBusiness } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (!businessName.trim() || !ownerName.trim()) {
          throw new Error('Please fill in all fields');
        }
        if (password.length < 6) {
          throw new Error('Password should be at least 6 characters');
        }
        await registerBusiness(email, password, businessName, ownerName);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Layout className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isRegistering ? 'Register your business' : 'Sign in to your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-md">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={16} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <>
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                    Business Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="businessName"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                        shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                        focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                    Your Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="ownerName"
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                        shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                        focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                    shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                    focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                    shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                    focus:border-indigo-500 sm:text-sm"
                />
              </div>
              {isRegistering && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                  shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isRegistering ? (
                  <div className="flex items-center gap-2">
                    <UserPlus size={20} />
                    <span>Register Business</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn size={20} />
                    <span>Sign in</span>
                  </div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md 
                shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isRegistering ? 'Already have an account? Sign in' : 'Register a new business'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}