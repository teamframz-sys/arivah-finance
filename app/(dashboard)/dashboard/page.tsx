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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your business finances</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="input text-sm"
          />
          <span className="flex items-center text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="input text-sm"
          />
        </div>
      </div>

      {/* Consolidated Metrics */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary-600" />
          Consolidated Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="metric-label">Total Revenue</p>
            <p className="metric-value text-green-600">{formatCurrency(data.consolidated.totalRevenue)}</p>
          </div>
          <div>
            <p className="metric-label">Total Expenses</p>
            <p className="metric-value text-red-600">{formatCurrency(data.consolidated.totalExpenses)}</p>
          </div>
          <div>
            <p className="metric-label">Net Profit</p>
            <p className={`metric-value ${data.consolidated.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.consolidated.netProfit)}
            </p>
          </div>
          <div>
            <p className="metric-label">Transfers (Web Dev → Jewels)</p>
            <p className="metric-value text-blue-600">{formatCurrency(data.consolidated.totalTransfers)}</p>
          </div>
        </div>
      </div>

      {/* Business Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arivah Web Dev */}
        <Link href="/business/web-dev" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Code className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 ml-3">Arivah Web Dev</h2>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="metric-label">Revenue</p>
              <p className="text-xl font-semibold text-green-600">{formatCurrency(data.webDev.totalRevenue)}</p>
            </div>
            <div>
              <p className="metric-label">Expenses</p>
              <p className="text-xl font-semibold text-red-600">{formatCurrency(data.webDev.totalExpenses)}</p>
            </div>
            <div>
              <p className="metric-label">Net Profit</p>
              <p className={`text-xl font-semibold ${data.webDev.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.webDev.netProfit)}
              </p>
            </div>
            <div>
              <p className="metric-label">Transferred Out</p>
              <p className="text-xl font-semibold text-orange-600">{formatCurrency(data.webDev.transferredOut || 0)}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cash Balance</span>
              <span className={`text-lg font-bold ${data.webDev.cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.webDev.cashBalance)}
              </span>
            </div>
          </div>
        </Link>

        {/* Arivah Jewels */}
        <Link href="/business/jewels" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gem className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 ml-3">Arivah Jewels</h2>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="metric-label">Revenue</p>
              <p className="text-xl font-semibold text-green-600">{formatCurrency(data.jewels.totalRevenue)}</p>
            </div>
            <div>
              <p className="metric-label">Expenses</p>
              <p className="text-xl font-semibold text-red-600">{formatCurrency(data.jewels.totalExpenses)}</p>
            </div>
            <div>
              <p className="metric-label">Net Profit</p>
              <p className={`text-xl font-semibold ${data.jewels.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.jewels.netProfit)}
              </p>
            </div>
            <div>
              <p className="metric-label">Received From Web Dev</p>
              <p className="text-xl font-semibold text-blue-600">{formatCurrency(data.jewels.receivedIn || 0)}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cash Balance</span>
              <span className={`text-lg font-bold ${data.jewels.cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.jewels.cashBalance)}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/business/web-dev?action=add"
            className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">+ Add Web Dev Transaction</span>
          </Link>
          <Link
            href="/business/jewels?action=add"
            className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">+ Add Jewels Transaction</span>
          </Link>
          <Link
            href="/transfers?action=create"
            className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">+ Create Transfer</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
