'use client';

import { useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CategoryExpenseChartProps {
  transactions: Transaction[];
}

export default function CategoryExpenseChart({ transactions }: CategoryExpenseChartProps) {
  const chartData = useMemo(() => {
    const categoryData: Record<string, number> = {};

    // Group expenses by category
    transactions.forEach(txn => {
      if (['expense', 'tax'].includes(txn.type)) {
        if (!categoryData[txn.category]) {
          categoryData[txn.category] = 0;
        }
        categoryData[txn.category] += txn.amount;
      }
    });

    // Convert to array and sort by amount
    return Object.entries(categoryData)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 categories
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No expense data available for chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="category"
          width={120}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
        />
        <Bar dataKey="amount" fill="#ef4444" name="Expense Amount" />
      </BarChart>
    </ResponsiveContainer>
  );
}
