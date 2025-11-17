'use client';

import { useEffect, useState } from 'react';
import { getBusinessByName } from '@/lib/api/businesses';
import { Business } from '@/lib/types';
import BusinessFinancePage from '@/components/BusinessFinancePage';

export default function JewelsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      const data = await getBusinessByName('Arivah Jewels');
      setBusiness(data);
    } catch (error) {
      console.error('Failed to load business', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Business not found</p>
      </div>
    );
  }

  return <BusinessFinancePage business={business} />;
}
