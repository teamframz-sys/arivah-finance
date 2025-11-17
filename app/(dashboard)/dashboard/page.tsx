'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardData } from '@/lib/api/metrics';
import { DashboardData } from '@/lib/types';
import { formatCurrency, getCurrentMonthRange } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Code, Gem } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(getCurrentMonthRange());

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const dashboardData = await getDashboardData(dateRange.start, dateRange.end);
      setData(dashboardData);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="spinner h-12 w-12 sm:h-16 sm:w-16 mx-auto"></div>
          <p className="mt-4 text-base sm:text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your business finances</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="input"
          />
          <span className="flex items-center justify-center text-gray-500 text-sm">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="input"
          />
        </div>
      </div>

      {/* Consolidated Metrics */}
      <div className="section">
        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5 flex items-center">
            <div className="metric-icon bg-primary-100 mr-3">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
            </div>
            <span>Consolidated Overview</span>
          </h2>
          <div className="stats-grid">
            <div className="metric-card">
              <p className="metric-label">Total Revenue</p>
              <p className="metric-value text-green-600">{formatCurrency(data.consolidated.totalRevenue)}</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Total Expenses</p>
              <p className="metric-value text-red-600">{formatCurrency(data.consolidated.totalExpenses)}</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Net Profit</p>
              <p className={`metric-value ${data.consolidated.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.consolidated.netProfit)}
              </p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Transfers</p>
              <p className="metric-value text-blue-600">{formatCurrency(data.consolidated.totalTransfers)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Cards */}
      <div className="section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* Arivah Web Dev */}
          <Link href="/business/web-dev" className="card hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center">
                <div className="metric-icon bg-primary-100">
                  <Code className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 ml-3">Arivah Web Dev</h2>
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="metric-label">Revenue</p>
                <p className="text-lg sm:text-xl font-semibold text-green-600">{formatCurrency(data.webDev.totalRevenue)}</p>
              </div>
              <div>
                <p className="metric-label">Expenses</p>
                <p className="text-lg sm:text-xl font-semibold text-red-600">{formatCurrency(data.webDev.totalExpenses)}</p>
                {data.webDev.personalExpenses && data.webDev.personalExpenses > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    (incl. {formatCurrency(data.webDev.personalExpenses)} personal)
                  </p>
                )}
              </div>
              <div>
                <p className="metric-label">Net Profit</p>
                <p className={`text-lg sm:text-xl font-semibold ${data.webDev.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.webDev.netProfit)}
                </p>
              </div>
              <div>
                <p className="metric-label">Transferred Out</p>
                <p className="text-lg sm:text-xl font-semibold text-orange-600">{formatCurrency(data.webDev.transferredOut || 0)}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-600 font-medium">Cash Balance</span>
                <span className={`text-xl sm:text-2xl font-bold ${data.webDev.cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.webDev.cashBalance)}
                </span>
              </div>
            </div>
          </Link>

          {/* Arivah Jewels */}
          <Link href="/business/jewels" className="card hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center">
                <div className="metric-icon bg-purple-100">
                  <Gem className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 ml-3">Arivah Jewels</h2>
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="metric-label">Revenue</p>
                <p className="text-lg sm:text-xl font-semibold text-green-600">{formatCurrency(data.jewels.totalRevenue)}</p>
              </div>
              <div>
                <p className="metric-label">Expenses</p>
                <p className="text-lg sm:text-xl font-semibold text-red-600">{formatCurrency(data.jewels.totalExpenses)}</p>
                {data.jewels.personalExpenses && data.jewels.personalExpenses > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    (incl. {formatCurrency(data.jewels.personalExpenses)} personal)
                  </p>
                )}
              </div>
              <div>
                <p className="metric-label">Net Profit</p>
                <p className={`text-lg sm:text-xl font-semibold ${data.jewels.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.jewels.netProfit)}
                </p>
              </div>
              <div>
                <p className="metric-label">Received</p>
                <p className="text-lg sm:text-xl font-semibold text-blue-600">{formatCurrency(data.jewels.receivedIn || 0)}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-600 font-medium">Cash Balance</span>
                <span className={`text-xl sm:text-2xl font-bold ${data.jewels.cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.jewels.cashBalance)}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Link
              href="/business/web-dev?action=add"
              className="flex items-center justify-center px-4 py-3 sm:py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 active:bg-primary-100 transition-all duration-200 min-h-[44px] sm:min-h-[40px] touch-manipulation"
            >
              <span className="text-base sm:text-sm font-medium text-gray-700">+ Add Web Dev Transaction</span>
            </Link>
            <Link
              href="/business/jewels?action=add"
              className="flex items-center justify-center px-4 py-3 sm:py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 active:bg-primary-100 transition-all duration-200 min-h-[44px] sm:min-h-[40px] touch-manipulation"
            >
              <span className="text-base sm:text-sm font-medium text-gray-700">+ Add Jewels Transaction</span>
            </Link>
            <Link
              href="/transfers?action=create"
              className="flex items-center justify-center px-4 py-3 sm:py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 active:bg-primary-100 transition-all duration-200 min-h-[44px] sm:min-h-[40px] touch-manipulation"
            >
              <span className="text-base sm:text-sm font-medium text-gray-700">+ Create Transfer</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
