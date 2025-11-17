'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '@/lib/types';
import { createTransaction, updateTransaction } from '@/lib/api/transactions';
import { formatDateInput } from '@/lib/utils';
import { notify } from '@/lib/notifications';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: string;
  businessName: string;
  transaction?: Transaction;
}

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' },
  { value: 'partner_payout', label: 'Partner Payout' },
  { value: 'capital_injection', label: 'Capital Injection' },
  { value: 'tax', label: 'Tax' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Cheque', 'Other'];

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  businessId,
  businessName,
  transaction,
}: TransactionModalProps) {
  const [formData, setFormData] = useState({
    date: formatDateInput(new Date()),
    type: 'revenue' as TransactionType,
    category: '',
    amount: '',
    payment_method: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount.toString(),
        payment_method: transaction.payment_method || '',
        description: transaction.description || '',
      });
    } else {
      setFormData({
        date: formatDateInput(new Date()),
        type: 'revenue',
        category: '',
        amount: '',
        payment_method: '',
        description: '',
      });
    }
  }, [transaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        business_id: businessId,
        date: formData.date,
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method || undefined,
        description: formData.description || undefined,
      };

      if (transaction) {
        await updateTransaction(transaction.id, data);
        toast.success('Transaction updated successfully');
        notify.transactionUpdated(data.amount, data.category);
      } else {
        await createTransaction(data);
        toast.success('Transaction created successfully');
        notify.transactionCreated(data.amount, data.category);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {transaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{businessName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Type</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                  className="input"
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  placeholder="e.g., Client Payment, Marketing, Software"
                />
              </div>

              <div>
                <label className="label">Amount (INR)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="label">Payment Method (Optional)</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="input"
              >
                <option value="">Select payment method</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={3}
                placeholder="Add notes about this transaction..."
              ></textarea>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Saving...' : (transaction ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
