import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  LayoutGrid, 
  TrendingUp,
  Search,
  ArrowUpRight,
  Calendar,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserPlus
} from 'lucide-react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Business } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { AdminTeamManagement } from './AdminTeamManagement';

interface BusinessStats extends Business {
  userCount: number;
  boardCount: number;
  lastActive: string;
  monthlyRevenue: number;
}

export function AdminDashboard() {
  const { signOut } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'users' | 'boards' | 'revenue'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [addingTeamMemberTo, setAddingTeamMemberTo] = useState<{id: string; name: string} | null>(null);

  // Fetch businesses data
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const businessesRef = collection(db, 'businesses');
        const businessesSnapshot = await getDocs(businessesRef);
        
        const businessStats = await Promise.all(
          businessesSnapshot.docs.map(async (doc) => {
            const businessData = doc.data() as Business;
            
            const usersRef = collection(db, 'users');
            const usersQuery = query(usersRef, where('businessId', '==', doc.id));
            const usersSnapshot = await getDocs(usersQuery);
            
            const boardsRef = collection(db, 'boards');
            const boardsQuery = query(boardsRef, where('businessId', '==', doc.id));
            const boardsSnapshot = await getDocs(boardsQuery);

            return {
              ...businessData,
              id: doc.id,
              userCount: usersSnapshot.size,
              boardCount: boardsSnapshot.size,
              lastActive: new Date().toISOString(),
              monthlyRevenue: Math.floor(Math.random() * 10000)
            };
          })
        );

        setBusinesses(businessStats);
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError('Failed to load businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  const handleTeamMemberAdded = async () => {
    try {
      const businessesRef = collection(db, 'businesses');
      const businessesSnapshot = await getDocs(businessesRef);
      
      const businessStats = await Promise.all(
        businessesSnapshot.docs.map(async (doc) => {
          const businessData = doc.data() as Business;
          
          const usersRef = collection(db, 'users');
          const usersQuery = query(usersRef, where('businessId', '==', doc.id));
          const usersSnapshot = await getDocs(usersQuery);
          
          const boardsRef = collection(db, 'boards');
          const boardsQuery = query(boardsRef, where('businessId', '==', doc.id));
          const boardsSnapshot = await getDocs(boardsQuery);

          return {
            ...businessData,
            id: doc.id,
            userCount: usersSnapshot.size,
            boardCount: boardsSnapshot.size,
            lastActive: new Date().toISOString(),
            monthlyRevenue: Math.floor(Math.random() * 10000)
          };
        })
      );

      setBusinesses(businessStats);
      setAddingTeamMemberTo(null);
    } catch (err) {
      console.error('Error refreshing business data:', err);
    }
  };

  // Filter and sort businesses
  const filteredBusinesses = businesses
    .filter(business => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        business.name.toLowerCase().includes(searchLower) ||
        business.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'users':
          comparison = a.userCount - b.userCount;
          break;
        case 'boards':
          comparison = a.boardCount - b.boardCount;
          break;
        case 'revenue':
          comparison = a.monthlyRevenue - b.monthlyRevenue;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage businesses and team members</p>
          </div>
          <button
            onClick={() => setIsConfirmingLogout(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium
              text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search businesses..."
              className="pl-10 w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="name">Sort by Name</option>
            <option value="users">Sort by Users</option>
            <option value="boards">Sort by Boards</option>
            <option value="revenue">Sort by Revenue</option>
          </select>

          <button
            onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white
              border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>

        {/* Businesses List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredBusinesses.map((business) => (
              <div key={business.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {business.name}
                    </h3>
                    <p className="text-sm text-gray-500">{business.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAddingTeamMemberTo({ id: business.id, name: business.name })}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                        text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md"
                    >
                      <UserPlus size={16} />
                      Add Team Member
                    </button>
                    <button
                      onClick={() => window.open(`/business/${business.id}`, '_blank')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                        text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      View Details
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {business.userCount} Users
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LayoutGrid size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {business.boardCount} Boards
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Last active {new Date(business.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      ${business.monthlyRevenue.toLocaleString()} / month
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredBusinesses.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500">No businesses found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Management Dialog */}
      {addingTeamMemberTo && (
        <AdminTeamManagement
          businessId={addingTeamMemberTo.id}
          businessName={addingTeamMemberTo.name}
          isOpen={true}
          onClose={() => setAddingTeamMemberTo(null)}
          onSuccess={handleTeamMemberAdded}
        />
      )}

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {isConfirmingLogout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign Out
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out? You will need to sign in again to access the admin dashboard.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsConfirmingLogout(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 
                    hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium text-white 
                    bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}