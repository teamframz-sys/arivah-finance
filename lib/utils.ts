import { format, startOfMonth, endOfMonth } from 'date-fns';

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy');
}

export function formatDateInput(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd');
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: formatDateInput(startOfMonth(now)),
    end: formatDateInput(endOfMonth(now)),
  };
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getTransactionTypeColor(type: string): string {
  const colors: Record<string, string> = {
    revenue: 'text-green-600 bg-green-50',
    expense: 'text-red-600 bg-red-50',
    transfer_out: 'text-orange-600 bg-orange-50',
    transfer_in: 'text-blue-600 bg-blue-50',
    partner_payout: 'text-purple-600 bg-purple-50',
    capital_injection: 'text-teal-600 bg-teal-50',
    tax: 'text-yellow-600 bg-yellow-50',
    other: 'text-gray-600 bg-gray-50',
  };
  return colors[type] || colors.other;
}

export function getTransactionSign(type: string): number {
  const positiveTypes = ['revenue', 'transfer_in', 'capital_injection'];
  return positiveTypes.includes(type) ? 1 : -1;
}
