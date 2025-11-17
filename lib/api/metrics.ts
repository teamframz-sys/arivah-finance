import { BusinessMetrics, DashboardData } from '@/lib/types';
import { getTransactions } from './transactions';
import { getTransfersBetweenBusinesses } from './transfers';
import { getBusinessByName } from './businesses';
import { getTransactionSign } from '@/lib/utils';

export async function getBusinessMetrics(
  businessId: string,
  startDate?: string,
  endDate?: string
): Promise<BusinessMetrics> {
  const transactions = await getTransactions({
    businessId,
    startDate,
    endDate,
  });

  let totalRevenue = 0;
  let totalExpenses = 0;
  let transferredOut = 0;
  let receivedIn = 0;

  transactions.forEach(txn => {
    const amount = txn.amount;

    switch (txn.type) {
      case 'revenue':
      case 'capital_injection':
        totalRevenue += amount;
        break;
      case 'expense':
      case 'tax':
      case 'partner_payout':
        totalExpenses += amount;
        break;
      case 'transfer_out':
        transferredOut += amount;
        totalExpenses += amount;
        break;
      case 'transfer_in':
        receivedIn += amount;
        totalRevenue += amount;
        break;
    }
  });

  const netProfit = totalRevenue - totalExpenses;

  // Calculate cash balance (all time)
  const allTransactions = await getTransactions({ businessId });
  const cashBalance = allTransactions.reduce((sum, txn) => {
    const sign = getTransactionSign(txn.type);
    return sum + (txn.amount * sign);
  }, 0);

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    transferredOut,
    receivedIn,
    cashBalance,
  };
}

export async function getDashboardData(
  startDate?: string,
  endDate?: string
): Promise<DashboardData> {
  const webDevBusiness = await getBusinessByName('Arivah Web Dev');
  const jewelsBusiness = await getBusinessByName('Arivah Jewels');

  if (!webDevBusiness || !jewelsBusiness) {
    throw new Error('Businesses not found');
  }

  const [webDevMetrics, jewelsMetrics] = await Promise.all([
    getBusinessMetrics(webDevBusiness.id, startDate, endDate),
    getBusinessMetrics(jewelsBusiness.id, startDate, endDate),
  ]);

  // Get transfers from Web Dev to Jewels
  const transfers = await getTransfersBetweenBusinesses(
    webDevBusiness.id,
    jewelsBusiness.id,
    startDate,
    endDate
  );

  const totalTransfers = transfers.reduce((sum, t) => sum + t.amount, 0);

  return {
    webDev: webDevMetrics,
    jewels: jewelsMetrics,
    consolidated: {
      totalRevenue: webDevMetrics.totalRevenue + jewelsMetrics.totalRevenue,
      totalExpenses: webDevMetrics.totalExpenses + jewelsMetrics.totalExpenses,
      netProfit: webDevMetrics.netProfit + jewelsMetrics.netProfit,
      totalTransfers,
    },
  };
}
