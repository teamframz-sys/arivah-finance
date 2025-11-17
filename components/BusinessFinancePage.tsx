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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="spinner h-12 w-12 sm:h-16 sm:w-16 mx-auto"></div>
          <p className="mt-4 text-base sm:text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{business.name}</h1>
        <p className="page-subtitle">
          {business.type === 'service' ? 'Service-based business' : 'E-commerce business'}
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto mt-3 sm:mt-0 sm:absolute sm:top-0 sm:right-0"
        >
          <Plus className="h-5 w-5 flex-shrink-0" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="section">
          <div className="stats-grid">
            <div className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <p className="metric-label">Revenue</p>
                <div className="metric-icon bg-green-100">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
              <p className="metric-value text-green-600">{formatCurrency(metrics.totalRevenue)}</p>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <p className="metric-label">Expenses</p>
                <div className="metric-icon bg-red-100">
                  <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
              <p className="metric-value text-red-600">{formatCurrency(metrics.totalExpenses)}</p>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <p className="metric-label">Net Profit</p>
                <div className="metric-icon bg-primary-100">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
              </div>
              <p className={`metric-value ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.netProfit)}
              </p>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <p className="metric-label">Cash Balance</p>
                <div className="metric-icon bg-blue-100">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
              <p className={`metric-value ${metrics.cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.cashBalance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <div className="card">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="metric-icon bg-primary-100 mr-3">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <span className="text-sm sm:text-base md:text-lg">Revenue vs Expenses</span>
            </h2>
            <div className="h-64 sm:h-72 md:h-80">
              <RevenueExpenseChart transactions={allTransactions} />
            </div>
          </div>

          <div className="card">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="metric-icon bg-primary-100 mr-3">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
              </div>
              <span className="text-sm sm:text-base md:text-lg">Top Categories</span>
            </h2>
            <div className="h-64 sm:h-72 md:h-80">
              <CategoryExpenseChart transactions={allTransactions} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="section">
        <div className="card">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div className="metric-icon bg-gray-100">
              <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="form-grid">
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
      </div>

      {/* Transactions Table */}
      <div className="section">
        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Transactions ({transactions.length})
          </h2>
          <div className="table-responsive">
            <TransactionTable
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleSuccess}
            />
          </div>
        </div>
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
