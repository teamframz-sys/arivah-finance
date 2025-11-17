'use client';

import { useState, useEffect } from 'react';
import { Investment, User, Business } from '@/lib/types';
import {
  getInvestments,
  createInvestment,
  deleteInvestment,
  getUnsettledInvestmentsByUser,
} from '@/lib/api/investments';
import { getUsers } from '@/lib/api/users';
import { getBusinesses } from '@/lib/api/businesses';
import { supabase } from '@/lib/supabase/client';
import { Plus, TrendingUp, DollarSign, Calendar, Trash2 } from 'lucide-react';
import { notify } from '@/lib/notifications';
import { ARIVAH_USER_ID } from '@/lib/constants';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState<{ total: number; count: number }>({
    total: 0,
    count: 0,
  });

  const [formData, setFormData] = useState({
    user_id: '',
    business_id: '',
    amount: '',
    investment_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setCurrentUser(profile);

      // Load all data
      const [investmentsData, usersData, businessesData] = await Promise.all([
        getInvestments(),
        getUsers(),
        getBusinesses(),
      ]);

      setInvestments(investmentsData);
      setUsers(usersData);
      setBusinesses(businessesData);

      // Set default user to Arivah (system default)
      setFormData(prev => ({ ...prev, user_id: ARIVAH_USER_ID }));

      // Get unsettled stats for Arivah user
      const userStats = await getUnsettledInvestmentsByUser(ARIVAH_USER_ID);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_id || !formData.business_id || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newInvestment = await createInvestment({
        user_id: formData.user_id,
        business_id: formData.business_id,
        amount: parseFloat(formData.amount),
        investment_date: formData.investment_date,
        description: formData.description || undefined,
        is_settled: false,
      });

      setInvestments([newInvestment, ...investments]);
      setShowAddForm(false);
      setFormData({
        user_id: ARIVAH_USER_ID,
        business_id: '',
        amount: '',
        investment_date: new Date().toISOString().split('T')[0],
        description: '',
      });

      // Reload stats
      const userStats = await getUnsettledInvestmentsByUser(ARIVAH_USER_ID);
      setStats(userStats);

      notify.success('Investment Added', `₹${parseFloat(formData.amount).toLocaleString()} investment recorded`);
    } catch (error) {
      console.error('Error creating investment:', error);
      notify.error('Error', 'Failed to create investment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;

    try {
      await deleteInvestment(id);
      setInvestments(investments.filter(inv => inv.id !== id));

      // Reload stats
      const userStats = await getUnsettledInvestmentsByUser(ARIVAH_USER_ID);
      setStats(userStats);

      notify.success('Investment Deleted', 'Investment has been removed');
    } catch (error) {
      console.error('Error deleting investment:', error);
      notify.error('Error', 'Failed to delete investment');
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading investments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investments</h1>
          <p className="text-gray-600 mt-1">Track capital investments into your businesses</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Investment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Investments</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  investments.reduce((sum, inv) => sum + inv.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unsettled (Your)</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Count</p>
              <p className="text-2xl font-bold text-gray-900">{investments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Investment Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Investment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investor <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.user_id}
                  onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select investor</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.business_id}
                  onChange={e => setFormData({ ...formData, business_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select business</option>
                  {businesses.map(business => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.investment_date}
                  onChange={e =>
                    setFormData({ ...formData, investment_date: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
                placeholder="Optional notes about this investment"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Investment
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Investments List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Investments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No investments found. Add your first investment to get started.
                  </td>
                </tr>
              ) : (
                investments.map(investment => (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(investment.investment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {investment.user?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {investment.business?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(investment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {investment.is_settled ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Unsettled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {investment.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(investment.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete investment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
