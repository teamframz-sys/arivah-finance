'use client';

import { useEffect, useState } from 'react';
import { UserWithStats, ActivityLog } from '@/lib/types';
import { getUsersWithStats, getActivityLogs } from '@/lib/api/users';
import { Users as UsersIcon, Activity, FileText, CheckSquare, TrendingUp, Download, Filter, Calendar, Wallet, DollarSign, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [allActivity, setAllActivity] = useState<ActivityLog[]>([]);
  const [filteredActivity, setFilteredActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    actionType: 'all',
    entityType: 'all',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allActivity, selectedUser, filters]);

  const loadData = async () => {
    try {
      const [usersData, activityData] = await Promise.all([
        getUsersWithStats(),
        getActivityLogs(undefined, 200), // Increased limit for better filtering
      ]);
      setUsers(usersData);
      setAllActivity(activityData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let activities = selectedUser ? selectedUser.recent_activity || [] : allActivity;

    // Filter by action type
    if (filters.actionType !== 'all') {
      activities = activities.filter(log => log.action.includes(filters.actionType));
    }

    // Filter by entity type
    if (filters.entityType !== 'all') {
      activities = activities.filter(log => log.entity_type === filters.entityType);
    }

    // Filter by date range
    if (filters.dateFrom) {
      activities = activities.filter(
        log => new Date(log.created_at) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      activities = activities.filter(
        log => new Date(log.created_at) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    setFilteredActivity(activities);
  };

  const exportToCSV = () => {
    const activities = filteredActivity;

    if (activities.length === 0) {
      toast.error('No activity to export');
      return;
    }

    // CSV headers
    const headers = ['Date', 'Time', 'User', 'Action', 'Entity Type', 'Entity ID', 'Details'];

    // CSV rows
    const rows = activities.map(log => [
      format(new Date(log.created_at), 'yyyy-MM-dd'),
      format(new Date(log.created_at), 'HH:mm:ss'),
      log.user?.name || 'Unknown',
      formatActionText(log.action),
      log.entity_type,
      log.entity_id || '',
      JSON.stringify(log.details || {})
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_log_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Activity log exported successfully');
  };

  const getActionIcon = (action: string) => {
    if (action.includes('transaction')) return <FileText className="w-4 h-4" />;
    if (action.includes('investment')) return <DollarSign className="w-4 h-4" />;
    if (action.includes('personal_expense') || action.includes('expense')) return <Wallet className="w-4 h-4" />;
    if (action.includes('task')) return <CheckSquare className="w-4 h-4" />;
    if (action.includes('transfer')) return <ArrowLeftRight className="w-4 h-4" />;
    if (action.includes('profit')) return <TrendingUp className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'text-green-600 bg-green-50';
    if (action.includes('updated')) return 'text-blue-600 bg-blue-50';
    if (action.includes('deleted')) return 'text-red-600 bg-red-50';
    if (action.includes('completed') || action.includes('settled')) return 'text-purple-600 bg-purple-50';
    if (action.includes('reimbursed')) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  const formatActionText = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users & Activity</h1>
        <p className="text-gray-600 mt-1">View all users and their activity history</p>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {users.map((user) => (
          <div
            key={user.id}
            className={`bg-white p-6 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
              selectedUser?.id === user.id ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedUser(user)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Transactions</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{user.total_transactions || 0}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">Tasks</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{user.total_tasks || 0}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {selectedUser ? `${selectedUser.name}'s Activity` : 'All Activity'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {selectedUser && (
          <button
            onClick={() => setSelectedUser(null)}
            className="mb-4 text-sm text-blue-600 hover:text-blue-800"
          >
            ← Show all users' activity
          </button>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Type
                </label>
                <select
                  value={filters.actionType}
                  onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Actions</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Type
                </label>
                <select
                  value={filters.entityType}
                  onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="transaction">Transactions</option>
                  <option value="investment">Investments</option>
                  <option value="investment_settlement">Investment Settlements</option>
                  <option value="personal_expense">Personal Expenses</option>
                  <option value="task">Tasks</option>
                  <option value="transfer">Transfers</option>
                  <option value="profit_sharing">Profit Sharing</option>
                  <option value="business">Business</option>
                  <option value="partner">Partners</option>
                  <option value="user">Users</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setFilters({ actionType: 'all', entityType: 'all', dateFrom: '', dateTo: '' })}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
              <span className="text-sm text-gray-500">
                Showing {filteredActivity.length} of {selectedUser ? selectedUser.recent_activity?.length || 0 : allActivity.length} activities
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredActivity?.map((log) => (
            <div
              key={log.id}
              className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 border border-gray-100"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(log.action)}`}>
                {getActionIcon(log.action)}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatActionText(log.action)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {log.user?.name || 'Unknown user'} • {log.entity_type}
                      {log.details?.title && ` • ${log.details.title}`}
                      {log.details?.category && ` • ${log.details.category}`}
                      {log.details?.amount && ` • ₹${log.details.amount.toLocaleString()}`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      View details
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )) || []}

          {filteredActivity.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {showFilters && (filters.actionType !== 'all' || filters.entityType !== 'all' || filters.dateFrom || filters.dateTo)
                  ? 'No activity matches the selected filters'
                  : 'No activity yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
