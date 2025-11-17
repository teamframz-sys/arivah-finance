'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getBusinesses } from '@/lib/api/businesses';
import { getTransfers, createTransfer } from '@/lib/api/transfers';
import { Business, InterBusinessTransfer } from '@/lib/types';
import { formatCurrency, formatDate, formatDateInput } from '@/lib/utils';
import { ArrowRight, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TransfersPage() {
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [transfers, setTransfers] = useState<InterBusinessTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    from_business_id: '',
    to_business_id: '',
    amount: '',
    date: formatDateInput(new Date()),
    purpose: 'Reinvestment from Web Dev profit to Jewels',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();

    // Check if we should open the create transfer modal
    if (searchParams?.get('action') === 'create') {
      setShowModal(true);
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [businessesData, transfersData] = await Promise.all([
        getBusinesses(),
        getTransfers(),
      ]);
      setBusinesses(businessesData);
      setTransfers(transfersData);

      // Set default from/to businesses (Web Dev -> Jewels)
      if (businessesData.length >= 2) {
        const webDev = businessesData.find(b => b.name === 'Arivah Web Dev');
        const jewels = businessesData.find(b => b.name === 'Arivah Jewels');
        if (webDev && jewels) {
          setFormData(prev => ({
            ...prev,
            from_business_id: webDev.id,
            to_business_id: jewels.id,
          }));
        }
      }
    } catch (error: any) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.from_business_id === formData.to_business_id) {
      toast.error('Source and destination businesses must be different');
      return;
    }

    setCreating(true);
    try {
      await createTransfer({
        from_business_id: formData.from_business_id,
        to_business_id: formData.to_business_id,
        amount: parseFloat(formData.amount),
        date: formData.date,
        purpose: formData.purpose,
      });

      toast.success('Transfer created successfully');
      setShowModal(false);
      setFormData({
        from_business_id: formData.from_business_id,
        to_business_id: formData.to_business_id,
        amount: '',
        date: formatDateInput(new Date()),
        purpose: 'Reinvestment from Web Dev profit to Jewels',
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create transfer');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transfers...</p>
        </div>
      </div>
    );
  }

  const totalTransferred = transfers.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inter-Business Transfers</h1>
          <p className="text-gray-600 mt-1">Track money movement between businesses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Transfer
        </button>
      </div>

      {/* Summary Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transfer Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="metric-label">Total Transfers</p>
            <p className="metric-value">{transfers.length}</p>
          </div>
          <div>
            <p className="metric-label">Total Amount Transferred</p>
            <p className="metric-value text-primary-600">{formatCurrency(totalTransferred)}</p>
          </div>
        </div>
      </div>

      {/* Transfers List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transfer History</h2>
        {transfers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No transfers found</p>
            <p className="text-sm text-gray-400 mt-1">Create a transfer to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(transfer.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{transfer.from_business?.name}</p>
                      <span className="text-xs text-red-600">-{formatCurrency(transfer.amount)}</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{transfer.to_business?.name}</p>
                      <span className="text-xs text-green-600">+{formatCurrency(transfer.amount)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Purpose:</p>
                  <p className="mt-1">{transfer.purpose}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Transfer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setShowModal(false)}></div>

            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
                <h2 className="text-xl font-bold text-gray-900">Create Transfer</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateTransfer} className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">From Business</label>
                    <select
                      required
                      value={formData.from_business_id}
                      onChange={(e) => setFormData({ ...formData, from_business_id: e.target.value })}
                      className="input"
                    >
                      <option value="">Select business</option>
                      {businesses.map((business) => (
                        <option key={business.id} value={business.id}>
                          {business.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">To Business</label>
                    <select
                      required
                      value={formData.to_business_id}
                      onChange={(e) => setFormData({ ...formData, to_business_id: e.target.value })}
                      className="input"
                    >
                      <option value="">Select business</option>
                      {businesses.map((business) => (
                        <option key={business.id} value={business.id}>
                          {business.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Amount (INR)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>

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
                </div>

                <div>
                  <label className="label">Purpose</label>
                  <textarea
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Enter the purpose of this transfer..."
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
