'use client';

import { useEffect, useState } from 'react';
import { PersonalExpense, Business, User, PersonalExpenseStats } from '@/lib/types';
import {
  getPersonalExpenses,
  createPersonalExpense,
  updatePersonalExpense,
  deletePersonalExpense,
  getPersonalExpenseCategories,
  getPersonalExpenseStats,
  markAsReimbursed,
} from '@/lib/api/personal-expenses';
import { getBusinesses } from '@/lib/api/businesses';
import { getUsers } from '@/lib/api/users';
import { supabase } from '@/lib/supabase/client';
import { Wallet, Plus, Pencil, Trash2, TrendingDown, DollarSign, RefreshCw, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ARIVAH_USER_ID } from '@/lib/constants';

export default function PersonalExpensesPage() {
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [stats, setStats] = useState<PersonalExpenseStats | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PersonalExpense | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, selectedUserId, selectedBusinessId, startDate, endDate]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadData = async () => {
    try {
      const [expensesData, businessesData, usersData] = await Promise.all([
        getPersonalExpenses({
          userId: selectedUserId !== 'all' ? selectedUserId : undefined,
          businessId: selectedBusinessId !== 'all' ? selectedBusinessId : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        getBusinesses(),
        getUsers(),
      ]);

      const statsData = await getPersonalExpenseStats(
        selectedUserId !== 'all' ? selectedUserId : undefined,
        startDate || undefined,
        endDate || undefined
      );

      setExpenses(expensesData);
      setStats(statsData);
      setBusinesses(businessesData);

      // Sort users: "Arivah" first, then authenticated users, then others
      const sortedUsers = usersData.sort((a, b) => {
        if (a.id === ARIVAH_USER_ID) return -1;
        if (b.id === ARIVAH_USER_ID) return 1;
        if (a.id === currentUser?.id) return -1;
        if (b.id === currentUser?.id) return 1;
        return a.name.localeCompare(b.name);
      });
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: PersonalExpense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await deletePersonalExpense(id);
      toast.success('Expense deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleMarkReimbursed = async (id: string) => {
    try {
      await markAsReimbursed(id);
      toast.success('Marked as reimbursed');
      loadData();
    } catch (error) {
      toast.error('Failed to update expense');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personal Expenses</h1>
          <p className="text-gray-600 mt-1">Track your personal spending separate from business</p>
        </div>
        <button
          onClick={handleCreateExpense}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {currentUser?.id === user.id && '(You)'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business</label>
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Businesses</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Expenses</p>
              <p className="text-3xl font-bold mt-2">₹{stats?.totalExpenses.toLocaleString() || 0}</p>
            </div>
            <TrendingDown className="w-12 h-12 text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending Reimbursement</p>
              <p className="text-3xl font-bold mt-2">₹{stats?.reimbursablePending.toLocaleString() || 0}</p>
            </div>
            <RefreshCw className="w-12 h-12 text-yellow-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Reimbursed</p>
              <p className="text-3xl font-bold mt-2">₹{stats?.reimbursedTotal.toLocaleString() || 0}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Entries</p>
              <p className="text-3xl font-bold mt-2">{expenses.length}</p>
            </div>
            <Wallet className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Top Expense Categories</h2>
        <div className="space-y-3">
          {stats?.categoryBreakdown.slice(0, 5).map((cat) => (
            <div key={cat.category} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{cat.category}</span>
                  <span className="text-sm text-gray-600">₹{cat.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${((cat.amount / (stats?.totalExpenses || 1)) * 100).toFixed(0)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{expense.user?.name}</p>
                      {currentUser?.id === expense.user_id && (
                        <span className="text-xs text-blue-600">(You)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {expense.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.business?.name || 'Personal'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-red-600">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {expense.is_reimbursable && (
                      <>
                        {expense.is_reimbursed ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Reimbursed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkReimbursed(expense.id)}
                            className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          >
                            Pending
                          </button>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleEditExpense(expense)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expenses.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No expenses found. Add your first expense!</p>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {isModalOpen && (
        <ExpenseModal
          expense={editingExpense}
          businesses={businesses}
          users={users}
          currentUserId={currentUser?.id}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Expense Modal Component
function ExpenseModal({
  expense,
  businesses,
  users,
  currentUserId,
  onClose,
  onSave,
}: {
  expense: PersonalExpense | null;
  businesses: Business[];
  users: User[];
  currentUserId: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    user_id: expense?.user_id || ARIVAH_USER_ID,
    business_id: expense?.business_id || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    category: expense?.category || '',
    amount: expense?.amount || 0,
    payment_method: expense?.payment_method || '',
    description: expense?.description || '',
    is_reimbursable: expense?.is_reimbursable || false,
    is_reimbursed: expense?.is_reimbursed || false,
    tags: expense?.tags || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (expense) {
        await updatePersonalExpense(expense.id, formData);
        toast.success('Expense updated');
      } else {
        await createPersonalExpense(formData as any);
        toast.success('Expense created');
      }
      onSave();
    } catch (error) {
      toast.error(expense ? 'Failed to update expense' : 'Failed to create expense');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">{expense ? 'Edit Expense' : 'Add Expense'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User *</label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} {currentUserId === user.id && '(You)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Food, Transport, Utilities"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business (Optional)</label>
                <select
                  value={formData.business_id}
                  onChange={(e) => setFormData({ ...formData, business_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Personal (Not business-related)</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <input
                  type="text"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  placeholder="e.g., Cash, UPI, Card"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_reimbursable}
                  onChange={(e) =>
                    setFormData({ ...formData, is_reimbursable: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Can be reimbursed by business</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {expense ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
