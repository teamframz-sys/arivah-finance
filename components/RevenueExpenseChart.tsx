'use client';

import { useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface RevenueExpenseChartProps {
  transactions: Transaction[];
}

export default function RevenueExpenseChart({ transactions }: RevenueExpenseChartProps) {
  const chartData = useMemo(() => {
    // Group transactions by month
    const monthlyData: Record<string, { revenue: number; expense: number }> = {};

    transactions.forEach(txn => {
      const date = new Date(txn.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, expense: 0 };
      }

      if (['revenue', 'transfer_in', 'capital_injection'].includes(txn.type)) {
        monthlyData[monthKey].revenue += txn.amount;
      } else if (['expense', 'tax', 'partner_payout', 'transfer_out'].includes(txn.type)) {
        monthlyData[monthKey].expense += txn.amount;
      }
    });

    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expense: data.expense,
        profit: data.revenue - data.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickFormatter={(value) => {
            const [year, month] = value.split('-');
            return `${month}/${year.slice(2)}`;
          }}
        />
        <YAxis
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          labelFormatter={(label) => {
            const [year, month] = label.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          strokeWidth={2}
          name="Revenue"
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          strokeWidth={2}
          name="Expenses"
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#0ea5e9"
          strokeWidth={2}
          name="Profit"
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
