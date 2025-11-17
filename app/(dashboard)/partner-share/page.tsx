'use client';

import { useEffect, useState } from 'react';
import { getBusinesses } from '@/lib/api/businesses';
import { calculatePartnerShares, createProfitSharingLog, getProfitSharingLogs, getPartners } from '@/lib/api/partners';
import { getInvestments, settleInvestment, getInvestmentWithSettlements } from '@/lib/api/investments';
import { Business, PartnerShare, ProfitSharingLog, Investment, Partner, InvestmentWithSettlements } from '@/lib/types';
import { formatCurrency, formatDate, formatDateInput } from '@/lib/utils';
import { Users, TrendingUp, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PartnerSharePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [dateRange, setDateRange] = useState({
    start: formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    end: formatDateInput(new Date()),
  });
  const [shares, setShares] = useState<PartnerShare[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [logs, setLogs] = useState<ProfitSharingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [settlingShare, setSettlingShare] = useState<PartnerShare | null>(null);

  // Investment settlement states
  const [unsettledInvestments, setUnsettledInvestments] = useState<Investment[]>([]);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [settlingInvestment, setSettlingInvestment] = useState<Investment | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    loadBusinesses();
    loadLogs();
    loadUnsettledInvestments();
    loadPartners();
  }, []);

  const loadBusinesses = async () => {
    try {
      const data = await getBusinesses();
      setBusinesses(data);
      if (data.length > 0) {
        setSelectedBusiness(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load businesses');
    }
  };

  const loadLogs = async () => {
    try {
      const data = await getProfitSharingLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load logs', error);
    }
  };

  const loadUnsettledInvestments = async () => {
    try {
      const data = await getInvestments({ isSettled: false });
      setUnsettledInvestments(data);
    } catch (error) {
      console.error('Failed to load unsettled investments', error);
    }
  };

  const loadPartners = async () => {
    try {
      const data = await getPartners();
      setPartners(data);
    } catch (error) {
      console.error('Failed to load partners', error);
    }
  };

  const handleCalculate = async () => {
    if (!selectedBusiness) {
      toast.error('Please select a business');
      return;
    }

    setLoading(true);
    try {
      const result = await calculatePartnerShares(
        selectedBusiness,
        dateRange.start,
        dateRange.end
      );
      setShares(result.shares);
      setTotalProfit(result.totalProfit);
    } catch (error: any) {
      toast.error('Failed to calculate shares');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleShare = (share: PartnerShare) => {
    setSettlingShare(share);
    setShowModal(true);
  };

  const handleSaveSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingShare || !selectedBusiness) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await createProfitSharingLog({
        business_id: selectedBusiness,
        period_start_date: dateRange.start,
        period_end_date: dateRange.end,
        total_profit: totalProfit,
        partner_id: settlingShare.partner.id,
        partner_share_amount: settlingShare.shareAmount,
        reinvested_to_other_business_amount: parseFloat(formData.get('reinvested') as string) || 0,
        cash_payout_amount: parseFloat(formData.get('payout') as string) || 0,
        note: formData.get('note') as string || undefined,
        is_settled: true,
      });

      toast.success('Settlement recorded successfully');
      setShowModal(false);
      setSettlingShare(null);
      loadLogs();
    } catch (error) {
      toast.error('Failed to record settlement');
    }
  };

  const handleSettleInvestment = (investment: Investment) => {
    setSettlingInvestment(investment);
    setShowInvestmentModal(true);
  };

  const handleSaveInvestmentSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingInvestment) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Get share amounts for each partner
    const partnerShares = partners.map(partner => {
      const shareAmount = parseFloat(formData.get(`partner_${partner.id}`) as string) || 0;
      return {
        partner_id: partner.id,
        amount: shareAmount,
      };
    }).filter(share => share.amount > 0);

    // Validate total matches investment amount
    const totalShares = partnerShares.reduce((sum, share) => sum + share.amount, 0);
    if (Math.abs(totalShares - settlingInvestment.amount) > 0.01) {
      toast.error(`Total shares (₹${totalShares}) must equal investment amount (₹${settlingInvestment.amount})`);
      return;
    }

    try {
      const notes = formData.get('notes') as string || undefined;
      const settlementDate = formData.get('settlement_date') as string || new Date().toISOString().split('T')[0];

      await settleInvestment(
        settlingInvestment.id,
        partnerShares,
        settlementDate,
        notes
      );

      toast.success('Investment settled successfully');
      setShowInvestmentModal(false);
      setSettlingInvestment(null);
      loadUnsettledInvestments();
      loadLogs();
    } catch (error) {
      console.error('Error settling investment:', error);
      toast.error('Failed to settle investment');
    }
  };

  const selectedBusinessName = businesses.find(b => b.id === selectedBusiness)?.name || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Partner Profit Share</h1>
        <p className="text-gray-600 mt-1">Calculate and track profit distribution</p>
      </div>

      {/* Calculation Form */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary-600" />
          Calculate Shares
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Business</label>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
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
            <label className="label">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCalculate}
              disabled={loading || !selectedBusiness}
              className="btn-primary w-full"
            >
              {loading ? 'Calculating...' : 'Calculate'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {shares.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profit Distribution for {selectedBusinessName}
          </h2>

          <div className="mb-6 p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Profit for Period</p>
            <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
            </p>
          </div>

          <div className="space-y-4">
            {shares.map((share, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-900">{share.partner.name}</p>
                  <p className="text-sm text-gray-600">{share.equityPercentage}% equity</p>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Share Amount</p>
                    <p className={`text-2xl font-bold ${share.shareAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(share.shareAmount)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettleShare(share)}
                    className="btn-primary"
                  >
                    Record Settlement
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investment Settlement Section */}
      {unsettledInvestments.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-orange-600" />
            Unsettled Investments
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Split investments between partners based on their equity percentage
          </p>
          <div className="space-y-4">
            {unsettledInvestments.map((investment) => (
              <div
                key={investment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {investment.user?.name || 'Unknown Investor'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {investment.business?.name} - {formatDate(investment.investment_date)}
                  </p>
                  {investment.description && (
                    <p className="text-xs text-gray-500 mt-1">{investment.description}</p>
                  )}
                </div>
                <div className="mt-3 sm:mt-0 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Investment Amount</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(investment.amount)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettleInvestment(investment)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                  >
                    Settle Investment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlement History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary-600" />
          Settlement History
        </h2>
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No settlements recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Profit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Partner Share</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cash Payout</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reinvested</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.period_start_date)} - {formatDate(log.period_end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.business?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.partner?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      {formatCurrency(log.total_profit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                      {formatCurrency(log.partner_share_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatCurrency(log.cash_payout_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                      {formatCurrency(log.reinvested_to_other_business_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settlement Modal */}
      {showModal && settlingShare && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setShowModal(false)}></div>

            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
                <h2 className="text-xl font-bold text-gray-900">Record Settlement</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveSettlement} className="p-6 space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Partner</p>
                  <p className="text-lg font-semibold text-gray-900">{settlingShare.partner.name}</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {formatCurrency(settlingShare.shareAmount)}
                  </p>
                </div>

                <div>
                  <label className="label">Cash Payout Amount</label>
                  <input
                    type="number"
                    name="payout"
                    step="0.01"
                    min="0"
                    max={settlingShare.shareAmount}
                    defaultValue={settlingShare.shareAmount}
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Amount paid out in cash to partner</p>
                </div>

                <div>
                  <label className="label">Reinvested Amount</label>
                  <input
                    type="number"
                    name="reinvested"
                    step="0.01"
                    min="0"
                    max={settlingShare.shareAmount}
                    defaultValue={0}
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Amount reinvested to other business</p>
                </div>

                <div>
                  <label className="label">Note (Optional)</label>
                  <textarea
                    name="note"
                    className="input"
                    rows={3}
                    placeholder="Add any notes about this settlement..."
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Record Settlement
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Investment Settlement Modal */}
      {showInvestmentModal && settlingInvestment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setShowInvestmentModal(false)}></div>

            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
                <h2 className="text-xl font-bold text-gray-900">Settle Investment</h2>
                <button onClick={() => setShowInvestmentModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveInvestmentSettlement} className="p-6 space-y-6">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600">Investor</p>
                  <p className="text-lg font-semibold text-gray-900">{settlingInvestment.user?.name}</p>
                  <p className="text-sm text-gray-600 mt-1">Business: {settlingInvestment.business?.name}</p>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    {formatCurrency(settlingInvestment.amount)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Split investment between partners:
                  </p>
                  <div className="space-y-3">
                    {partners.map((partner) => {
                      const suggestedAmount = (settlingInvestment.amount * partner.equity_percentage) / 100;
                      return (
                        <div key={partner.id} className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {partner.name} ({partner.equity_percentage}% equity)
                            </label>
                            <input
                              type="number"
                              name={`partner_${partner.id}`}
                              step="0.01"
                              min="0"
                              max={settlingInvestment.amount}
                              defaultValue={suggestedAmount.toFixed(2)}
                              className="input w-full"
                              placeholder="0.00"
                            />
                          </div>
                          <div className="text-xs text-gray-500 min-w-[100px]">
                            Suggested: {formatCurrency(suggestedAmount)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Total must equal {formatCurrency(settlingInvestment.amount)}
                  </p>
                </div>

                <div>
                  <label className="label">Settlement Date</label>
                  <input
                    type="date"
                    name="settlement_date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    className="input"
                    rows={3}
                    placeholder="Add any notes about this settlement..."
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowInvestmentModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex-1"
                  >
                    Settle Investment
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
