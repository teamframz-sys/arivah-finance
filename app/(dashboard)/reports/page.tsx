'use client';

import { useState } from 'react';
import { Download, Upload, FileText, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getTransactions } from '@/lib/api/transactions';
import { getInvestments } from '@/lib/api/investments';
import { getPersonalExpenses } from '@/lib/api/personal-expenses';
import { getActivityLogs } from '@/lib/api/users';
import { getProfitSharingLogs } from '@/lib/api/partners';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [exportType, setExportType] = useState('transactions');
  const [loading, setLoading] = useState(false);

  const exportTransactionsToCSV = async () => {
    try {
      setLoading(true);
      const transactions = await getTransactions({
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      if (transactions.length === 0) {
        toast.error('No transactions found for the selected date range');
        return;
      }

      const headers = [
        'Date',
        'Business',
        'Type',
        'Category',
        'Amount',
        'Payment Method',
        'Description',
        'Created By',
        'Created At',
      ];

      const rows = transactions.map(txn => [
        txn.date,
        txn.business?.name || '',
        txn.type,
        txn.category,
        txn.amount,
        txn.payment_method || '',
        txn.description || '',
        txn.created_by || '',
        format(new Date(txn.created_at), 'yyyy-MM-dd HH:mm:ss'),
      ]);

      downloadCSV(headers, rows, `transactions_${dateRange.start}_to_${dateRange.end}`);
      toast.success(`Exported ${transactions.length} transactions`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    } finally {
      setLoading(false);
    }
  };

  const exportInvestmentsToCSV = async () => {
    try {
      setLoading(true);
      const investments = await getInvestments({
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      if (investments.length === 0) {
        toast.error('No investments found for the selected date range');
        return;
      }

      const headers = [
        'Date',
        'Investor',
        'Business',
        'Amount',
        'Status',
        'Settled Date',
        'Description',
        'Created At',
      ];

      const rows = investments.map(inv => [
        inv.investment_date,
        inv.user?.name || '',
        inv.business?.name || '',
        inv.amount,
        inv.is_settled ? 'Settled' : 'Unsettled',
        inv.settled_date || '',
        inv.description || '',
        format(new Date(inv.created_at), 'yyyy-MM-dd HH:mm:ss'),
      ]);

      downloadCSV(headers, rows, `investments_${dateRange.start}_to_${dateRange.end}`);
      toast.success(`Exported ${investments.length} investments`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export investments');
    } finally {
      setLoading(false);
    }
  };

  const exportPersonalExpensesToCSV = async () => {
    try {
      setLoading(true);
      const expenses = await getPersonalExpenses({
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      if (expenses.length === 0) {
        toast.error('No personal expenses found for the selected date range');
        return;
      }

      const headers = [
        'Date',
        'User',
        'Business',
        'Category',
        'Amount',
        'Payment Method',
        'Reimbursable',
        'Reimbursed',
        'Description',
        'Tags',
      ];

      const rows = expenses.map(exp => [
        exp.date,
        exp.user?.name || '',
        exp.business?.name || '',
        exp.category,
        exp.amount,
        exp.payment_method || '',
        exp.is_reimbursable ? 'Yes' : 'No',
        exp.is_reimbursed ? 'Yes' : 'No',
        exp.description || '',
        exp.tags?.join(', ') || '',
      ]);

      downloadCSV(headers, rows, `personal_expenses_${dateRange.start}_to_${dateRange.end}`);
      toast.success(`Exported ${expenses.length} personal expenses`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export personal expenses');
    } finally {
      setLoading(false);
    }
  };

  const exportActivityLogsToCSV = async () => {
    try {
      setLoading(true);
      const logs = await getActivityLogs(undefined, 1000);

      // Filter by date range
      const filteredLogs = logs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= new Date(dateRange.start) && logDate <= new Date(dateRange.end + 'T23:59:59');
      });

      if (filteredLogs.length === 0) {
        toast.error('No activity logs found for the selected date range');
        return;
      }

      const headers = ['Date', 'Time', 'User', 'Action', 'Entity Type', 'Entity ID', 'Details'];

      const rows = filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd'),
        format(new Date(log.created_at), 'HH:mm:ss'),
        log.user?.name || 'Unknown',
        log.action,
        log.entity_type,
        log.entity_id || '',
        JSON.stringify(log.details || {}),
      ]);

      downloadCSV(headers, rows, `activity_logs_${dateRange.start}_to_${dateRange.end}`);
      toast.success(`Exported ${filteredLogs.length} activity logs`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export activity logs');
    } finally {
      setLoading(false);
    }
  };

  const exportProfitSharingToCSV = async () => {
    try {
      setLoading(true);
      const logs = await getProfitSharingLogs();

      // Filter by date range
      const filteredLogs = logs.filter(log => {
        const logDate = new Date(log.period_end_date);
        return logDate >= new Date(dateRange.start) && logDate <= new Date(dateRange.end);
      });

      if (filteredLogs.length === 0) {
        toast.error('No profit sharing records found for the selected date range');
        return;
      }

      const headers = [
        'Period Start',
        'Period End',
        'Business',
        'Partner',
        'Total Profit',
        'Partner Share',
        'Cash Payout',
        'Reinvested',
        'Notes',
        'Settled',
      ];

      const rows = filteredLogs.map(log => [
        log.period_start_date,
        log.period_end_date,
        log.business?.name || '',
        log.partner?.name || '',
        log.total_profit,
        log.partner_share_amount,
        log.cash_payout_amount,
        log.reinvested_to_other_business_amount,
        log.note || '',
        log.is_settled ? 'Yes' : 'No',
      ]);

      downloadCSV(headers, rows, `profit_sharing_${dateRange.start}_to_${dateRange.end}`);
      toast.success(`Exported ${filteredLogs.length} profit sharing records`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export profit sharing data');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (headers: string[], rows: any[][], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    switch (exportType) {
      case 'transactions':
        exportTransactionsToCSV();
        break;
      case 'investments':
        exportInvestmentsToCSV();
        break;
      case 'personal_expenses':
        exportPersonalExpensesToCSV();
        break;
      case 'activity_logs':
        exportActivityLogsToCSV();
        break;
      case 'profit_sharing':
        exportProfitSharingToCSV();
        break;
      default:
        toast.error('Please select a report type');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Export</h1>
        <p className="text-gray-600 mt-1">Export your financial data to CSV format</p>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
            <p className="text-sm text-gray-600">Download your data in CSV format</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={exportType}
              onChange={e => setExportType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="transactions">Transactions</option>
              <option value="investments">Investments</option>
              <option value="personal_expenses">Personal Expenses</option>
              <option value="activity_logs">Activity Logs</option>
              <option value="profit_sharing">Profit Sharing</option>
            </select>
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export to CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-500 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-gray-500">TRANSACTIONS</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">All Transactions</h3>
          <p className="text-xs text-gray-600 mb-3">Revenue, expenses, and transfers</p>
          <button
            onClick={() => {
              setExportType('transactions');
              exportTransactionsToCSV();
            }}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Export Now →
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-500 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-gray-500">INVESTMENTS</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Investment Records</h3>
          <p className="text-xs text-gray-600 mb-3">Capital investments and settlements</p>
          <button
            onClick={() => {
              setExportType('investments');
              exportInvestmentsToCSV();
            }}
            disabled={loading}
            className="text-sm text-green-600 hover:text-green-800 font-medium"
          >
            Export Now →
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-500 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-gray-500">ACTIVITY</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Activity Logs</h3>
          <p className="text-xs text-gray-600 mb-3">Complete user activity history</p>
          <button
            onClick={() => {
              setExportType('activity_logs');
              exportActivityLogsToCSV();
            }}
            disabled={loading}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Export Now →
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Export Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• CSV files can be opened in Excel, Google Sheets, or any spreadsheet software</li>
          <li>• All exports include data from the selected date range</li>
          <li>• Export files are named with the date range for easy identification</li>
          <li>• Activity logs include up to 1000 recent entries</li>
        </ul>
      </div>
    </div>
  );
}
