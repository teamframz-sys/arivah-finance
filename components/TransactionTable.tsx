'use client';

import { useState } from 'react';
import { Transaction } from '@/lib/types';
import { deleteTransaction } from '@/lib/api/transactions';
import { formatCurrency, formatDate, getTransactionTypeColor } from '@/lib/utils';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: () => void;
}

export default function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    setDeletingId(id);
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted successfully');
      onDelete();
    } catch (error: any) {
      toast.error('Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No transactions found</p>
        <p className="text-sm text-gray-400 mt-1">Add a transaction to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(transaction.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`badge ${getTransactionTypeColor(transaction.type)}`}>
                  {transaction.type.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {transaction.category}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {transaction.description || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                <span className={
                  ['revenue', 'transfer_in', 'capital_injection'].includes(transaction.type)
                    ? 'text-green-600'
                    : 'text-red-600'
                }>
                  {['revenue', 'transfer_in', 'capital_injection'].includes(transaction.type) ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    disabled={deletingId === transaction.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
