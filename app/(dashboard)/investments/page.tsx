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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="spinner h-12 w-12 sm:h-16 sm:w-16 mx-auto"></div>
          <p className="mt-4 text-base sm:text-lg text-gray-600">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Investments</h1>
        <p className="page-subtitle">Track capital investments into your businesses</p>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto mt-3 sm:mt-0 sm:absolute sm:top-0 sm:right-0"
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          <span>Add Investment</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="section">
        <div className="stats-grid">
          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <p className="metric-label">Total Investments</p>
              <div className="metric-icon bg-green-100">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            <p className="metric-value text-green-600">
              {formatCurrency(
                investments.reduce((sum, inv) => sum + inv.amount, 0)
              )}
            </p>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <p className="metric-label">Unsettled</p>
              <div className="metric-icon bg-orange-100">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
            <p className="metric-value text-orange-600">
              {formatCurrency(stats.total)}
            </p>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <p className="metric-label">Total Count</p>
              <div className="metric-icon bg-blue-100">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <p className="metric-value text-blue-600">{investments.length}</p>
          </div>
        </div>
      </div>

      {/* Add Investment Form */}
      {showAddForm && (
        <div className="section">
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-5">Add New Investment</h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="form-grid">
                <div>
                  <label className="label">
                    Investor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                    className="input"
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
                  <label className="label">
                    Business <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.business_id}
                    onChange={e => setFormData({ ...formData, business_id: e.target.value })}
                    className="input"
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
                  <label className="label">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="input"
                    placeholder="0"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    Investment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.investment_date}
                    onChange={e =>
                      setFormData({ ...formData, investment_date: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Optional notes about this investment"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Investment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Investments List */}
      <div className="section">
        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">All Investments</h2>
          <div className="table-responsive">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investor
                  </th>
                  <th className="table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Description
                  </th>
                  <th className="table-cell text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      No investments found. Add your first investment to get started.
                    </td>
                  </tr>
                ) : (
                  investments.map(investment => (
                    <tr key={investment.id} className="hover:bg-gray-50">
                      <td className="table-cell text-sm text-gray-900">
                        {formatDate(investment.investment_date)}
                      </td>
                      <td className="table-cell text-sm text-gray-900">
                        {investment.user?.name || '-'}
                      </td>
                      <td className="table-cell text-sm text-gray-900">
                        {investment.business?.name || '-'}
                      </td>
                      <td className="table-cell text-sm font-medium text-gray-900">
                        {formatCurrency(investment.amount)}
                      </td>
                      <td className="table-cell">
                        {investment.is_settled ? (
                          <span className="badge-success">
                            Settled
                          </span>
                        ) : (
                          <span className="badge-warning">
                            Unsettled
                          </span>
                        )}
                      </td>
                      <td className="table-cell text-sm text-gray-600 hidden sm:table-cell">
                        {investment.description || '-'}
                      </td>
                      <td className="table-cell text-right text-sm">
                        <button
                          onClick={() => handleDelete(investment.id)}
                          className="icon-btn text-red-600 hover:bg-red-50"
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
    </div>
  );
}
