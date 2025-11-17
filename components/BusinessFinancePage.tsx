'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Business, Transaction, TransactionType } from '@/lib/types';
import { getBusinessMetrics } from '@/lib/api/metrics';
import { getTransactions, getCategories } from '@/lib/api/transactions';
import { BusinessMetrics } from '@/lib/types';
import { formatCurrency, getCurrentMonthRange } from '@/lib/utils';
import TransactionModal from './TransactionModal';
import TransactionTable from './TransactionTable';
import RevenueExpenseChart from './RevenueExpenseChart';
import CategoryExpenseChart from './CategoryExpenseChart';
import { Plus, Filter, TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BusinessFinancePageProps {
  business: Business;
}

export default function BusinessFinancePage({ business }: BusinessFinancePageProps) {
  const searchParams = useSearchParams();
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();

  const [filters, setFilters] = useState({
    startDate: getCurrentMonthRange().start,
    endDate: getCurrentMonthRange().end,
    type: '' as TransactionType | '',
    category: '',
  });

  useEffect(() => {
    loadData();
    loadCategories();

    // Check if we should open the add transaction modal
    if (searchParams?.get('action') === 'add') {
      setShowModal(true);
    }
  }, [business.id, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, transactionsData, allTransactionsData] = await Promise.all([
        getBusinessMetrics(business.id, filters.startDate, filters.endDate),
        getTransactions({
          businessId: business.id,
          startDate: filters.startDate,
          endDate: filters.endDate,
          type: filters.type || undefined,
          category: filters.category || undefined,
        }),
        getTransactions({ businessId: business.id }), // For charts (all time)
      ]);
      setMetrics(metricsData);
      setTransactions(transactionsData);
      setAllTransactions(allTransactionsData);
    } catch (error: any) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getCategories(business.id);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(undefined);
  };

  const handleSuccess = () => {
    loadData();
    loadCategories();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
          <p className="text-gray-600 mt-1">
            {business.type === 'service' ? 'Service-based business' : 'E-commerce business'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Transaction
        </button>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <p className="metric-label">Revenue</p>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="metric-value text-green-600">{formatCurrency(metrics.totalRevenue)}</p>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <p className="metric-label">Expenses</p>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <p className="metric-value text-red-600">{formatCurrency(metrics.totalExpenses)}</p>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <p className="metric-label">Net Profit</p>
              <Wallet className="h-5 w-5 text-primary-600" />
            </div>
            <p className={`metric-value ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.netProfit)}
            </p>
          </div>

          <div className="metric-card">
            <p className="metric-label">Cash Balance</p>
            <p className={`metric-value ${metrics.cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.cashBalance)}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-primary-600" />
            Revenue vs Expenses (Last 12 Months)
          </h2>
          <RevenueExpenseChart transactions={allTransactions} />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-primary-600" />
            Top Expense Categories
          </h2>
          <CategoryExpenseChart transactions={allTransactions} />
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as TransactionType | '' })}
              className="input"
            >
              <option value="">All Types</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
              <option value="transfer_out">Transfer Out</option>
              <option value="transfer_in">Transfer In</option>
              <option value="partner_payout">Partner Payout</option>
              <option value="capital_injection">Capital Injection</option>
              <option value="tax">Tax</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transactions ({transactions.length})
        </h2>
        <TransactionTable
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleSuccess}
        />
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        businessId={business.id}
        businessName={business.name}
        transaction={editingTransaction}
      />
    </div>
  );
}
